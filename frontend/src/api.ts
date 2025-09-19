const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

export async function Register(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Register failed: ${res.statusText}`);
  return res.json();
}

export async function Login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login failed: ${res.statusText}`);
  return res.json();
}

export async function uploadDocument(file: File, token: string) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: fd,
    headers: {
      Authorization: `Bearer ${token}` 
    }
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  return res.json();
}

export async function queryQA(question: string, token: string) {
  const res = await fetch(`${API_BASE}/qa/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ query: question })
  });

  if (!res.ok) throw new Error(`Query failed: ${res.statusText}`);
  return res.json();
}