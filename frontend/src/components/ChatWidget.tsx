"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { X, Send, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 150, damping: 15 });
  const springY = useSpring(my, { stiffness: 150, damping: 15 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mx.set((e.clientX - centerX) * 0.25);
    my.set((e.clientY - centerY) * 0.25);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const result = await api.post("/chat", { message: text, session_id: sessionId, history: messages });
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      if (result.session_id) setSessionId(result.session_id);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setSending(false);
    }
  }

  async function handleNewChat() {
    if (user && sessionId) {
      try { await api.delete(`/chat/${sessionId}`); } catch {}
    }
    setMessages([]);
    setSessionId(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90]"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 w-[22rem] h-[32rem] rounded-3xl flex flex-col overflow-hidden shadow-2xl glass"
            >
              <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold leading-tight">V Fit Coach</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-text-muted text-xs">Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleNewChat} className="text-text-muted text-xs hover:text-primary transition">
                    New chat
                  </button>
                  <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Dumbbell size={20} className="text-primary" />
                    </div>
                    <p className="text-text-muted text-sm">
                      {user ? "Ask me anything about training or your plan." : "Ask me a fitness question — no account needed."}
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    {m.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                        <Dumbbell size={12} className="text-primary" />
                      </div>
                    )}
                    <div
                      className={`text-sm rounded-2xl px-4 py-2.5 max-w-[78%] leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white/5 text-text-primary rounded-bl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Dumbbell size={12} className="text-primary" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                      <TypingDot delay={0} />
                      <TypingDot delay={0.15} />
                      <TypingDot delay={0.3} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border flex gap-2 bg-surface">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-bg border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="w-10 h-10 flex-shrink-0 bg-primary rounded-full flex items-center justify-center text-white disabled:opacity-40 transition"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          onClick={() => setOpen((o) => !o)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ x: springX, y: springY }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-2xl"
        >
          <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-0 hover:opacity-50 transition-opacity duration-300 -z-10" />
          {open ? <X size={22} /> : <Dumbbell size={22} />}
        </motion.button>
      </div>
    </>
  );
}

function TypingDot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="w-1.5 h-1.5 rounded-full bg-text-muted inline-block"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, delay }}
    />
  );
}