// src/app/api/compare/route.js

export async function GET() {
    const LEAGUE_1_ID = '1258569649763647488'; // Seth
    const LEAGUE_2_ID = '1258181186119794688'; // Tom
    const WEEK = 1; // you can also make this dynamic if needed
  
    const fetchLeague = async (leagueId) => {
      const [rostersRes, usersRes, matchupsRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${WEEK}`),
      ]);
  
      return {
        rosters: await rostersRes.json(),
        users: await usersRes.json(),
        matchups: await matchupsRes.json(),
      };
    };
  
    try {
      const league1Data = await fetchLeague(LEAGUE_1_ID);
      const league2Data = await fetchLeague(LEAGUE_2_ID);
  
      return new Response(JSON.stringify({
        week: WEEK,
        league1: league1Data,
        league2: league2Data,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }