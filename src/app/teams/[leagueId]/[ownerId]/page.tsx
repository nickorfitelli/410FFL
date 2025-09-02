'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Player = {
  id: string;
  name: string;
  pos: string;
  nfl: string;
  number: number | null;
  status: string;
  isStarter: boolean;
  headshot: string;
};

type TeamData = {
  teamName: string;
  avatar: string | null;
  record: { wins: number; losses: number; ties: number; pf: number; pa: number };
  byPos: Record<string, Player[]>;
};

export default function TeamRosterPage() {
  const params = useParams() as { leagueId: string; ownerId: string };
  const [data, setData] = useState<TeamData | null>(null);

  useEffect(() => {
  const run = async () => {
    try {
      const res = await fetch(
        `/api/team?league=${params.leagueId}&owner=${params.ownerId}`
      );
      // ✅ show server error text instead of crashing on .json()
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Roster fetch failed:', err);
      // optionally set an error state and render a message
    }
  };
  run();
}, [params.leagueId, params.ownerId]);

  if (!data) return <div>Loading roster…</div>;

  const sections = ['QB','RB','WR','TE','FLEX','DST','K','DEF'];

  return (
    <div className="items-center gap-4 bg-white p-4 shadow hover:shadow-md transition">
      <header className="flex items-center gap-4">
        {data.avatar && <img src={data.avatar} className="w-12 h-12 rounded-full ring-1 ring-gray-200" alt="" />}
        <div>
          <h1 className="text-2xl font-bold text-black">{data.teamName}</h1>
          <p className="text-sm text-black-600">
            {data.record.wins}-{data.record.losses}{data.record.ties ? `-${data.record.ties}` : ''} •
            {' '}PF {data.record.pf.toFixed(1)} / PA {data.record.pa?.toFixed?.(1) ?? 0}
          </p>
        </div>
      </header>

      {sections.map(pos => {
        const list = data.byPos[pos];
        if (!list?.length) return null;
        return (
          <section key={pos}>
            <h2 className="text-lg font-semibold mb-2 text-black">{pos}</h2>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map(p => (
                <li key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex items-center gap-3">
                  <img src={p.headshot} alt="" className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {p.name}
                      {p.isStarter && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Starter</span>}
                    </div>
                    <div className="text-xs text-gray-600">
                      {p.pos} • {p.nfl || 'FA'} {p.number ? `• #${p.number}` : ''} {p.status ? `• ${p.status}` : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}