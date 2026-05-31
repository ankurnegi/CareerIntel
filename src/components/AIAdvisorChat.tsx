import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Send, Cpu, Check, AlertCircle, RefreshCw, SendHorizontal } from "lucide-react";
import { Message } from "../types";

// Helper function to render formatted chat messages beautifully for light theme
const renderMessage = (text: string) => {
  const lines = text.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2 text-[11.5px] text-zinc-700 font-sans font-medium">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "") {
      flushList(idx);
      return;
    }

    // Header 3
    if (trimmed.startsWith("###")) {
      flushList(idx);
      const headerText = trimmed.replace(/^###\s*/, "");
      renderedElements.push(
        <h4 key={`h3-${idx}`} className="text-[#0a66c2] font-extrabold border-b border-zinc-200 pb-1 mt-4 mb-2 flex items-center gap-1.5 text-xs">
          {headerText}
        </h4>
      );
      return;
    }

    // Header 2 or 1
    if (trimmed.startsWith("##") || trimmed.startsWith("#")) {
      flushList(idx);
      const headerText = trimmed.replace(/^#+\s*/, "");
      renderedElements.push(
        <h5 key={`h2-${idx}`} className="text-purple-800 font-extrabold mt-3 mb-1 text-xs">
          {headerText}
        </h5>
      );
      return;
    }

    // Bullet Items
    const isBulletField = trimmed.startsWith("*") || trimmed.startsWith("-") || trimmed.startsWith("•");
    if (isBulletField) {
      const cleanLine = trimmed.replace(/^[\*\-\•]\s*/, "");
      
      // Inline bold parsing
      const parts = cleanLine.split("**");
      const inlineParsed = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-bold text-zinc-900">{part}</strong>;
        }
        return part;
      });

      listItems.push(
        <li key={`li-${idx}`} className="leading-relaxed text-[11.5px] list-disc ml-1">
          {inlineParsed}
        </li>
      );
    } else {
      flushList(idx);
      
      // Inline bold parsing for paragraphs
      const parts = trimmed.split("**");
      const inlineParsed = parts.map((part, pIdx) => {
        if (pIdx % 2 === 1) {
          return <strong key={pIdx} className="font-bold text-zinc-900">{part}</strong>;
        }
        return part;
      });

      renderedElements.push(
        <p key={`p-${idx}`} className="text-[11.5px] text-zinc-700 leading-relaxed mb-2.5 font-sans font-medium">
          {inlineParsed}
        </p>
      );
    }
  });

  flushList("final");
  return <div className="space-y-0.5">{renderedElements}</div>;
};

interface AIAdvisorChatProps {
  currentRole: string;
}

export const AIAdvisorChat: React.FC<AIAdvisorChatProps> = ({ currentRole }) => {
  // Setup initial conversation preset requested by User
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-ai-1",
      role: "assistant",
      content: `I noticed your qualifications are excellent, but adding cloud infrastructure or specialized platform engineering skills here would increase your match score by roughly 22%. Shall I generate an action-oriented learning roadmap?`
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [learningPathGenerated, setLearningPathGenerated] = useState(false);
  const [learningPathContent, setLearningPathContent] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Execute Gemini request for regular chat or interactive path
  const handleSendMessage = async (textToSend: string, isPlanRequest = false) => {
    if (!textToSend.trim()) return;

    // Append developer query
    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      role: "user",
      content: textToSend
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          isLearningPathRequest: isPlanRequest,
          contextData: { role: currentRole, skill: "Cloud Deployment / Systems and Architecture Strategy" }
        })
      });

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `m-ai-${Date.now()}`,
        role: "assistant",
        content: data.content
      };

      setMessages((prev) => [...prev, aiMsg]);
      
      if (isPlanRequest) {
        setLearningPathGenerated(true);
        setLearningPathContent(data.content);
      }
    } catch (err) {
      console.error("Failed to query AI advisor:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `m-err-${Date.now()}`,
          role: "assistant",
          content: "System diagnostics offline. However, I highly recommend checking your continuous training benchmarks and certificates!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Preset quick trigger requested by user "Yes, build the plan."
  const triggerPresetPlan = () => {
    handleSendMessage("Yes, build the plan.", true);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "init-ai-1",
        role: "assistant",
        content: `I noticed your qualifications are excellent, but adding cloud infrastructure or specialized platform engineering skills here would increase your match score by roughly 22%. Shall I generate an action-oriented learning roadmap?`
      }
    ]);
    setLearningPathGenerated(false);
    setLearningPathContent(null);
  };

  return (
    <div 
      className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px] relative"
      id="ai-advisor-window"
    >
      {/* 1. Message Bar Header (LinkedIn Style) */}
      <div className="bg-[#f4f2ee] border-b border-zinc-200 py-3.5 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-zinc-800 tracking-tight flex items-center gap-1.5 pl-1">
            <Cpu className="w-3.5 h-3.5 text-[#0a66c2]" />
            Career Advisor Dialogue Console
          </span>
        </div>
        
        {/* Reset button */}
        <button 
          onClick={handleResetChat}
          className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 bg-white border border-zinc-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
          title="Reset conversation"
        >
          <RefreshCw className="w-3 h-3 text-zinc-500" />
          Clear Log
        </button>
      </div>

      {/* 2. Messages Console */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-sm text-zinc-850 bg-white">
        
        {/* Connection Established Indicator */}
        <div className="flex items-center space-x-2 text-[10px] text-zinc-400 border-b border-zinc-100 pb-2.5 mb-2 uppercase tracking-wide font-bold">
          <Cpu className="w-3.5 h-3.5 text-[#0a66c2]" />
          <span>Secured Chat Session (Active Engine)</span>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex flex-col max-w-[85%] ${m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-zinc-400">
                <span>{m.role === "assistant" ? "⚡ AI CO-PILOT" : "👨‍💻 YOU"}</span>
              </div>
              <div 
                className={`p-3.5 rounded-2xl leading-relaxed text-xs border shadow-sm ${
                  m.role === "user" 
                    ? "bg-[#0a66c2] border-[#0a66c2] text-white rounded-br-none" 
                    : "bg-[#f4f2ee] border-zinc-200 text-zinc-800 rounded-bl-none"
                }`}
              >
                {renderMessage(m.content)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex flex-col max-w-[85%] mr-auto items-start">
            <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a66c2] animate-ping" /> Analyzing paths...
            </span>
            <div className="p-3 bg-[#f4f2ee] border border-zinc-200 rounded-2xl rounded-bl-none">
              <div className="flex items-center space-x-1.5 py-1 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Action / Preset Bar (Guides first-time users cleanly) */}
      {!learningPathGenerated && (
        <div className="bg-[#f4f2ee] border-t border-zinc-200 p-3 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={triggerPresetPlan}
            disabled={loading}
            className="w-full max-w-sm py-2.5 px-4 rounded-xl border border-blue-200 bg-white hover:bg-zinc-50 text-[#0a66c2] text-xs font-bold font-sans tracking-wide shadow-sm flex items-center justify-center gap-1.5 animate-pulse cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-[#0a66c2]" />
            RUN DIAGNOSTIC: "Yes, build the plan."
          </motion.button>
        </div>
      )}

      {/* 4. Terminal Command Input */}
      <div className="bg-zinc-50 border-t border-zinc-200 p-3.5">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask anything (e.g., 'What tech certifications are popular?')..."
            className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 placeholder-zinc-400 font-sans text-xs focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2] outline-none min-w-0"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-2.5 rounded-xl bg-[#0a66c2] text-white hover:bg-[#004b87] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
