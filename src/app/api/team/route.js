export const revalidate = 60 * 60 * 6; // 6h

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const league = searchParams.get('league');
  const owner = searchParams.get('owner');

  if (!league || !owner) {
    return Response.json({ error: 'league and owner are required' }, { status: 400 });
  }

  // Derive absolute origin for internal fetches (works in dev + prod)
  const { origin } = new URL(req.url);

  try {
    // Small Sleeper calls (Next will cache due to revalidate above)
    const [users, rosters] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${league}/users`, {
        next: { revalidate }
      }).then(r => r.json()),
      fetch(`https://api.sleeper.app/v1/league/${league}/rosters`, {
        next: { revalidate }
      }).then(r => r.json()),
    ]);

    const roster = rosters.find(r => String(r.owner_id) === String(owner));
    if (!roster) {
      return Response.json({ error: 'Roster not found' }, { status: 404 });
    }

    const userMap = Object.fromEntries(users.map(u => [u.user_id, u]));
    const ownerUser = userMap[owner] || {};
    const teamName = ownerUser?.metadata?.team_name?.trim() || ownerUser?.display_name || 'Unnamed Team';
    const avatar = ownerUser?.avatar ? `https://sleepercdn.com/avatars/thumbs/${ownerUser.avatar}` : null;

    // Pull the cached, trimmed players map from your internal route (absolute URL!)
    const playersRes = await fetch(`${origin}/api/players`, { cache: 'force-cache' });
    if (!playersRes.ok) {
      const txt = await playersRes.text();
      return Response.json({ error: `players fetch failed: ${txt}` }, { status: 500 });
    }
    const players = await playersRes.json();

    const playerIds = roster.players || [];
    const starters = roster.starters || [];
    const list = playerIds.map(pid => {
      const p = players[pid] || {};
      return {
        id: pid,
        name: p.name || pid,
        pos: p.pos || '',
        nfl: p.nfl || '',
        number: p.number ?? null,
        status: p.status || '',
        isStarter: starters.includes(pid),
        headshot: `https://sleepercdn.com/content/nfl/players/${pid}.jpg`,
      };
    });

    const byPos = list.reduce((acc, p) => {
      const key = p.pos || 'OTHER';
      (acc[key] ||= []).push(p);
      return acc;
    }, {});

    // Points for/against with decimal
    const pf = (Number(roster.settings?.fpts ?? 0) + Number(roster.settings?.fpts_decimal ?? 0) / 100);
    const pa = (Number(roster.settings?.fpts_against ?? 0) + Number(roster.settings?.fpts_against_decimal ?? 0) / 100);

    return Response.json({
      league,
      owner,
      teamName,
      avatar,
      record: {
        wins: Number(roster.settings?.wins ?? 0),
        losses: Number(roster.settings?.losses ?? 0),
        ties: Number(roster.settings?.ties ?? 0),
        pf,
        pa,
      },
      byPos,
    });
  } catch (err) {
    // Always return JSON, never an empty/HTML response
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
}