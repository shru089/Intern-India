import { useState } from "react";
import { chatbotQuery } from "../services/api";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);

  const send = async () => {
    if (!input.trim()) return;
    const text = input;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    const res = await chatbotQuery(text);
    setMessages((m) => [...m, { role: "ai", text: res.answer }]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="font-semibold">AI Assistant</div>
            <button className="text-secondary" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="max-h-72 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-primary text-white" : "bg-gray-100"}`}>
                  {m.text}
                </span>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-sm text-secondary">Ask me about internships, allocations, or skills.</div>
            )}
          </div>
          <div className="flex gap-2 p-3">
            <input className="auth-input-field" placeholder="Type a message" value={input} onChange={(e) => setInput(e.target.value)} />
            <button className="auth-button w-auto px-4" onClick={send}>Send</button>
          </div>
        </div>
      )}
      <button className="rounded-full bg-accent text-white px-4 py-3 shadow hover:shadow-md" onClick={() => setOpen((v) => !v)}>
        {open ? "Close" : "Chat"}
      </button>
    </div>
  );
}


