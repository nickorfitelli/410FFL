'use client';

import { useEffect, useState } from 'react';

interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar?: string;
}

interface SleeperRoster {
  owner_id: string;
  settings: {
    wins: number;
    losses: number;
  };
  metadata?: {
    team_name?: string;
    team_logo?: string;
  };
}

export default function Home() {
  const [league1, setLeague1] = useState<{ users: SleeperUser[]; rosters: SleeperRoster[] }>({
    users: [],
    rosters: [],
  });
  const [league2, setLeague2] = useState<{ users: SleeperUser[]; rosters: SleeperRoster[] }>({
    users: [],
    rosters: [],
  });

  useEffect(() => {
    fetch('/api/compare')
      .then((res) => res.json())
      .then(
        (data: {
          league1: { users: SleeperUser[]; rosters: SleeperRoster[] };
          league2: { users: SleeperUser[]; rosters: SleeperRoster[] };
        }) => {
          const deduplicate = (users: SleeperUser[]) => {
            const map: Record<string, SleeperUser> = {};
            users.forEach((u) => {
              if (u?.user_id) map[u.user_id] = u;
            });
            return Object.values(map);
          };
  
          setLeague1({
            users: deduplicate(data.league1.users || []),
            rosters: data.league1.rosters || [],
          });
  
          setLeague2({
            users: deduplicate(data.league2.users || []),
            rosters: data.league2.rosters || [],
          });
        }
      )
      .catch(console.error);
  }, []);

  const renderLeague = (
    label: string,
    users: SleeperUser[],
    rosters: SleeperRoster[]
  ) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{label}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {users.map((user) => {
          const roster = rosters.find((r) => r.owner_id === user.user_id);
  
          const wins = roster?.settings?.wins ?? 0;
          const losses = roster?.settings?.losses ?? 0;
          const teamName =
            roster?.metadata?.team_name || user.display_name || 'Unnamed Team';
          const teamLogo = roster?.metadata?.team_logo
            ? roster.metadata.team_logo
            : user.avatar
            ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
            : null;
  
          return (
            <li
              key={user.user_id}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow hover:shadow-md transition"
            >
              {teamLogo ? (
                <img
                  src={teamLogo}
                  alt={`${teamName} logo`}
                  className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}
              <div className="flex flex-col">
                <span className="text-base font-semibold text-gray-900">
                  {teamName}
                </span>
                <span className="text-sm text-gray-500">
                  {wins}–{losses} record
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
  <div className="min-h-screen bg-gray-100 p-4">
    <h1 className="text-3xl font-bold mb-8 text-gray-900">All Teams by League</h1>
    {renderLeague('League 1', league1.users, league1.rosters)}
    {renderLeague('League 2', league2.users, league2.rosters)}
  </div>
);
}