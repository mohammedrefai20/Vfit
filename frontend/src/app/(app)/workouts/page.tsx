"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function WorkoutsIndexPage() {
  const router = useRouter();

  useEffect(() => {
    api.get("/workouts").then((workout) => {
      if (workout) {
        router.replace(`/workouts/${workout.workout_id}`);
      } else {
        router.replace("/dashboard");
      }
    }).catch(() => router.replace("/dashboard"));
  }, [router]);

  return <p className="text-text-muted">Loading your plan...</p>;
}