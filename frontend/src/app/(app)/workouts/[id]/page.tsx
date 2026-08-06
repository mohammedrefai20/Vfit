"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";

type Exercise = {
  workout_exercise_id: string; name: string; sets: number; reps: number;
  primary_muscles: string; alternatives: { id: string; name: string }[];
};
type Day = { day_number: number; exercises: Exercise[] };
type WorkoutDetail = { workout_id: string; version: number; name: string; days: Day[] };

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function load() {
    api.get(`/workouts/${id}`).then(setWorkout).catch(() => {});
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function handleReplace(workoutExerciseId: string, newExerciseId: string) {
    setMessage("");
    try {
      const result = await api.post(`/workouts/${id}/exercises/${workoutExerciseId}/replace`, {
        new_exercise_id: newExerciseId,
      });
      setMessage(result.explanation);
      setReplacing(null);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't replace that exercise");
    }
  }

  if (!workout) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl font-bold mb-1">{workout.name}</h1>
      <p className="text-text-muted text-xs tabular-nums mb-1">v{workout.version}</p>
      <p className="text-text-muted mb-8">{workout.days.length}-day split</p>

      {message && (
        <div className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mb-6 text-sm text-accent">
          {message}
        </div>
      )}

      <div className="relative pl-8">
        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

        {workout.days.map((day) => (
          <div key={day.day_number} className="relative mb-4">
            <div className="absolute -left-8 top-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
              {day.day_number}
            </div>

            <button
              onClick={() => setOpenDay(openDay === day.day_number ? null : day.day_number)}
              className="w-full flex justify-between items-center bg-surface border border-border rounded-2xl px-6 py-4"
            >
              <span className="font-display font-semibold">Day {day.day_number}</span>
              <motion.div animate={{ rotate: openDay === day.day_number ? 180 : 0 }}>
                <ChevronDown size={18} className="text-text-muted" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openDay === day.day_number && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface border border-t-0 border-border rounded-b-2xl px-6 py-2 -mt-px">
                    {day.exercises.map((ex, i) => (
                      <div key={ex.workout_exercise_id} className={`py-4 ${i !== day.exercises.length - 1 ? "border-b border-border" : ""}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{ex.name}</p>
                            <p className="text-text-muted text-xs">{ex.primary_muscles}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="text-primary font-display tabular-nums">{ex.sets}×{ex.reps}</p>
                            {ex.alternatives.length > 0 && (
                              <button
                                onClick={() => setReplacing(replacing === ex.workout_exercise_id ? null : ex.workout_exercise_id)}
                                className="text-text-muted hover:text-accent transition"
                              >
                                <RefreshCw size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {replacing === ex.workout_exercise_id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-wrap gap-2 mt-3">
                                {ex.alternatives.map((alt) => (
                                  <button
                                    key={alt.id}
                                    onClick={() => handleReplace(ex.workout_exercise_id, alt.id)}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-border hover:border-primary/40 transition"
                                  >
                                    {alt.name}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}