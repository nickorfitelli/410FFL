// src/app/api/compare/route.js

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const league1 = searchParams.get("league1");
    const league2 = searchParams.get("league2");
    const week = searchParams.get("week");
  
    const fetchLeague = async (leagueId) => {
      const [rostersRes, usersRes, matchupsRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`),
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`),
      ]);
  
      return {
        rosters: await rostersRes.json(),
        users: await usersRes.json(),
        matchups: await matchupsRes.json(),
      };
    };
  
    try {
      const league1Data = await fetchLeague(league1);
      const league2Data = await fetchLeague(league2);
  
      return new Response(JSON.stringify({
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