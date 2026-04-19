export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key || key !== env.LOGS_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const listed = await env.VIEWS.list({ prefix: "ip:" });
  const total  = await env.VIEWS.get("hits");

  const countries = {};
  const entries = listed.keys.map(k => {
    const parts   = k.name.split(":");
    const timestamp = parts[1];
    const country   = parts[2];
    const ip        = parts.slice(3).join(":");
    countries[country] = (countries[country] ?? 0) + 1;
    return `${timestamp}  [${country}]  ${ip}`;
  });

  const countryLines = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `  ${c}  ${n} visit${n !== 1 ? "s" : ""}`)
    .join("\n");

  const body = [
    `Total views : ${total ?? 0}`,
    `Logged IPs  : ${entries.length}`,
    "",
    "--- Countries ---",
    countryLines || "  No data yet",
    "",
    "--- IP Log ---",
    ...entries
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain" }
  });
}
