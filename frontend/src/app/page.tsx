"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, ShieldCheck, TrendingUp, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 sticky top-0 z-40 glass">
        <span className="font-display font-bold text-xl">V Fit</span>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          {user ? (
            <button onClick={() => router.push("/dashboard")} className="bg-primary rounded-lg px-5 py-2 text-sm font-medium text-white">
              Dashboard
            </button>
          ) : (
            <>
              <button onClick={() => router.push("/login")} className="text-text-muted text-sm">Log in</button>
              <button onClick={() => router.push("/register")} className="bg-primary rounded-lg px-5 py-2 text-sm font-medium text-white">
                Get started
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="grid md:grid-cols-2 min-h-[85vh] items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="px-6 md:px-16 py-16"
        >
          <span className="text-accent text-sm font-semibold tracking-wide">AI-POWERED TRAINING</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] mt-4 mb-6">
            Training plans built on real science.
          </h1>
          <p className="text-text-muted text-lg mb-8 max-w-md">
            V Fit combines a science-backed exercise engine with an AI coach that knows
            your equipment, experience, and goals — no generic templates.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(user ? "/dashboard" : "/register")}
              className="bg-primary rounded-lg px-8 py-3.5 font-medium text-white hover:opacity-90 transition"
            >
              {user ? "Go to dashboard" : "Start your plan"}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative h-[50vh] md:h-[85vh]"
        >
          <img
            src="https://images.pexels.com/photos/29591137/pexels-photo-29591137.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Athlete training with weights"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-bg/20 to-bg md:bg-gradient-to-r md:from-bg md:via-bg/10 md:to-transparent" />
        </motion.div>
      </section>

      <section className="px-6 md:px-12 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold text-center mb-16"
        >
          Why V Fit
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard icon={ShieldCheck} title="Deterministic safety" description="A rule engine filters for your equipment, experience, and injuries before the AI plans a single rep." delay={0} />
          <FeatureCard icon={Brain} title="Grounded knowledge" description="Chat answers pull from published strength & conditioning literature — not guesswork." delay={0.1} accent />
          <FeatureCard icon={TrendingUp} title="Built to adapt" description="Track weekly progress and regenerate plans as your goals and abilities change." delay={0.2} />
        </div>
      </section>

      <footer className="px-6 md:px-12 py-10 border-t border-border text-text-muted text-sm flex justify-between">
        <span>© 2026 V Fit</span>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description, delay, accent = false }: {
  icon: typeof Brain; title: string; description: string; delay: number; accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className={`rounded-2xl p-6 border ${accent ? "border-accent/40 bg-accent/5" : "border-border bg-surface"}`}
    >
      <Icon className={accent ? "text-accent mb-4" : "text-primary mb-4"} size={28} />
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}