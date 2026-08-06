"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import ProgressCheckIn from "@/components/ProgressCheckIn";

type Workout = {
  workout_id: string;
  version: number;
};

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);
  useEffect(() => {
    if (user) {
      api.get("/workouts").then((result) => {
        if (result) setWorkout(result);
      }).catch(() => {});
    }
  }, [user]);

  async function handleGeneratePlan() {
    setGenerating(true);
    setError("");
    try {
      const result = await api.post("/workouts/generate");
      setWorkout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate a plan right now");
    } finally {
      setGenerating(false);
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-12">
        <span className="font-display text-xl">V Fit</span>
        <button onClick={logout} className="text-text-muted text-sm">
          Log out
        </button>
      </header>

      <section className="mb-12">
        <p className="text-text-muted text-sm mb-2">Welcome back</p>
        <h1 className="font-display text-5xl mb-1">{user.email.split("@")[0]}</h1>
      </section>
      <ProgressCheckIn />
      
      <section className="bg-surface rounded-2xl p-8 mb-8">
        {generating ? (
          <PlateLoader />
        ) : workout ? (
          <div>
            <p className="text-text-muted text-sm mb-2">Latest plan</p>
            <p className="font-display text-4xl tabular-nums text-accent-warm mb-4">v{workout.version}</p>
            <button onClick={() => router.push(`/workouts/${workout.workout_id}`)} className="text-accent-primary text-sm">
              View full plan →
            </button>
          </div>
        ) : (
          <div>
            <p className="text-text-muted text-sm mb-2">No active plan yet</p>
            <p className="text-text-primary mb-6">Generate a workout built from your profile.</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        {!generating && (
          <button
            onClick={handleGeneratePlan}
            className="mt-6 w-full bg-accent-primary rounded-lg py-3 font-medium"
          >
            {workout ? "Generate new plan" : "Generate my first plan"}
          </button>
        )}
      </section>
    </main>
  );
}

function PlateLoader() {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="flex items-end gap-1 h-16 mb-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-3 bg-accent-primary rounded-sm animate-plate-stack"
            style={{
              height: `${20 + i * 12}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p className="text-text-muted text-sm">Building your plan...</p>
    </div>
  );
}