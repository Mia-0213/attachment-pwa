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

    // 模型降級備援清單
    const geminiModels = [model || "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];
    const openRouterModels = [
      model || "google/gemini-2.0-flash-exp:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemma-2-9b-it:free",
    ];

    // 🔄 多階層終極備援連線引擎 (Multi-Tier Self-Healing Engine)
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];

      let modelsToTry = [model || "gpt-4o-mini"];
      if (provider === "gemini") {
        modelsToTry = geminiModels;
      } else if (provider === "openrouter") {
        modelsToTry = openRouterModels;
      }

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
        console.warn(`[MultiTierFallback] Key #${i + 1} 服務商 ${provider} 模型 ${currentModel} 回應 ${response.status}: ${lastErrorText}。嘗試切換下一個模型/Key...`);
      }
    }

    return NextResponse.json(
      {
        error: {
          message: `目前所有模型連線忙碌中 (${lastStatus})。請確認在【設定】貼入的 API Key 是否正確，或直接在對話框輸入新訊息重新發送。`,
        },
      },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
