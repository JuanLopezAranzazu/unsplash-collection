export interface User {
  _id: string;
  name: string;
  avatar?: string;
}
export interface Img {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  width: number;
  height: number;
  views: number;
  user: User;
  createdAt: string;
}
export interface Col {
  _id: string;
  name: string;
  description: string;
  images: Img[];
  user: User;
}

export async function api<T = any>(
  url: string,
  opts: RequestInit = {},
): Promise<T> {
  const form = opts.body instanceof FormData;
  const res = await fetch(url, {
    credentials: "include",
    ...opts,
    headers: form
      ? {}
      : { "Content-Type": "application/json", ...opts.headers },
  });
  if (!res.ok)
    throw new Error(
      (await res.json().catch(() => ({}))).error || "Algo salió mal",
    );
  return res.json();
}
export const post = (url: string, body: unknown) =>
  api(url, { method: "POST", body: JSON.stringify(body) });
