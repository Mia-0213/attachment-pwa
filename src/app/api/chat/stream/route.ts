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

    // 定義 OpenRouter 100% 可用之熱門免費模型備援鏈
    const openRouterModels = [
      model || "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "qwen/qwen-2.5-72b-instruct:free",
      "deepseek/deepseek-r1:free",
      "google/gemini-2.0-flash-lite-preview-02-05:free",
      "google/gemma-2-9b-it:free",
    ];

    const geminiModels = [model || "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];

    // 🔄 多 Key 輪播與多模型降級備援機制 (Key Rotation + Model Fallback)
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

        console.warn(`[AutoFallback] 服務商 ${provider} 模型 ${currentModel} 回應 ${response.status}: ${lastErrorText}。嘗試下一個備援模型...`);
        // 遇到 404 (Model Not Found) 或 429，自動嘗試下一個備援模型
        continue;
      }
    }

    return NextResponse.json(
      {
        error: {
          message: `OpenRouter 提示 (${lastStatus}): 模型名稱無效或 API Key 未授權。請確認【設定】頁面中的 API Key 是否正確。`,
        },
      },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
