"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Exercise = { name: string; sets: number; reps: number; primary_muscles: string };
type Day = { day_number: number; exercises: Exercise[] };
type WorkoutDetail = { workout_id: string; version: number; days: Day[] };

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user && id) {
      api.get(`/workouts/${id}`).then(setWorkout).catch((err) => setError(err.message));
    }
  }, [loading, user, id, router]);

  if (loading || !workout) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">{error || "Loading..."}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <button onClick={() => router.push("/dashboard")} className="text-text-muted text-sm mb-6">
        ← Back to dashboard
      </button>

      <h1 className="font-display text-4xl mb-1">Plan v{workout.version}</h1>
      <p className="text-text-muted mb-10">{workout.days.length}-day split</p>

      <div className="space-y-6">
        {workout.days.map((day) => (
          <div key={day.day_number} className="bg-surface rounded-2xl p-6">
            <h2 className="font-display text-lg mb-4 text-accent-primary">Day {day.day_number}</h2>
            <div className="space-y-3">
              {day.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-text-primary">{ex.name}</p>
                    <p className="text-text-muted text-xs">{ex.primary_muscles}</p>
                  </div>
                  <p className="text-accent-warm font-display tabular-nums">
                    {ex.sets}×{ex.reps}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}