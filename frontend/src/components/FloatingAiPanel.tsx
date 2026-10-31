import React, { useState, useEffect } from 'react';
import { Bot, X, Send, RefreshCw, Key, Check, ShieldCheck } from 'lucide-react';
import { Exoplanet, HabitabilityResult } from '../types';

interface FloatingAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanet: Exoplanet | null;
  habitability: HabitabilityResult | null;
  onNavigate: (view: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: string;
  model?: string;
}

export const FloatingAiPanel: React.FC<FloatingAiPanelProps> = ({
  isOpen,
  onClose,
  selectedPlanet,
  habitability,
  onNavigate
}) => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('orbitron_gemini_api_key') || '';
  });
  const [hasEnvKey, setHasEnvKey] = useState<boolean>(false);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>('');

  useEffect(() => {
    fetch('/api/ai/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.has_api_key) {
          setHasEnvKey(true);
        }
      })
      .catch(() => {});
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: selectedPlanet
        ? `Orbitron Open-World Science Intelligence active for **${selectedPlanet.pl_name}**.\nPowered by Google Generative AI reasoning with NASA archive telemetry. Ask any open-world question across astrophysics, planetary science, extremophile microbiology, radiobiology, or space settlement.`
        : 'Orbitron Open-World Science Intelligence active.\nPowered by Google Generative AI reasoning with NASA archive telemetry. Ask any open-world question across astronomy, astrobiology, cellular radiobiology, or astrophysics.',
      timestamp: 'Now',
      mode: 'live_llm',
      model: 'Orbitron Open-World Intelligence'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const promptChips = [
    `Can life survive on ${selectedPlanet ? selectedPlanet.pl_name : 'M-dwarf worlds'}?`,
    'How does radiation cause DNA double-strand breaks?',
    'Explain the cloud feedback effect on habitability',
    'Could subsurface oceans exist on frozen super-Earths?'
  ];

  const handleSaveKey = () => {
    const trimmed = tempKey.trim();
    setApiKey(trimmed);
    localStorage.setItem('orbitron_gemini_api_key', trimmed);
    setShowKeyInput(false);
  };

  if (!isOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          api_key: apiKey || undefined,
          context: {
            selected_planet: selectedPlanet,
            habitability: habitability
          }
        })
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: data.mode,
          model: data.model
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Orbitron Grounded Assistant: exoplanet data indicates measurements must not be extrapolated beyond archival bounds. Backend synthesis engaged in deterministic fallback mode.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'fallback',
          model: 'Orbitron Grounded Offline Engine'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md rounded-[24px] border border-white/20 bg-black/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col max-h-[600px] animate-fadeIn text-white font-mono">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
            <Bot className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider">ASK ORBITRON AI</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${
                (apiKey || hasEnvKey)
                  ? 'border-white text-white bg-white/10'
                  : 'border-white/20 text-neutral-400 bg-white/5'
              }`}>
                {(apiKey || hasEnvKey) ? '● GEMINI LIVE' : 'GROUNDED'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 truncate max-w-[210px]">
              {selectedPlanet ? selectedPlanet.pl_name : 'NASA Exoplanet Archive'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setTempKey(apiKey);
              setShowKeyInput(!showKeyInput);
            }}
            title="Configure Gemini API Key"
            className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 cursor-pointer transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* API Key Modal / Banner */}
      {showKeyInput && (
        <div className="p-3 bg-neutral-900 border-b border-white/20 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-white font-bold">
            <span>GEMINI API KEY CONFIGURATION</span>
            <span className="text-[9px] text-neutral-400">Stored locally in browser</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Paste your Gemini API key (AIza...)"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              className="flex-1 bg-black border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
            />
            <button
              onClick={handleSaveKey}
              className="px-3 py-1 rounded-lg bg-white text-black font-bold text-xs cursor-pointer hover:bg-neutral-200"
            >
              Save
            </button>
          </div>
          {apiKey && (
            <div className="text-[10px] text-neutral-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-white" />
              <span>Key connected. Orbitron AI will query Gemini 1.5 Flash directly.</span>
            </div>
          )}
        </div>
      )}

      {/* Suggested Prompt Chips */}
      <div className="p-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto bg-black/60">
        {promptChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-neutral-300 hover:text-white whitespace-nowrap cursor-pointer transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs min-h-[280px]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center font-bold shrink-0 mt-0.5 text-[10px]">
                O
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl max-w-[85%] text-[11px] leading-relaxed space-y-1.5 ${
                m.sender === 'user'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-white/5 border border-white/15 text-neutral-200'
              }`}
            >
              <div className="whitespace-pre-line font-sans">{m.text}</div>
              <div className="text-[9px] font-mono text-neutral-500 pt-1 border-t border-white/10 flex items-center justify-between">
                <span>{m.model || 'Orbitron Assistant'}</span>
                <span>{m.timestamp}</span>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Consulting NASA parameters and radiobiology models...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/80"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a research question..."
          className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2 rounded-xl bg-white text-black font-bold disabled:opacity-30 cursor-pointer hover:bg-neutral-200 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};