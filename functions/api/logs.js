export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key || key !== env.LOGS_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const listed = await env.VIEWS.list({ prefix: "ip:" });

  const entries = listed.keys.map(k => {
    // key format: ip:{timestamp}:{ip}
    const parts = k.name.split(":");
    const ip = parts.slice(2).join(":");
    const timestamp = parts[1];
    return `${timestamp}  ${ip}`;
  });

  const total = await env.VIEWS.get("hits");
  const body = [
    `Total views: ${total ?? 0}`,
    `Logged IPs: ${entries.length}`,
    "---",
    ...entries
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain" }
  });
}
