"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type ProfileData = {
  age: string;
  sex: string;
  height: string;
  weight: string;
  goal: string;
  experience: string;
  training_location: string;
  equipment: string[];
  training_days: string;
};

const STEPS = [
  "age", "sex", "height_weight", "goal", "experience",
  "training_location", "equipment", "training_days",
] as const;

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<ProfileData>({
    age: "", sex: "", height: "", weight: "", goal: "",
    experience: "", training_location: "", equipment: [], training_days: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  function updateField(field: keyof ProfileData, value: string | string[]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function goNext() {
    if (isLastStep) {
      handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  async function handleSubmit() {
    setError("");
    try {
      await api.post("/auth/profile", {
        age: Number(data.age),
        sex: data.sex,
        height: Number(data.height),
        weight: Number(data.weight),
        goal: data.goal,
        experience: data.experience,
        training_location: data.training_location,
        equipment: data.equipment.join(","),
        training_days: Number(data.training_days),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="h-1 bg-surface rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <StepContent step={currentStep} data={data} updateField={updateField} />

        <div className="flex gap-3 mt-8">
          {stepIndex > 0 && (
            <button onClick={goBack} className="flex-1 border border-white/10 rounded-lg py-3 text-text-muted">
              Back
            </button>
          )}
          <button onClick={goNext} className="flex-1 bg-accent-primary rounded-lg py-3 font-medium">
            {isLastStep ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}

function StepContent({
  step, data, updateField,
}: {
  step: string;
  data: ProfileData;
  updateField: (field: keyof ProfileData, value: string | string[]) => void;
}) {
  const inputClass =
    "w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary";

  if (step === "age") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">How old are you?</h2>
        <input type="number" value={data.age} onChange={(e) => updateField("age", e.target.value)} className={inputClass} autoFocus />
      </div>
    );
  }

  if (step === "sex") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">Sex</h2>
        <div className="flex gap-3">
          {["Male", "Female"].map((option) => (
            <button
              key={option}
              onClick={() => updateField("sex", option)}
              className={`flex-1 rounded-lg py-3 border ${data.sex === option ? "border-accent-primary bg-accent-primary/10" : "border-white/10"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "height_weight") {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl mb-4">Height & weight</h2>
        <input type="number" placeholder="Height (cm)" value={data.height} onChange={(e) => updateField("height", e.target.value)} className={inputClass} />
        <input type="number" placeholder="Weight (kg)" value={data.weight} onChange={(e) => updateField("weight", e.target.value)} className={inputClass} />
      </div>
    );
  }

  if (step === "goal") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">What's your goal?</h2>
        <div className="space-y-2">
          {["Strength", "Hypertrophy", "General"].map((option) => (
            <button
              key={option}
              onClick={() => updateField("goal", option)}
              className={`w-full rounded-lg py-3 border text-left px-4 ${data.goal === option ? "border-accent-primary bg-accent-primary/10" : "border-white/10"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "experience") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">Experience level</h2>
        <div className="space-y-2">
          {["Beginner", "Intermediate", "Advanced"].map((option) => (
            <button
              key={option}
              onClick={() => updateField("experience", option)}
              className={`w-full rounded-lg py-3 border text-left px-4 ${data.experience === option ? "border-accent-primary bg-accent-primary/10" : "border-white/10"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "training_location") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">Where do you train?</h2>
        <div className="flex gap-3">
          {["Gym", "Home"].map((option) => (
            <button
              key={option}
              onClick={() => updateField("training_location", option)}
              className={`flex-1 rounded-lg py-3 border ${data.training_location === option ? "border-accent-primary bg-accent-primary/10" : "border-white/10"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "equipment") {
    const options = ["Bodyweight", "Dumbbells", "Barbell", "Resistance Band", "Cable Machine"];
    function toggle(option: string) {
      const current = data.equipment;
      updateField("equipment", current.includes(option) ? current.filter((o) => o !== option) : [...current, option]);
    }
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">Available equipment</h2>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggle(option)}
              className={`w-full rounded-lg py-3 border text-left px-4 ${data.equipment.includes(option) ? "border-accent-primary bg-accent-primary/10" : "border-white/10"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "training_days") {
    return (
      <div>
        <h2 className="font-display text-2xl mb-4">Training days per week</h2>
        <input type="number" min={1} max={7} value={data.training_days} onChange={(e) => updateField("training_days", e.target.value)} className={inputClass} />
      </div>
    );
  }

  return null;
}