export const revalidate = 3600; // cache for 1 hour (reduce API calls)

async function fetchLeagueData(leagueId) {
  const [usersRes, rostersRes] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`).then(r => r.json()),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then(r => r.json())
  ]);

  // Map users by user_id
  const usersMap = {};
  usersRes.forEach(u => {
    usersMap[u.user_id] = u;
  });

  // Merge roster info with owner info
  return rostersRes.map(roster => {
    const owner = usersMap[roster.owner_id] || {};

    // Sleeper stores fpts (integer part) + fpts_decimal (0–99) for some scoring
    const pfWhole = Number(roster.settings?.fpts ?? 0);
    const pfDec = Number(roster.settings?.fpts_decimal ?? 0) / 100;
    const pointsFor = pfWhole + pfDec;

    return {
      leagueId,                      // ✅ added
      ownerId: roster.owner_id,      // ✅ added
      teamName: owner.metadata?.team_name || owner.display_name || 'Unknown',
      avatar: owner.avatar || null,  // metadata.avatar usually doesn't exist; use user avatar
      wins: Number(roster.settings?.wins ?? 0),
      losses: Number(roster.settings?.losses ?? 0),
      ties: Number(roster.settings?.ties ?? 0),
      pointsFor
    };
  });
}

export async function GET() {
  const leagueIds = ['1258569649763647488', '1258181186119794688'];

  const chunks = await Promise.all(leagueIds.map(id => fetchLeagueData(id)));
  const allTeams = chunks.flat();

  // Sort by wins, then pointsFor
  allTeams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return Response.json(allTeams);
}