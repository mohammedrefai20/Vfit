"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Dumbbell, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";

type VersionSummary = {
  workout_id: string; version: number; name: string; created_at: string;
  total_exercises: number; days: number;
};

export default function WorkoutVersionsPage() {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/workouts/versions/all").then(setVersions).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-surface rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-text-muted mb-4">No workout versions yet.</p>
        <button onClick={() => router.push("/dashboard")} className="text-primary text-sm">
          Generate your first plan →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-4xl font-bold mb-2">Workout Versions</h1>
      <p className="text-text-muted mb-8">
        Your latest {versions.length} plan{versions.length > 1 ? "s are" : " is"} kept for comparison.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        {versions.map((v, i) => (
          <motion.div
            key={v.workout_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-2xl p-6 border ${i === 0 ? "border-primary/40 bg-primary/5" : "border-border bg-surface"}`}
          >
            {i === 0 && (
              <span className="text-xs font-medium text-primary tracking-wide mb-3 block">CURRENT</span>
            )}

            <p className="font-display text-2xl font-bold mb-1">{v.name}</p>
            <p className="text-text-muted text-xs tabular-nums mb-4">v{v.version}</p>

            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Calendar size={14} /> {new Date(v.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <LayoutGrid size={14} /> {v.days}-day split
              </div>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Dumbbell size={14} /> {v.total_exercises} exercises
              </div>
            </div>

            <button onClick={() => router.push(`/workouts/${v.workout_id}`)} className="text-accent text-sm">
              View plan →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}