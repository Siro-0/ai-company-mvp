const idea = document.querySelector("#idea");
const run = document.querySelector("#run");
const status = document.querySelector("#status");
const results = document.querySelector("#results");

function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function renderAgent(title, body, badge="AI"){
  return `<article class="agent"><span class="badge">${escapeHtml(badge)}</span><h2>${escapeHtml(title)}</h2><div>${escapeHtml(body).replace(/\n/g,"<br>")}</div></article>`;
}

run.addEventListener("click", async () => {
  const text = idea.value.trim();
  if (!text) return;
  run.disabled = true;
  results.innerHTML = "";
  status.textContent = "AI組織が調査・発案・検証しています…";

  try {
    const r = await fetch("/api/ai", {
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({idea:text})
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "API error");

    for (const a of data.agents || []) {
      results.insertAdjacentHTML("beforeend", renderAgent(a.title, a.output, a.role));
    }
    results.insertAdjacentHTML("beforeend",
      `<article class="agent final"><span class="badge">AI CEO</span><h2>最終提案</h2><pre>${escapeHtml(data.synthesis || "")}</pre></article>`
    );
    status.textContent = "完了。最終承認はあなたが行います。";
  } catch(e) {
    status.textContent = "エラー: " + e.message;
  } finally {
    run.disabled = false;
  }
});
