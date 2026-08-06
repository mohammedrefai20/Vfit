"use client";

import { useState, useRef, useEffect } from "react";
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const result = await api.post("/chat", {
        message: text,
        session_id: sessionId,
        history: messages, // everything BEFORE this new message — backend appends the new one itself
      });
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
      try {
        await api.delete(`/chat/${sessionId}`);
      } catch {
        // non-critical if this fails — local reset still happens
      }
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
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 h-96 bg-surface border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <span className="font-display text-sm">V Fit Coach</span>
            <div className="flex items-center gap-3">
              <button onClick={handleNewChat} className="text-text-muted text-xs">
                New chat
              </button>
              <button onClick={() => setOpen(false)} className="text-text-muted text-sm">
                ✕
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-text-muted text-sm">
                {user ? "Ask me anything about training or your plan." : "Ask me a fitness question — no account needed."}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
                  m.role === "user" ? "bg-accent-primary/20 ml-auto text-text-primary" : "bg-white/5 text-text-primary"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && <p className="text-text-muted text-sm">Thinking...</p>}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
            <button onClick={handleSend} disabled={sending} className="bg-accent-primary rounded-lg px-4 text-sm font-medium disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-accent-primary shadow-lg flex items-center justify-center"
      >
        {open ? <span className="text-2xl">✕</span> : <BicepIcon />}
      </button>
    </div>
  );
}

function BicepIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 3c-1.5 0-2.5 1-2.5 2.5 0 .8.3 1.4.8 1.9C5.8 8 5 9.3 5 11c0 1.8.9 3 2 3.8V19c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-1.5c2.5-.3 4-2 4-4.5 0-2.8-1.8-4.5-4-4.8V7c0-2.2-1.8-4-4-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8.5c0 1.4 1.1 2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}