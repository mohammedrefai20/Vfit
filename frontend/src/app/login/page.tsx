"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
        <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/20" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <span className="font-display text-2xl font-bold text-white block mb-3">V Fit</span>
          <p className="text-white/90 text-lg font-medium leading-snug max-w-sm">
            Strength is built one honest rep at a time.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-center px-6 py-16"
      >
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="font-display text-3xl font-bold mb-6">Welcome back</h1>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
          <button type="submit" className="w-full bg-primary rounded-lg px-4 py-3 font-medium text-white hover:opacity-90 transition">
            Log in
          </button>
          <p className="text-text-muted text-sm text-center">
            No account yet? <a href="/register" className="text-accent">Sign up</a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}