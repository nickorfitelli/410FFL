'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setTeams);
  }, []);

  const getBadge = (rank) => {
    if (rank === 1) return <span className="ml-2 text-yellow-500">🥇</span>;
    if (rank === 2) return <span className="ml-2 text-gray-400">🥈</span>;
    if (rank === 3) return <span className="ml-2 text-amber-700">🥉</span>;
    return null;
  };

  return (
    <div className="space-y-4">

      {/* Mobile: card list */}
      <ul className="md:hidden ">
        {teams.map((t, i) => (
          <li key={i} className="bg-white shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3">
              {t.avatar && (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${t.avatar}`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <Link href={`/teams/${t.leagueId}/${t.ownerId}`} className="font-medium text-gray-900 hover:underline">
                       {t.teamName}
                       </Link>
              <div className="flex-1 flex items-center">
                {getBadge(i + 1)}
              </div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {t.wins}-{t.losses}{t.ties ? `-${t.ties}` : ''} • PF {Number(t.pointsFor || 0).toFixed(1)}
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="text-gray-600">
                <th className="px-4 py-3 text-left w-14">Rank</th>
                <th className="px-4 py-3 text-left">Team</th>
                <th className="px-4 py-3 text-center w-28">W-L-T</th>
                <th className="px-4 py-3 text-center w-32">PF</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr
                  key={i}
                  className={`${i % 2 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-3 font-semibold text-gray-700">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {t.avatar && (
                        <img
                          src={`https://sleepercdn.com/avatars/thumbs/${t.avatar}`}
                          alt=""
                          className="w-8 h-8 rounded-full ring-1 ring-gray-200"
                        />
                      )}
                      <Link href={`/teams/${t.leagueId}/${t.ownerId}`} className="font-medium text-gray-900 hover:underline">
                       {t.teamName}
                       </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-gray-900">
                    {t.wins}-{t.losses}{t.ties ? `-${t.ties}` : ''}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {Number(t.pointsFor || 0).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}