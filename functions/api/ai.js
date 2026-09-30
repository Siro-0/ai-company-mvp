const MODEL = "gemini-3.8-flash";

const AGENTS = [
  {
    role: "Market Research",
    title: "市場リサーチ部",
    prompt: "市場・競合・既存代替手段を考え、需要がありそうな理由と不確実な点を整理してください。外部検索はできないので、事実と仮説を明確に分けてください。"
  },
  {
    role: "User Research",
    title: "ユーザーリサーチ部",
    prompt: "一般ユーザーが何に困り、何ならお金や時間を払う可能性があるかを仮説化してください。SNSやレビューで後から検証すべき質問も挙げてください。"
  },
  {
    role: "Feasibility",
    title: "実現可能性部",
    prompt: "このアイデアを小さなMVPにする方法を考えてください。必要な技術、API、コスト、スマホ対応、障害になりそうな点を整理してください。"
  },
  {
    role: "Critic",
    title: "批判・リスク部",
    prompt: "このアイデアが失敗する理由をできるだけ厳しく考えてください。AIの思い込みを疑い、検証しないと危険な前提を列挙してください。"
  }
];

async function askGemini(apiKey, system, user) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: {parts:[{text:system}]},
    contents: [{role:"user", parts:[{text:user}]}],
    generationConfig: {maxOutputTokens:900}
  };
  const r = await fetch(url, {
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
  if (!r.ok) {
  const errorText = await r.text();
  throw new Error(`Gemini API ${r.status}: ${errorText}`);
}
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "";
}

export async function onRequestPost({request, env}) {
  if (!env.GEMINI_API_KEY) {
    return Response.json({error:"GEMINI_API_KEY がCloudflareに設定されていません。"}, {status:500});
  }

  let payload;
  try { payload = await request.json(); }
  catch { return Response.json({error:"JSONが不正です。"}, {status:400}); }

  const idea = String(payload.idea || "").trim();
  if (!idea) return Response.json({error:"idea is required"}, {status:400});
  if (idea.length > 4000) return Response.json({error:"アイデアは4000文字以内にしてください。"}, {status:400});

  const base = `あなたはAI会社の一員です。人間の最終決定権を尊重します。
対象アイデア:
${idea}`;

  try {
    const outputs = [];
    for (const a of AGENTS) {
      const output = await askGemini(
        env.GEMINI_API_KEY,
        `役割: ${a.role}\n${a.prompt}\n日本語で簡潔かつ具体的に答えてください。`,
        base
      );
      outputs.push({role:a.role, title:a.title, output});
    }

    const dossier = outputs.map(x=>`【${x.title}】\n${x.output}`).join("\n\n");
    const synthesis = await askGemini(
      env.GEMINI_API_KEY,
      `あなたはAI CEOです。複数部署の報告を統合します。
「作るべき」と断定せず、データ不足なら不足を明示してください。
最後に「推奨する次の小さな実験」「成功判定KPI」「人間が承認すべき事項」を出してください。`,
      `${base}\n\n各部署の報告:\n${dossier}`
    );

    return Response.json({agents:outputs, synthesis});
  } catch (e) {
    return Response.json({error:String(e.message || e)}, {status:502});
  }
}
