"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type ProfileData = {
  age: number; sex: string; height: number; weight: number; goal: string;
  experience: string; training_location: string; equipment: string; training_days: number;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/profile").then(setProfile).catch(() => {});
  }, []);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  async function handleSave() {
    if (!profile) return;
    await api.put("/profile", profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  const EQUIPMENT_OPTIONS = ["Bodyweight", "Dumbbells", "Barbell", "Resistance Band", "Cable Machine", "Kettlebell", "Pull-Up Bar", "Bench"];

function EquipmentPicker({ value, onChange }: { value: string[]; onChange: (list: string[]) => void }) {
  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((o) => o !== option) : [...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {EQUIPMENT_OPTIONS.map((option) => {
        const selected = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              selected
                ? "bg-primary/15 border-primary text-primary"
                : "bg-surface border-border text-text-muted hover:border-primary/30"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

  if (!profile) return <p className="text-text-muted">Loading...</p>;

  const inputClass = "w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-4xl font-bold mb-8">Settings</h1>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <input type="number" value={profile.age} onChange={(e) => update("age", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Sex">
            <select value={profile.sex} onChange={(e) => update("sex", e.target.value)} className={inputClass}>
              <option>Male</option><option>Female</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input type="number" value={profile.height} onChange={(e) => update("height", Number(e.target.value))} className={inputClass} />
          </Field>
          <Field label="Weight (kg)">
            <input type="number" value={profile.weight} onChange={(e) => update("weight", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>

        <Field label="Goal">
          <select value={profile.goal} onChange={(e) => update("goal", e.target.value)} className={inputClass}>
            <option>Strength</option><option>Hypertrophy</option><option>General</option>
          </select>
        </Field>

        <Field label="Experience">
          <select value={profile.experience} onChange={(e) => update("experience", e.target.value)} className={inputClass}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </Field>

        <Field label="Training location">
          <select value={profile.training_location} onChange={(e) => update("training_location", e.target.value)} className={inputClass}>
            <option>Home</option><option>Gym</option>
          </select>
        </Field>

        <Field label="Equipment">
          <EquipmentPicker
            value={profile.equipment.split(",").map((e) => e.trim()).filter(Boolean)}
            onChange={(list) => update("equipment", list.join(","))}
          />
        </Field>
        <Field label="Training days per week">
          <input type="number" min={1} max={7} value={profile.training_days} onChange={(e) => update("training_days", Number(e.target.value))} className={inputClass} />
        </Field>

        <button onClick={handleSave} className="bg-primary text-white rounded-lg px-6 py-3 font-medium">
          Save changes
        </button>
        {saved && <span className="text-primary text-sm ml-3">Saved ✓</span>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-text-muted text-xs mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}