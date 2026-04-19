export async function onRequestGet(context) {
  const { request, env } = context;
  const kv = env.VIEWS;

  const current = parseInt((await kv.get("hits")) ?? "0");
  const count = current + 1;
  await kv.put("hits", String(count));

  const consent = request.headers.get("X-Log-Consent");
  if (consent === "1") {
    const ip      = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const country = request.headers.get("CF-IPCountry") ?? "XX";
    const timestamp = new Date().toISOString();
    await kv.put(`ip:${timestamp}:${country}:${ip}`, "1");
  }

  return Response.json({ count }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
