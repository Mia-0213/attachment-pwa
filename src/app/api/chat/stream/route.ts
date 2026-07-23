import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, temperature, apiKey, systemPrompt, provider } = body;

    if (!apiKey) {
      return NextResponse.json({ error: { message: "請先至【設定】頁面輸入有效的 API Key" } }, { status: 400 });
    }

    // 解析多組 API Key（支援每行一組、逗號或空白分隔）
    const keys = String(apiKey)
      .split(/[\n,\s]+/)
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

    // 🔄 多 Key 自動輪播與 429 冷卻自動切換重試機制
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];
      let endpoint = "https://api.openai.com/v1/chat/completions";
      let targetModel = model || "gpt-4o-mini";

      if (provider === "gemini") {
        // 全面相容 Google AI Studio 新版 AQ.Ab8 與舊版 AIzaSy 金鑰格式
        endpoint = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${encodeURIComponent(currentKey)}`;
        targetModel = model || "gemini-2.0-flash";
      } else if (provider === "openrouter") {
        endpoint = "https://openrouter.ai/api/v1/chat/completions";
        targetModel = model || "openai/gpt-4o-mini";
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentKey}`,
      };

      if (provider === "gemini") {
        headers["x-goog-api-key"] = currentKey;
      } else if (provider === "openrouter") {
        headers["HTTP-Referer"] = "https://attachment-pwa.vercel.app";
        headers["X-Title"] = "Attachment PWA";
      }

      for (let retry = 0; retry < 2; retry++) {
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

        lastStatus = response.status;
        lastErrorText = await response.text();

        // 若遇 429 且還有下一組 Key，立即無感切換至下一組 Key
        if (response.status === 429 && i < keys.length - 1) {
          console.warn(`[AutoKeyRotation] Key #${i + 1} 觸發頻率限制 (429)。自動切換至 Key #${i + 2}...`);
          break;
        }

        // 若無下一組 Key 且遇 429，自動在背景冷卻 3 秒重試
        if (response.status === 429 && retry === 0) {
          console.warn(`[AutoRetry] 觸發頻率限制 (429)，自動冷卻 3 秒後重試...`);
          await new Promise((res) => setTimeout(res, 3000));
        } else {
          break;
        }
      }
    }

    return NextResponse.json(
      { error: { message: `API 連線失敗 (${lastStatus}): ${lastErrorText}` } },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
