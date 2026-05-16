import { PROXY } from "./utils.js";

export async function jget(url) {
  const r = await fetch(PROXY + encodeURIComponent(url));
  if (!r.ok) throw new Error("Request failed: " + url);
  return r.json();
}