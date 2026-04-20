function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

const SKIP = new Set(["logs", "clear", "reset"]);

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "OPTIONS") return new Response(null, { headers: cors() });

  if (request.method === "POST") {
    let body;
    try { body = await request.json(); } catch { return new Response("Bad request", { status: 400 }); }

    const cmd = String(body.command || "").trim().slice(0, 60);
    if (!cmd || SKIP.has(cmd.split(" ")[0])) return Response.json({ ok: true }, { headers: cors() });

    const ip      = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const country = request.headers.get("CF-IPCountry") ?? "XX";
    const ts      = Date.now();

    await env.VIEWS.put(`cmdlog:${ts}:${ip}:${country}:${cmd}`, "1");

    return Response.json({ ok: true }, { headers: cors() });
  }

  return new Response("Method not allowed", { status: 405 });
}
