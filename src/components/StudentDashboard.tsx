import { useEffect, useState } from "react";
import { fetchRecommendations } from "../services/api";

type Rec = { internship_id: number; title: string; match_score: number };

export default function StudentDashboard() {
  const [recs, setRecs] = useState<Array<Rec>>([]);
  useEffect(() => {
    fetchRecommendations().then((r) => setRecs(r.items));
  }, []);

  return (
    <div className="p-6 md:p-8 transition-all duration-300 ease-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-secondary mt-1">Discover internships tailored to your profile.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111827]">
            <div className="text-sm text-secondary">Matches</div>
            <div className="mt-1 text-2xl font-semibold">{recs.length}</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111827]">
            <div className="text-sm text-secondary">Applications</div>
            <div className="mt-1 text-2xl font-semibold">—</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111827]">
            <div className="text-sm text-secondary">Messages</div>
            <div className="mt-1 text-2xl font-semibold">—</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#111827]">
            <div className="text-sm text-secondary">Match Score (avg)</div>
            <div className="mt-1 text-2xl font-semibold">{recs[0]?.match_score ?? '—'}%</div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm dark:bg-[#0f172a]">
          <h2 className="text-lg font-semibold">Top Recommendations</h2>
          <ul className="mt-3 space-y-3">
            {recs.map((it) => (
              <li key={it.internship_id} className="flex items-center justify-between rounded-xl border p-4 bg-white dark:bg-[#111827]">
                <div>
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm text-secondary">AI match</div>
                </div>
                <span className="rounded-lg bg-green-50 px-3 py-1 text-green-600 text-sm font-semibold">
                  {it.match_score}% Match
                </span>
              </li>
            ))}
            {recs.length === 0 && <li className="text-secondary">No recommendations yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
