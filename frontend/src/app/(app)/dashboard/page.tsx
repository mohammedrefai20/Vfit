"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Dumbbell, Target, Scale, TrendingUp, Sparkles, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import ProgressCheckIn from "@/components/ProgressCheckIn";

type Workout = { workout_id: string; version: number; name: string };

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingWorkout, setLoadingWorkout] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    api.get("/workouts").then((r) => { if (r) setWorkout(r); }).finally(() => setLoadingWorkout(false));
  }, []);
const [latestWeight, setLatestWeight] = useState<number | null>(null);

  useEffect(() => {
    api.get("/progress").then((entries) => {
      if (entries && entries.length > 0) setLatestWeight(entries[0].weight);
    }).catch(() => {});
  }, []);

  async function handleGenerateNamed() {
    setShowNameModal(false);
    setGenerating(true);
    try {
      const result = await api.post("/workouts/generate", { name: planName || "My Workout Plan" });
      setWorkout(result);
      setPlanName("");
    } catch (err) {
      console.error("Generate failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-text-muted text-sm mb-1">Welcome back</p>
        <h1 className="font-display text-4xl font-bold">{user?.first_name}</h1>
      </motion.div>

      <ProgressCheckIn />

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card icon={Dumbbell} label="Today's Workout" delay={0}>
          {loadingWorkout ? <Skeleton /> : workout ? (
            <>
              <p className="text-3xl font-display font-bold text-primary tabular-nums mb-1">v{workout.version}</p>
              <p className="text-text-muted text-xs mb-3">{workout.name || "Untitled plan"}</p>
              <div className="flex gap-4">
                <button onClick={() => router.push(`/workouts/${workout.workout_id}`)} className="text-accent text-sm">
                  View plan →
                </button>
                <button onClick={() => setShowNameModal(true)} className="text-text-muted text-sm">
                  New plan
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowNameModal(true)}
              disabled={generating}
              className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate plan"}
            </button>
          )}
        </Card>

        <Card icon={Sparkles} label="AI Summary" delay={0.05} accent>
          <p className="text-sm text-text-muted leading-relaxed">
            {workout ? `You're on "${workout.name}" (v${workout.version}). Ask the coach for tips anytime.` : "Generate a plan to see your personalized summary."}
          </p>
        </Card>

        <Card icon={Target} label="Current Goal" delay={0.1}>
          <p className="text-lg font-display font-semibold">Hypertrophy</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card icon={Scale} label="Weight" delay={0.15}>
          <p className="text-2xl font-display font-bold tabular-nums">
            {latestWeight !== null ? `${latestWeight} kg` : "No data yet"}
          </p>
        </Card>
        <Card icon={TrendingUp} label="Progress" delay={0.2}>
          <p className="text-sm text-text-muted">Log weekly to see your trend</p>
        </Card>
        <Card icon={Bell} label="Weekly Reminder" delay={0.25}>
          <p className="text-sm text-text-muted">Check-in due every 7 days</p>
        </Card>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-display text-lg font-semibold mb-4">Name your plan</h3>
            <input
              autoFocus
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Summer Cut, Push Pull Legs"
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNameModal(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={handleGenerateNamed} className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium">
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, label, children, delay, accent = false }: {
  icon: typeof Dumbbell; label: string; children: React.ReactNode; delay: number; accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl p-6 border ${accent ? "border-accent/40 bg-accent/5" : "border-border bg-surface"}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={accent ? "text-accent" : "text-text-muted"} />
        <span className="text-xs font-medium text-text-muted tracking-wide">{label.toUpperCase()}</span>
      </div>
      {children}
    </motion.div>
  );
}

function Skeleton() {
  return <div className="h-8 w-16 bg-white/5 rounded animate-pulse" />;
}