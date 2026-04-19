export async function onRequestGet(context) {
  const { request, env } = context;
  const kv = env.VIEWS;

  // Increment global view count
  const current = parseInt((await kv.get("hits")) ?? "0");
  const count = current + 1;
  await kv.put("hits", String(count));

  // Log IP if consent header is present
  const consent = request.headers.get("X-Log-Consent");
  if (consent === "1") {
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const timestamp = new Date().toISOString();
    await kv.put(`ip:${timestamp}:${ip}`, ip);
  }

  return Response.json({ count }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
