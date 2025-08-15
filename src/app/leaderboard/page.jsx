'use client';
import { useEffect, useState } from 'react';

export default function LeaderboardPage() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(setTeams);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Combined Leaderboard</h1>

      {/* Mobile: card list */}
      <ul className="md:hidden space-y-3">
        {teams.map((t, i) => (
          <li key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <span className="w-7 text-center text-sm font-semibold text-gray-700">{i + 1}</span>
              {t.avatar && (
                <img
                  src={`https://sleepercdn.com/avatars/thumbs/${t.avatar}`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 leading-tight">{t.teamName}</div>
                <div className="text-xs text-gray-500">
                  {t.wins}-{t.losses}{t.ties ? `-${t.ties}` : ''} • PF {Number(t.pointsFor || 0).toFixed(1)}
                </div>
              </div>
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
                <th className="px-4 py-3 text-center w-28">W‑L‑T</th>
                <th className="px-4 py-3 text-center w-32">PF</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 ? 'bg-white' : 'bg-gray-50/60'
                  } hover:bg-blue-50 transition-colors`}
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
                      <span className="font-medium text-gray-900">{t.teamName}</span>
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