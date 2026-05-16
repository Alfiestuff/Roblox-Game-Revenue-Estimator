import { estimate } from "./estimate.js";
import { fmt, usd } from "./utils.js";

const f = document.getElementById("f");
const q = document.getElementById("q");
const btn = document.getElementById("btn");
const err = document.getElementById("err");
const out = document.getElementById("out");

function drawGraph(canvas, data) {
  const ctx = canvas.getContext("2d");
  const w = (canvas.width = 520);
  const h = (canvas.height = 160);

  const max = Math.max(...data);
  const min = Math.min(...data);

  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();

  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;

    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });

  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
}

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
        ${d.iconUrl ? `<img src="${d.iconUrl}" />` : ""}
        <div>
          <h2>${d.name}</h2>
          <p>by ${d.creator}</p>
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
        <div class="row"><span class="lbl">CCU</span><span class="val">${fmt(d.playing)}</span></div>
        <div class="row"><span class="lbl">DAU</span><span class="val">${fmt(d.dau)}</span></div>
        <div class="row"><span class="lbl">Engagement</span><span class="val">${(d.engagementScore * 100).toFixed(1)}%</span></div>
        <div class="row"><span class="lbl">Retention</span><span class="val">${(d.retention * 100).toFixed(1)}%</span></div>
        <div class="row"><span class="lbl">Avg Playtime</span><span class="val">${d.avgPlaytimeMinutes.toFixed(1)} min</span></div>
        <div class="row"><span class="lbl">Sessions/day</span><span class="val">${fmt(d.sessionsPerDay)}</span></div>
      </div>

      <div class="group">
        <canvas id="ccuGraph"></canvas>
      </div>
    `;

    out.hidden = false;

    setTimeout(() => {
      drawGraph(
        document.getElementById("ccuGraph"),
        d.ccuHistory
      );
    }, 0);
  } catch (e) {
    err.textContent = e.message || String(e);
    err.hidden = false;
  } finally {
    btn.disabled = false;
    btn.textContent = "Estimate";
  }
});