function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: cors() });
  }

  const kv = env.VIEWS;

  if (request.method === "GET") {
    const raw     = await kv.get("gb:entries");
    const entries = raw ? JSON.parse(raw) : [];
    return Response.json([...entries].reverse(), { headers: cors() });
  }

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); }
    catch { return new Response("Bad request", { status: 400 }); }

    const name = String(body.name    || "").trim().slice(0, 30);
    const msg  = String(body.message || "").trim().slice(0, 200);

    if (!name || !msg) {
      return new Response("Name and message required", { status: 400 });
    }

    const raw     = await kv.get("gb:entries");
    const entries = raw ? JSON.parse(raw) : [];
    entries.push({ name, message: msg, ts: Date.now() });
    await kv.put("gb:entries", JSON.stringify(entries));

    return Response.json({ ok: true }, { headers: cors() });
  }

  if (request.method === "DELETE") {
    const url  = new URL(request.url);
    const key  = url.searchParams.get("key");
    const name = url.searchParams.get("name");

    if (!key || key !== env.LOGS_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!name) {
      return new Response("Name required", { status: 400 });
    }

    const raw      = await kv.get("gb:entries");
    const entries  = raw ? JSON.parse(raw) : [];
    const filtered = entries.filter(e => e.name.toLowerCase() !== name.toLowerCase());
    const removed  = entries.length - filtered.length;
    await kv.put("gb:entries", JSON.stringify(filtered));

    return Response.json({ ok: true, removed }, { headers: cors() });
  }

  return new Response("Method not allowed", { status: 405 });
}
