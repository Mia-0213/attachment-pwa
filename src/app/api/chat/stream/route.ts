import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, model, temperature, apiKey, systemPrompt, provider } = body;

    if (!apiKey) {
      return NextResponse.json({ error: { message: "請先至【設定】頁面輸入有效的 API Key" } }, { status: 400 });
    }

    // 清除可能複製到的引號與不可見字元
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

    // 🔄 多 Key 輪播與智慧 Provider 自動比對路由引擎
    for (let i = 0; i < keys.length; i++) {
      const currentKey = keys[i];

      // 🧠 自動識別 Key 類別
      let detectedProvider = provider || "openrouter";
      if (currentKey.startsWith("AQ.") || currentKey.startsWith("AIzaSy")) {
        detectedProvider = "gemini";
      } else if (currentKey.startsWith("sk-or-v1")) {
        detectedProvider = "openrouter";
      } else if (currentKey.startsWith("sk-") && !currentKey.startsWith("sk-or-v1")) {
        detectedProvider = "openai";
      }

      // 建立對應服務商的模型優先嘗試隊列 (移除已下架之舊模型)
      const requestedModel = model && model.trim() ? model.trim() : null;
      let modelsToTry: string[] = [];

      if (detectedProvider === "gemini") {
        modelsToTry = Array.from(new Set([requestedModel || "gemini-2.0-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"]));
      } else if (detectedProvider === "openrouter") {
        modelsToTry = Array.from(
          new Set([
            requestedModel || "meta-llama/llama-3.3-70b-instruct:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "qwen/qwen-2.5-72b-instruct:free",
            "deepseek/deepseek-r1:free",
          ])
        );
      } else {
        modelsToTry = [requestedModel || "gpt-4o-mini"];
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
          // 成功連線串流發送
          return new Response(response.body, {
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }

        lastStatus = response.status;
        const errRaw = await response.text();
        try {
          const parsedErr = JSON.parse(errRaw);
          lastErrorText = parsedErr.error?.message || errRaw;
        } catch {
          lastErrorText = errRaw;
        }

        console.warn(`[ProxyError] 服務商 ${detectedProvider} Key #${i + 1} 模型 ${currentModel} 連線回應 ${response.status}: ${lastErrorText}`);

        // 如果是 401 (Invalid Key) 或 402 (Insufficient Credits)，不要嘗試別的模型，直接換下一個 Key 或回傳
        if (response.status === 401 || response.status === 402) {
          break;
        }
      }
    }

    return NextResponse.json(
      {
        error: {
          message: `連線失敗 (${lastStatus}): ${lastErrorText || "若使用付費模型 (如 Claude 3.5 Sonnet)，請確認 OpenRouter 帳號是否有餘額；或至【設定】改用免費模型 meta-llama/llama-3.3-70b-instruct:free。"}`,
        },
      },
      { status: lastStatus }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: `代理伺服器錯誤: ${err.message}` } }, { status: 500 });
  }
}
