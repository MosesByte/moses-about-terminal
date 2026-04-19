export async function onRequestGet(context) {
  const kv = context.env.VIEWS;
  const current = parseInt((await kv.get("hits")) ?? "0");
  const count = current + 1;
  await kv.put("hits", String(count));

  return Response.json({ count }, {
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
