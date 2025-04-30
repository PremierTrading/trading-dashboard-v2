// FILE: src/api.js
const API_BASE = import.meta.env.VITE_API_BASE;

if (!API_BASE) {
  console.error(
    "VITE_API_BASE is not defined – did you set it in .env and restart your dev server?"
  );
}

export async function sendTrade(tradeMessage) {
  // we wrap your "message" payload exactly as your webhook expects
  const payload = { message: tradeMessage };

  const resp = await fetch(`${API_BASE}/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Webhook error ${resp.status}: ${text}`);
  }

  return resp.json(); // should be { status: "received" }
}
