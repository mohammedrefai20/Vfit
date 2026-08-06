"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function ProgressCheckIn() {
  const [due, setDue] = useState(false);
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get("/progress/due").then((r) => setDue(r.due)).catch(() => {});
  }, []);

  async function handleSubmit() {
    if (!weight) return;
    await api.post("/progress", { weight: Number(weight), note: note || null });
    setSubmitted(true);
    setDue(false);
  }

  if (!due || submitted) return null;

  return (
    <div className="bg-surface rounded-2xl p-6 mb-8 border border-accent-warm/30">
      <p className="font-display text-lg mb-1">Weekly check-in</p>
      <p className="text-text-muted text-sm mb-4">How's your weight this week?</p>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="flex-1 bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-warm"
        />
        <button onClick={handleSubmit} className="bg-accent-warm text-bg rounded-lg px-4 text-sm font-medium">
          Log
        </button>
      </div>
      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-warm"
      />
    </div>
  );
}