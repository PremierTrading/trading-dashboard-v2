// src/api.js
const BASE = import.meta.env.VITE_API_BASE;

export async function sendAlert(message) {
  const res = await fetch(`${BASE}/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return res.json();
}

export async function health() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}

export function downloadUrl() {
  return `${BASE}/download-backup`;
}
