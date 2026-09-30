async function askGemini(apiKey, system, user) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    systemInstruction: {
      parts: [{ text: system }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: user }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 900
    }
  };

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (r.ok) {
      const j = await r.json();

      return j.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("") || "";
    }

    const errorText = await r.text();

    // Geminiが混雑している場合だけリトライ
    if (r.status === 503 && attempt < maxRetries) {
      const waitMs = 3000 * Math.pow(2, attempt);

      await new Promise(resolve => {
        setTimeout(resolve, waitMs);
      });

      continue;
    }

    throw new Error(
      `Gemini API ${r.status}: ${errorText}`
    );
  }
}
