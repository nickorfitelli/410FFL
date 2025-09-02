export const revalidate = 604800; // cache for 7 days

export async function GET() {
  const res = await fetch('https://api.sleeper.app/v1/players/nfl', {
    // Let Next cache this response based on "revalidate" above
    next: { revalidate },
  });
  const players = await res.json();

  // Trim to essentials so you don’t ship 10–20MB to the client
  const trimmed = {};
  for (const [id, p] of Object.entries(players)) {
    trimmed[id] = {
      id,
      name:
        p.full_name ||
        (p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.first_name || p.last_name || id),
      pos: p.position || '',
      nfl: p.team || '',
      number: p.number ?? null,
      status: p.status || '',
    };
  }

  return Response.json(trimmed);
}