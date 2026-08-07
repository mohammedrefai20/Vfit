"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import ProgressCheckIn from "@/components/ProgressCheckIn";

type ProgressEntry = { id: string; weight: number; note: string | null; logged_at: string };

export default function ProgressPage() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/progress").then(setEntries).finally(() => setLoading(false));
  }, []);

  const latest = entries[0];
  const oldest = entries[entries.length - 1];
  const change = latest && oldest && entries.length > 1 ? latest.weight - oldest.weight : null;

  const maxWeight = Math.max(...entries.map((e) => e.weight), 0);
  const minWeight = Math.min(...entries.map((e) => e.weight), maxWeight);
  const range = maxWeight - minWeight || 1;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-4xl font-bold mb-2">Progress</h1>
      <p className="text-text-muted mb-8">Your weekly weight and notes over time.</p>

      <ProgressCheckIn />

      {loading ? (
        <div className="h-40 bg-surface rounded-2xl animate-pulse mb-8" />
      ) : entries.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-2xl border border-border mb-8">
          <Scale size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">No entries yet. Your first check-in will appear here.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <StatCard label="Current" value={`${latest.weight} kg`} />
            <StatCard label="Change" value={change !== null ? `${change > 0 ? "+" : ""}${change.toFixed(1)} kg` : "—"} accent={change !== null && change < 0} />
            <StatCard label="Entries logged" value={String(entries.length)} />
          </div>

          {entries.length > 1 && (
            <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
              <p className="text-text-muted text-xs mb-6">WEIGHT TREND</p>
              <div className="flex items-end gap-2 h-32">
                {[...entries].reverse().map((entry, i) => {
                  const heightPct = ((entry.weight - minWeight) / range) * 80 + 20;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className="flex-1 bg-primary/70 rounded-t-md min-w-[4px]"
                      title={`${entry.weight} kg`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center bg-surface border border-border rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <Calendar size={15} className="text-text-muted" />
                  <span className="text-sm text-text-muted">{new Date(entry.logged_at).toLocaleDateString()}</span>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold tabular-nums">{entry.weight} kg</p>
                  {entry.note && <p className="text-text-muted text-xs">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-surface"}`}>
      <p className="text-text-muted text-xs mb-2">{label.toUpperCase()}</p>
      <p className={`text-2xl font-display font-bold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}