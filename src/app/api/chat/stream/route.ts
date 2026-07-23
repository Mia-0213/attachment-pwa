import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, temperature, apiKey, systemPrompt, provider } = body;

    if (!apiKey) {
      return NextResponse.json({ error: { message: "請先至【設定】頁面輸入有效的 API Key" } }, { status: 400 });
    }

    // 解析多組 API Key（支援每行一組或逗號分隔）
    const keys = String(apiKey)
      .split(/[\n,]+/)
      .map((k) => k.trim())
      .filter(Boolean);

    if (keys.length === 0) {
      return NextResponse.json({ error: { message: "請輸入至少一組有效的 API Key" } }, { status: 400 });
    }

    const payloadMessages = [];
    if (systemPrompt) {
      payloadMessages.push({ role: "system", content: systemPrompt });
    }
    payloadMessages.push(...messages.map((m: any) => ({ role: m.role, content: m.content })));

    let lastErrorText = "";
    let lastStatus = 500;

    // 🔄 多 Key 自動無感輪播機制 (Auto Key Rotation)
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      let endpoint = "https://api.openai.com/v1/chat/completions";
      let targetModel = model || "gpt-4o-mini";

      if (provider === "gemini") {
        endpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        targetModel = model || "gemini-2.0-flash";
      } else if (provider === "openrouter") {
        endpoint = "https://openrouter.ai/api/v1/chat/completions";
        targetModel = model || "openai/gpt-4o-mini";
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentKey}`,
      };

      if (provider === "openrouter") {
        headers["HTTP-Referer"] = "https://attachment-pwa.vercel.app";
        headers["X-Title"] = "Attachment PWA";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: targetModel,
          messages: payloadMessages,
          temperature: temperature ?? 0.9,
          stream: true,
        }),
      });

      if (response.ok && response.body) {
        // 連線成功！傳回串流給瀏覽器
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }

      // 如果遇到限流、額度用盡或錯誤，自動嘗試下一組 Key
      lastStatus = response.status;
      lastErrorText = await response.text();
      console.warn(`[AutoKeyRotation] Key #${i + 1} 連線失敗 (${response.status}): ${lastErrorText}。嘗試下一組 Key...`);
    }

    return NextResponse.json(
      { error: { message: `所有 API Key 均連線失敗 (${lastStatus}): ${lastErrorText}` } },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
