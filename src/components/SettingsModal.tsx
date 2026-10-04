import React, { useState } from 'react';
import { Settings, Cpu, ShieldCheck, Zap, Sliders, Server } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  maxRetries: number;
  setMaxRetries: (n: number) => void;
  selectedProvider: string;
  setSelectedProvider: (p: string) => void;
  routingMode: 'auto' | 'quality' | 'speed';
  setRoutingMode: (m: 'auto' | 'quality' | 'speed') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  maxRetries,
  setMaxRetries,
  selectedProvider,
  setSelectedProvider,
  routingMode,
  setRoutingMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0d121c] border border-[#222c3f] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-200 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b2333] flex items-center justify-between bg-[#0f1522]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Space_Grotesk']">
                MogsAI Engine & Model Routing
              </h3>
              <p className="text-xs text-gray-400">
                Autonomous pipeline agent configuration, providers, and retry limits.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1a2336]">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-white flex items-center space-x-1.5">
              <Server className="h-4 w-4 text-cyan-400" />
              <span>AI Provider Engine</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'gemini', name: 'Google Gemini (Native)', desc: 'gemini-3.8-flash server pipeline' },
                { id: 'anthropic', name: 'Anthropic Claude', desc: 'Claude 3.7 Sonnet code engine' },
                { id: 'openai', name: 'OpenAI Compatible', desc: 'GPT-4o / custom OpenAI endpoints' },
                { id: 'ollama', name: 'Ollama / Local LLM', desc: 'DeepSeek-Coder / Qwen local instance' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedProvider === prov.id
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-white'
                      : 'border-[#1e273b] bg-[#111724] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-xs">{prov.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{prov.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Routing Mode */}
          <div className="space-y-2">
            <label className="font-semibold text-white flex items-center space-x-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Task Model Routing</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'auto', name: 'Auto Route', desc: 'Routes by complexity' },
                { id: 'quality', name: 'Deep Reasoning', desc: 'Max accuracy & reviews' },
                { id: 'speed', name: 'Low Latency', desc: 'Fast generation cycles' },
              ].map((route) => (
                <button
                  key={route.id}
                  onClick={() => setRoutingMode(route.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    routingMode === route.id
                      ? 'border-cyan-500/50 bg-cyan-950/20 text-white'
                      : 'border-[#1e273b] bg-[#111724] text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-xs">{route.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{route.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Max Retries */}
          <div className="space-y-2 bg-[#101622] p-4 rounded-xl border border-[#1e283c]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Autonomous Max Fix Retries</span>
                <span className="text-[11px] text-gray-400">
                  Maximum iterations the autonomous debugger will loop to fix build/validation errors.
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-sm bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                {maxRetries} Retries
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={maxRetries}
              onChange={(e) => setMaxRetries(parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer mt-2"
            />
          </div>

          {/* Security Note */}
          <div className="p-3 bg-[#0a0e16] border border-[#1c2638] rounded-lg text-[11px] text-gray-400 flex items-start space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-300">Security & Key Privacy:</span> API keys are securely
              managed server-side and never exposed to client-side bundles or generated code. The build environment
              is isolated in a secure container sandbox.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#1b2333] flex justify-end bg-[#0f1522]">
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
