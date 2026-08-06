"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await register(firstName, lastName, birthDate, email, password);
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const inputClass = "w-full bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block">
        <img
          src="https://images.pexels.com/photos/29591137/pexels-photo-29591137.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Athlete weightlifting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/10" />
        <span className="absolute bottom-8 left-8 font-display text-2xl font-bold text-white">V Fit</span>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center px-6 py-16"
      >
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-3xl font-bold mb-6">Create your account</h1>
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
            <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
          </div>
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required className={inputClass} />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />

          <button type="submit" className="w-full bg-primary rounded-lg px-4 py-3 font-medium text-white hover:opacity-90 transition">
            Create account
          </button>
          <p className="text-text-muted text-sm text-center">
            Already have an account? <a href="/login" className="text-accent">Log in</a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}