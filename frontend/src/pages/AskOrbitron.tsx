import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Database,
  ArrowRight,
  ShieldAlert,
  Activity,
  LineChart,
  User,
  RefreshCw
} from 'lucide-react';
import { Exoplanet, HabitabilityResult } from '../types';

interface AskOrbitronProps {
  selectedPlanet: Exoplanet | null;
  habitabilityResult: HabitabilityResult | null;
  onNavigate: (tab: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: string;
  model?: string;
}

export const AskOrbitron: React.FC<AskOrbitronProps> = ({
  selectedPlanet,
  habitabilityResult,
  onNavigate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: selectedPlanet
        ? `Hello! I am your Orbitron Science Intelligence Assistant. I am grounded in verified NASA Exoplanet Archive composite parameters, spectroscopic models, and radiobiology data. We are currently examining **${selectedPlanet.pl_name}** (Host: ${selectedPlanet.hostname}). How can I assist your investigation?`
        : 'Hello! I am your Orbitron Science Intelligence Assistant. Select a planet in the Explorer or choose one of the prompt chips below to begin.',
      timestamp: 'Just now',
      mode: 'fallback',
      model: 'Orbitron Grounded Science Assistant'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const promptChips = [
    `Explain ${selectedPlanet ? selectedPlanet.pl_name : 'TRAPPIST-1 e'}'s data`,
    'Why is habitability confidence low for some planets?',
    'What does this transmission spectrum show?',
    'What would a human visit face on this world?',
    'How do extremophiles survive extreme cosmic radiation?'
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSubmitting) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            selected_planet: selectedPlanet,
            habitability: habitabilityResult
          }
        })
      });

      if (!response.ok) throw new Error('AI query failed');
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode: data.mode,
        model: data.model
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to communicate with the science assistant service. Please check your backend connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'error'
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1F3A]/80 border border-[#24466B] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white">
              ASK ORBITRON AI (GROUNDED SCIENCE ASSISTANT)
            </h1>
          </div>
          <p className="text-xs text-[#AFC2D9]">
            Strictly bounded by catalogue observations and peer-reviewed physics/microbiology. Never hallucinates measurements.
          </p>
        </div>

        {/* Target context badge */}
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Context</span>
          <span className="text-xs font-mono font-bold text-cyan-300">
            {selectedPlanet ? selectedPlanet.pl_name : 'General Archive'}
          </span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          Suggested Scientific Inquiries:
        </span>
        <div className="flex flex-wrap gap-2">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-[#102B4B] border border-slate-700 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-5 rounded-2xl bg-[#071A36]/90 border border-[#24466B] space-y-4 min-h-[420px] max-h-[560px] overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center shrink-0 text-cyan-300 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs font-sans leading-relaxed space-y-2 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0B1F3A] border border-[#24466B] text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-400 border-b border-white/10 pb-1 mb-1">
                <span className="font-semibold text-cyan-300">
                  {m.sender === 'user' ? 'RESEARCHER' : m.model || 'ORBITRON AI'}
                </span>
                <span>{m.timestamp}</span>
              </div>

              {/* Render message body */}
              <div className="whitespace-pre-line text-[12px] space-y-1">
                {m.text}
              </div>

              {/* Model fallback badge if applicable */}
              {m.mode === 'fallback' && (
                <div className="pt-2 mt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                  <span>Demo Assistant (Offline Rule Engine)</span>
                  <span className="text-slate-500">Grounded Context Mode</span>
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-blue-700 border border-blue-500 flex items-center justify-center shrink-0 text-white mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSubmitting && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Evaluating planetary parameters against scientific constraints...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-[#0B1F3A] border border-[#24466B] focus-within:border-cyan-400 transition-colors"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about ${selectedPlanet ? selectedPlanet.pl_name : 'an exoplanet'}, habitability limits, or extremophiles...`}
          className="flex-1 bg-transparent px-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
