import { estimate } from "./estimate.js";
import { fmt, usd } from "./utils.js";

const f = document.getElementById("f");
const q = document.getElementById("q");
const btn = document.getElementById("btn");
const err = document.getElementById("err");
const out = document.getElementById("out");

f.addEventListener("submit", async e => {
  e.preventDefault();

  const val = q.value.trim();
  if (!val) return;

  err.hidden = true;
  out.hidden = true;

  btn.disabled = true;
  btn.textContent = "…";

  try {
    const d = await estimate(val);

    out.innerHTML = `
      <div class="game">
        ${d.iconUrl ? `<img src="${d.iconUrl}" alt="">` : ""}
        <div>
          <h2>${d.name.replace(/</g, "&lt;")}</h2>
          <p>by ${d.creator.replace(/</g, "&lt;")}</p>
        </div>
      </div>

      <div class="group big">
        <div class="row"><span class="lbl">Monthly</span><span class="val">${usd(d.monthlyUSD)}</span></div>
      </div>

      <div class="group mid">
        <div class="row"><span class="lbl">Daily</span><span class="val">${usd(d.dailyUSD)}</span></div>
        <div class="row"><span class="lbl">Lifetime</span><span class="val">${usd(d.lifetimeUSD)}</span></div>
      </div>

      <div class="group small">
        <div class="row"><span class="lbl">Playing</span><span class="val">${fmt(d.playing)}</span></div>
        <div class="row"><span class="lbl">Visits</span><span class="val">${fmt(d.visits)}</span></div>
      </div>
    `;

    out.hidden = false;
  } catch (e) {
    err.textContent = e.message || String(e);
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Estimate";
  }
});