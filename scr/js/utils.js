export const PROXY = "https://corsproxy.io/?url=";
export const DEVEX = 3.5 / 1000;

export const fmt = n => n.toLocaleString("en-US");

export const usd = n =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export function extractPlaceId(s) {
  s = s.trim();
  if (/^\d+$/.test(s)) return s;
  const m = s.match(/games\/(\d+)/i);
  return m ? m[1] : null;
}