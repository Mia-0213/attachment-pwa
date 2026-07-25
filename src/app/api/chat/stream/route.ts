import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, temperature, apiKey, systemPrompt, provider } = body;

    if (!apiKey) {
      return NextResponse.json({ error: { message: "請先至【設定】頁面輸入有效的 API Key" } }, { status: 400 });
    }

    // 清除可能複製到的引號與空白，並解析多組 Key
    const keys = String(apiKey)
      .replace(/["']/g, "")
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

    // 🔄 多 Key 輪播與智慧 Key 類型自動辨識與路由引擎
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];

      // 🧠 自動智慧識別 Key 種類
      let detectedProvider = provider || "openrouter";
      if (currentKey.startsWith("AQ.") || currentKey.startsWith("AIzaSy")) {
        detectedProvider = "gemini";
      } else if (currentKey.startsWith("sk-or-v1")) {
        detectedProvider = "openrouter";
      } else if (currentKey.startsWith("sk-") && !currentKey.startsWith("sk-or-v1")) {
        detectedProvider = "openai";
      }

      // 根據辨識出來的真實服務商，定義對應的最佳備援模型鏈
      let modelsToTry = [model || "gpt-4o-mini"];
      if (detectedProvider === "gemini") {
        modelsToTry = [model || "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"];
      } else if (detectedProvider === "openrouter") {
        modelsToTry = [
          model || "meta-llama/llama-3.3-70b-instruct:free",
          "meta-llama/llama-3.3-70b-instruct:free",
          "qwen/qwen-2.5-72b-instruct:free",
          "deepseek/deepseek-r1:free",
          "google/gemma-2-9b-it:free",
        ];
      }

      for (const currentModel of modelsToTry) {
        let endpoint = "https://api.openai.com/v1/chat/completions";

        if (detectedProvider === "gemini") {
          endpoint = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${encodeURIComponent(currentKey)}`;
        } else if (detectedProvider === "openrouter") {
          endpoint = "https://openrouter.ai/api/v1/chat/completions";
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentKey}`,
        };

        if (detectedProvider === "gemini") {
          headers["x-goog-api-key"] = currentKey;
        } else if (detectedProvider === "openrouter") {
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

        console.warn(`[SmartAutoDetect] 識別為 ${detectedProvider} Key #${i + 1} 模型 ${currentModel} 回應 ${response.status}: ${lastErrorText}。嘗試切換下一模型...`);
        continue;
      }
    }

    return NextResponse.json(
      {
        error: {
          message: `OpenRouter 連線失敗 (${lastStatus})。請確認在 OpenRouter 後台生成的 Key 是否仍有權限，或點擊 Create Key 重新生成一組。`,
        },
      },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
