"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Youtube } from "lucide-react";
import { api } from "@/lib/api";

type ExerciseDetail = {
  id: string; name: string; primary_muscles: string; secondary_muscles: string;
  equipment: string; difficulty: string; movement_type: string; instructions: string;
  contraindications: string | null; youtube_url: string;
  alternatives: { id: string; name: string }[];
};

export default function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);

  useEffect(() => {
    if (id) api.get(`/exercises/${id}`).then(setExercise).catch(() => {});
  }, [id]);

  if (!exercise) return <p className="text-text-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push("/exercises")} className="flex items-center gap-2 text-text-muted text-sm mb-6">
        <ArrowLeft size={16} /> Back to library
      </button>

      <h1 className="font-display text-4xl font-bold mb-3">{exercise.name}</h1>
      <div className="flex gap-2 mb-8">
        <span className="text-xs px-2 py-1 rounded bg-white/5 text-text-muted">{exercise.equipment}</span>
        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{exercise.difficulty}</span>
        <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">{exercise.movement_type}</span>
      </div>

      {exercise.youtube_url ? (
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-surface">
          <iframe src={exercise.youtube_url} className="w-full h-full" allowFullScreen />
        </div>
      ) : (
        <div className="aspect-video rounded-2xl mb-8 bg-surface flex items-center justify-center text-text-muted text-sm">
          <Youtube size={20} className="mr-2" /> Video coming soon
        </div>
      )}

      <Section title="Muscles worked">
        <p className="text-text-muted text-sm"><strong className="text-text-primary">Primary:</strong> {exercise.primary_muscles}</p>
        {exercise.secondary_muscles && <p className="text-text-muted text-sm"><strong className="text-text-primary">Secondary:</strong> {exercise.secondary_muscles}</p>}
      </Section>

      <Section title="Instructions">
        <p className="text-text-muted text-sm leading-relaxed">{exercise.instructions}</p>
      </Section>

      {exercise.contraindications && (
        <Section title="Contraindications">
          <p className="text-text-muted text-sm leading-relaxed">{exercise.contraindications}</p>
        </Section>
      )}

      {exercise.alternatives.length > 0 && (
        <Section title="Alternatives">
          <div className="flex flex-wrap gap-2">
            {exercise.alternatives.map((alt) => (
              <button
                key={alt.id}
                onClick={() => router.push(`/exercises/${alt.id}`)}
                className="text-sm px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary/40 transition"
              >
                {alt.name}
              </button>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display font-semibold text-lg mb-3">{title}</h2>
      {children}
    </div>
  );
}