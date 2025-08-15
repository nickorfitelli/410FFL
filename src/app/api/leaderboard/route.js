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
    return {
      teamName: owner.metadata?.team_name || owner.display_name || 'Unknown',
      avatar: owner.metadata?.avatar || owner.avatar || null,
      wins: roster.settings?.wins || 0,
      losses: roster.settings?.losses || 0,
      ties: roster.settings?.ties || 0,
      pointsFor: roster.settings?.fpts || 0
    };
  });
}
    
export async function GET() {
  const leagueIds = [
    '1258569649763647488',
    '1258181186119794688'
  ];

  let allTeams = [];
  for (const id of leagueIds) {
    const leagueData = await fetchLeagueData(id);
    allTeams = allTeams.concat(leagueData);
  }

  // Sort by wins, then pointsFor
  allTeams.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return Response.json(allTeams);
}