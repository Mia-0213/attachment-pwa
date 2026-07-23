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

    // 定義 Gemini 模型自動降級切換鏈 (2.0-flash -> 1.5-flash -> 2.0-flash-lite)
    const geminiModels = [model || "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];

    // 🔄 多 Key 輪播與多模型降級備援機制 (Key Rotation + Model Fallback)
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];

      const modelsToTry = provider === "gemini" ? geminiModels : [model || "gpt-4o-mini"];

      for (const currentModel of modelsToTry) {
        let endpoint = "https://api.openai.com/v1/chat/completions";

        if (provider === "gemini") {
          endpoint = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${encodeURIComponent(currentKey)}`;
        } else if (provider === "openrouter") {
          endpoint = "https://openrouter.ai/api/v1/chat/completions";
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

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: currentModel,
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

        // 若遇到 429 (Resource Exhausted)，嘗試下一個模型或下一組 Key
        if (response.status === 429) {
          console.warn(`[AutoFallback] 模型 ${currentModel} 觸發 429 限流。嘗試自動備援切換...`);
          continue; // 嘗試列表中的下一個模型
        }
      }
    }

    return NextResponse.json(
      {
        error: {
          message: `Google Gemini 免費額度暫時冷卻中 (429)。系統已為您嘗試所有備援 Key 與模型。請等待約 20~30 秒，或至【設定】將服務商切換為 OpenRouter。`,
        },
      },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
