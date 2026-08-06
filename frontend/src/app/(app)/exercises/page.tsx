"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

type ExerciseSummary = { id: string; name: string; primary_muscles: string; equipment: string; difficulty: string };

const CATEGORIES = ["All", "Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Cardio"];

export default function ExerciseLibraryPage() {
  const [exercises, setExercises] = useState<ExerciseSummary[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/exercises").then(setExercises).finally(() => setLoading(false));
  }, []);

  const filtered = category === "All"
    ? exercises
    : exercises.filter((e) => e.primary_muscles.toLowerCase().includes(category.toLowerCase()));

  return (
    <div className="max-w-6xl">
      <h1 className="font-display text-4xl font-bold mb-2">Exercise Library</h1>
      <p className="text-text-muted mb-8">{exercises.length} exercises, curated from strength & conditioning references.</p>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
              category === c ? "bg-primary text-white" : "bg-surface text-text-muted border border-border"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-surface rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted">No exercises found in this category yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filtered.map((ex, i) => (
            <motion.button
              key={ex.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -3 }}
              onClick={() => router.push(`/exercises/${ex.id}`)}
              className="text-left rounded-2xl p-5 border border-border bg-surface"
            >
              <h3 className="font-display font-semibold mb-2">{ex.name}</h3>
              <p className="text-text-muted text-sm mb-3">{ex.primary_muscles}</p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-white/5 text-text-muted">{ex.equipment}</span>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{ex.difficulty}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}