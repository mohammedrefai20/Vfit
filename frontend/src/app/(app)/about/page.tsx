"use client";

import { motion } from "framer-motion";
import { ShieldCheck, BookOpen, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-4xl font-bold mb-4">About V Fit</h1>
      <p className="text-text-muted leading-relaxed mb-10">
        V Fit is an AI-powered fitness platform built around one core idea: an AI coach
        should never invent an exercise or a fact. Every workout plan is filtered by a
        deterministic rule engine before an AI ever touches it, and every knowledge-based
        chat answer is grounded in real strength & conditioning literature.
      </p>

      <div className="space-y-6">
        <PrincipleRow
          icon={ShieldCheck}
          title="Deterministic safety"
          description="A rule engine checks equipment, experience level, and reported injuries before the AI plans a single exercise — and a validator rejects any AI output referencing an exercise outside your approved list."
          delay={0}
        />
        <PrincipleRow
          icon={BookOpen}
          title="Grounded knowledge"
          description="The AI assistant answers science questions using retrieval from published strength training references, not general-purpose guesswork."
          delay={0.1}
        />
        <PrincipleRow
          icon={Layers}
          title="Built with intent"
          description="Clean architecture throughout: FastAPI backend, Postgres + Qdrant for structured and vector data, Next.js frontend, tested end-to-end."
          delay={0.2}
        />
      </div>
    </div>
  );
}

function PrincipleRow({ icon: Icon, title, description, delay }: {
  icon: typeof ShieldCheck; title: string; description: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <h3 className="font-display font-semibold mb-1">{title}</h3>
        <p className="text-text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}