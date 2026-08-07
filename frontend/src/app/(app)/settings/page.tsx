"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Moon, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { api } from "@/lib/api";

type ProfileData = {
  age: number; sex: string; height: number; weight: number; goal: string;
  experience: string; training_location: string; equipment: string; training_days: number;
};

const EQUIPMENT_OPTIONS = ["Bodyweight", "Dumbbells", "Barbell", "Resistance Band", "Cable Machine", "Kettlebell", "Pull-Up Bar", "Bench"];
const GOAL_OPTIONS = ["Strength", "Hypertrophy", "General"];
const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const LOCATION_OPTIONS = ["Home", "Gym"];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    api.get("/profile").then(setProfile).catch(() => {});
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
    }
  }, [user]);

  function flash(section: string) {
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 2000);
  }

  function updateProfile<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  async function handleSaveProfile() {
    if (!profile) return;
    await api.put("/profile", profile);
    flash("profile");
  }

  async function handleSaveName() {
    await api.put("/auth/me", { first_name: firstName, last_name: lastName });
    flash("name");
  }

  async function handleChangePassword() {
    setError("");
    try {
      await api.post("/auth/change-password", { current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      flash("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update password");
    }
  }

  async function handleSaveAndRegenerate() {
    if (!profile) return;
    setRegenerating(true);
    try {
      await api.put("/profile", profile);
      const result = await api.post("/workouts/generate", { name: "Updated Plan" });
      router.push(`/workouts/${result.workout_id}`);
    } finally {
      setRegenerating(false);
    }
  }

  if (!profile) return <p className="text-text-muted">Loading...</p>;

  const inputClass = "w-full bg-surface border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition";

  return (
    <div className="max-w-lg pb-16">
      <h1 className="font-display text-4xl font-bold mb-10">Settings</h1>

      <SettingsSection title="Appearance">
        <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={18} className="text-text-muted" /> : <Sun size={18} className="text-text-muted" />}
            <span className="text-sm">{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-primary" : "bg-border"}`}
          >
            <motion.div
              className="w-4.5 h-4.5 bg-white rounded-full absolute top-[3px]"
              animate={{ left: theme === "dark" ? "22px" : "3px" }}
              transition={{ duration: 0.2 }}
              style={{ width: 18, height: 18 }}
            />
          </button>
        </div>
      </SettingsSection>

      <SettingsSection title="Profile" saved={savedSection === "name"}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
          <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </div>
        <SaveButton onClick={handleSaveName} label="Save name" />
      </SettingsSection>

      <SettingsSection title="Password" saved={savedSection === "password"}>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <div className="space-y-3 mb-3">
          <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
        </div>
        <SaveButton onClick={handleChangePassword} label="Update password" disabled={!currentPassword || !newPassword} />
      </SettingsSection>

      <SettingsSection title="Fitness profile" saved={savedSection === "profile"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <input type="number" value={profile.age} onChange={(e) => updateProfile("age", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Sex">
              <select value={profile.sex} onChange={(e) => updateProfile("sex", e.target.value)} className={inputClass}>
                <option>Male</option><option>Female</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input type="number" value={profile.height} onChange={(e) => updateProfile("height", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" value={profile.weight} onChange={(e) => updateProfile("weight", Number(e.target.value))} className={inputClass} />
            </Field>
          </div>

          <Field label="Goal">
            <ChipPicker options={GOAL_OPTIONS} value={[profile.goal]} onChange={(v) => updateProfile("goal", v[0] || profile.goal)} single />
          </Field>

          <Field label="Experience">
            <ChipPicker options={EXPERIENCE_OPTIONS} value={[profile.experience]} onChange={(v) => updateProfile("experience", v[0] || profile.experience)} single />
          </Field>

          <Field label="Training location">
            <ChipPicker options={LOCATION_OPTIONS} value={[profile.training_location]} onChange={(v) => updateProfile("training_location", v[0] || profile.training_location)} single />
          </Field>

          <Field label="Equipment">
            <ChipPicker
              options={EQUIPMENT_OPTIONS}
              value={profile.equipment.split(",").map((e) => e.trim()).filter(Boolean)}
              onChange={(list) => updateProfile("equipment", list.join(","))}
            />
          </Field>

          <Field label="Training days per week">
            <input type="number" min={1} max={7} value={profile.training_days} onChange={(e) => updateProfile("training_days", Number(e.target.value))} className={inputClass} />
          </Field>
        </div>

        <div className="flex gap-3 mt-5">
          <SaveButton onClick={handleSaveProfile} label="Save changes" />
          <button
            onClick={handleSaveAndRegenerate}
            disabled={regenerating}
            className="flex-1 border border-primary/40 text-primary rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-primary/5 transition"
          >
            {regenerating ? "Generating..." : "Save & generate new plan"}
          </button>
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, children, saved = false }: { title: string; children: React.ReactNode; saved?: boolean }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-display font-semibold">{title}</h2>
        {saved && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 text-primary text-xs">
            <Check size={12} /> Saved
          </motion.span>
        )}
      </div>
      {children}
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

function SaveButton({ onClick, label, disabled = false }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:opacity-90 transition"
    >
      {label}
    </button>
  );
}

function ChipPicker({ options, value, onChange, single = false }: {
  options: string[]; value: string[]; onChange: (list: string[]) => void; single?: boolean;
}) {
  function toggle(option: string) {
    if (single) {
      onChange([option]);
      return;
    }
    onChange(value.includes(option) ? value.filter((o) => o !== option) : [...value, option]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <motion.button
            key={option}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(option)}
            className={`text-sm px-3.5 py-1.5 rounded-full border transition ${
              selected
                ? "bg-primary text-white border-primary"
                : "bg-surface border-border text-text-muted hover:border-primary/40"
            }`}
          >
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}