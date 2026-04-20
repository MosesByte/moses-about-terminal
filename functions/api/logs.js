const COUNTRY_NAMES = {
  AF:"Afghanistan",AL:"Albania",DZ:"Algeria",AR:"Argentina",AU:"Australia",
  AT:"Austria",BE:"Belgium",BR:"Brazil",CA:"Canada",CL:"Chile",CN:"China",
  CO:"Colombia",HR:"Croatia",CZ:"Czech Republic",DK:"Denmark",EG:"Egypt",
  FI:"Finland",FR:"France",DE:"Germany",GR:"Greece",HK:"Hong Kong",
  HU:"Hungary",IN:"India",ID:"Indonesia",IE:"Ireland",IL:"Israel",
  IT:"Italy",JP:"Japan",KR:"South Korea",MX:"Mexico",NL:"Netherlands",
  NZ:"New Zealand",NO:"Norway",PL:"Poland",PT:"Portugal",RO:"Romania",
  RU:"Russia",SA:"Saudi Arabia",RS:"Serbia",SG:"Singapore",ZA:"South Africa",
  ES:"Spain",SE:"Sweden",CH:"Switzerland",TW:"Taiwan",TH:"Thailand",
  TR:"Turkey",UA:"Ukraine",AE:"UAE",GB:"United Kingdom",US:"United States",
  VN:"Vietnam",T1:"Tor Exit Node"
};

function countryName(code) {
  return COUNTRY_NAMES[code] ?? code;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key || key !== env.LOGS_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ownerIp = env.OWNER_IP ?? null;

  const [ipListed, cmdListed, total] = await Promise.all([
    env.VIEWS.list({ prefix: "ip:" }),
    env.VIEWS.list({ prefix: "cmdlog:" }),
    env.VIEWS.get("hits"),
  ]);

  const countries  = {};
  const ipEntries  = [];
  let   ownerCount = 0;

  for (const k of ipListed.keys) {
    const parts   = k.name.split(":");
    const ts      = parseInt(parts[1]);
    const country = parts[2];
    const ip      = parts.slice(3).join(":");

    if (ownerIp && ip === ownerIp) { ownerCount++; continue; }

    countries[country] = (countries[country] ?? 0) + 1;
    ipEntries.push({
      ts,
      time: isNaN(ts) ? "?" : new Date(ts).toISOString().replace("T"," ").slice(0,19),
      ip,
      country,
      countryName: countryName(country),
    });
  }

  const cmdEntries = [];
  for (const k of cmdListed.keys) {
    const parts   = k.name.split(":");
    const ts      = parseInt(parts[1]);
    const country = parts[2];
    const ip      = parts.slice(3, -1).join(":");
    const command = parts[parts.length - 1];

    if (ownerIp && ip === ownerIp) continue;

    cmdEntries.push({ ts, ip, country, countryName: countryName(country), command });
  }

  if (url.searchParams.get("format") === "json") {
    return Response.json({
      totalViews: parseInt(total ?? "0"),
      ownerVisits: ownerCount,
      ipEntries,
      cmdEntries,
      countries: Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => ({ code, name: countryName(code), count })),
    }, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // legacy plain-text format
  const countryLines = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `  ${countryName(c).padEnd(20)} ${n} visit${n !== 1 ? "s" : ""}`)
    .join("\n");

  const ipLines = ipEntries
    .map(e => `${e.time}  ${e.ip.padEnd(40)}  ${countryName(e.country)}`)
    .join("\n");

  const ownerLine = ownerIp ? `Owner visits: ${ownerCount} (filtered from stats)` : null;

  const body = [
    `Total views : ${total ?? 0}`,
    `Logged IPs  : ${ipEntries.length}`,
    ownerLine,
    "",
    "--- Countries ---",
    countryLines || "  No data yet",
    "",
    "--- IP Log ---",
    ipLines || "  No data yet"
  ].filter(l => l !== null).join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
