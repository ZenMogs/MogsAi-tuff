import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Upload,
  FileCode,
  AlertTriangle,
  Zap,
  Wrench,
  HelpCircle,
  FolderUp,
} from 'lucide-react';
import { AIMode } from '../types/mogsai';

interface PromptConsoleProps {
  mode: AIMode;
  onSubmit: (prompt: string, errorLog?: string, uploadedFiles?: FileList | null) => void;
  isGenerating: boolean;
}

const TEMPLATES: Record<AIMode, { label: string; prompt: string }[]> = {
  generate: [
    {
      label: 'Kit GUI + Cooldowns + PDC (Paper 1.21)',
      prompt: 'Create a Paper 1.21.x plugin that adds "/kit", supports configurable kits, permissions, cooldowns, GUI selection, and stores player data.',
    },
    {
      label: 'Economy Shop + Vault (Paper 1.21)',
      prompt: 'Create a Paper 1.21 plugin that adds a GUI shop "/shop" with Vault economy integration, buy/sell transactions, and sound effects.',
    },
    {
      label: 'Folia-Safe Spawn & Teleport',
      prompt: 'Create a Paper 1.21 plugin with /spawn and /setspawn that is 100% Folia multi-threading compatible using RegionScheduler.',
    },
    {
      label: 'Fabric 1.21 Custom Item Mod',
      prompt: 'Create a Fabric 1.21 mod with custom items, custom item groups, and recipe integration.',
    },
  ],
  modify: [
    {
      label: 'Add Kit Cooldown Bypass Permission',
      prompt: 'Modify the existing kit plugin to add a bypass permission "mogskits.bypass" and add an admin command to reset all cooldowns.',
    },
    {
      label: 'Add Sound Effects & Particles',
      prompt: 'Add configurable sound effects (ENTITY_PLAYER_LEVELUP) and particle bursts whenever a player successfully claims a kit.',
    },
  ],
  fix: [
    {
      label: 'Fix NullPointerException on Command',
      prompt: 'Fix NullPointerException when player executes /kit without registering in plugin.yml descriptor.',
    },
    {
      label: 'Fix Async World Access Crash',
      prompt: 'Diagnose and repair "IllegalStateException: Asynchronous entity track / world mutation" thrown during player teleport.',
    },
  ],
  review: [
    {
      label: 'Deep Audit: Folia, Memory Leaks & Deprecations',
      prompt: 'Audit the entire project for async thread-safety violations, static collection memory leaks, and legacy ChatColor usage.',
    },
  ],
  explain: [
    {
      label: 'Explain Architecture to Beginner',
      prompt: 'Explain the project architecture, how GUI clicks are safely prevented from item theft, and how player data is saved asynchronously.',
    },
  ],
  optimize: [
    {
      label: 'Optimize Memory & Async I/O',
      prompt: 'Optimize data saving by implementing concurrent caching and asynchronous chunk-friendly persistence.',
    },
  ],
  convert: [
    {
      label: 'Convert Spigot ChatColor to Modern Adventure',
      prompt: 'Convert all legacy ChatColor and raw string messages into Kyori Adventure Component and MiniMessage format.',
    },
  ],
};

export const PromptConsole: React.FC<PromptConsoleProps> = ({ mode, onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = useState(
    'Create a Paper 1.21.x plugin that adds "/kit", supports configurable kits, permissions, cooldowns, GUI selection, and stores player data.'
  );
  const [errorLog, setErrorLog] = useState('');
  const [showErrorInput, setShowErrorInput] = useState(mode === 'fix');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && !errorLog.trim()) return;
    onSubmit(prompt, errorLog);
  };

  const handleSelectTemplate = (p: string) => {
    setPrompt(p);
  };

  return (
    <div className="bg-[#0b0f17] border-b border-[#1b2333] px-4 py-3 text-gray-200">
      {/* Quick Templates Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-2 custom-scrollbar text-[11px]">
        <span className="text-gray-500 font-mono uppercase text-[10px] shrink-0 font-semibold flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          Quick Presets:
        </span>
        {TEMPLATES[mode]?.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectTemplate(tmpl.prompt)}
            className="px-2.5 py-1 rounded bg-[#131a26] hover:bg-[#1a2336] text-gray-300 hover:text-white border border-[#212c40] shrink-0 transition-colors"
          >
            {tmpl.label}
          </button>
        ))}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative flex items-center">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === 'generate'
                ? 'Describe what to build (e.g. "Create a Paper 1.21.x plugin that adds /kit with GUI, cooldowns, permissions, and stores player data")...'
                : mode === 'modify'
                ? 'Describe changes to make to the existing project...'
                : mode === 'fix'
                ? 'Describe the issue or paste compiler error stack trace below...'
                : 'Enter your request for MogsAI...'
            }
            className="w-full bg-[#101622] border border-[#232f46] rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 pr-32 font-sans resize-none leading-relaxed shadow-inner"
          />

          {/* Action buttons inside input */}
          <div className="absolute right-2.5 bottom-3 flex items-center space-x-1.5">
            {mode === 'fix' && (
              <button
                type="button"
                onClick={() => setShowErrorInput(!showErrorInput)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                  showErrorInput
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#182130] text-gray-400 border-[#2a374f] hover:text-white'
                }`}
                title="Paste Stack Trace / Compiler Error"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg shadow-md shadow-emerald-700/30 flex items-center space-x-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-400/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isGenerating ? 'Building...' : mode === 'fix' ? 'Diagnose & Fix' : 'Execute AI'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Stack Trace Input for Fix Mode */}
        {showErrorInput && (
          <div className="space-y-1 bg-[#121824] p-3 rounded-lg border border-[#232e42]">
            <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                Paste Stack Trace, Compiler Error, or Crash Log:
              </span>
              <button
                type="button"
                onClick={() =>
                  setErrorLog(
                    `[12:30:15 ERROR]: Error occurred while enabling MogsKits v1.0.0 (Is it up to date?)\njava.lang.NullPointerException: Cannot invoke "org.bukkit.command.PluginCommand.setExecutor(org.bukkit.command.CommandExecutor)" because the return value of "com.mogsai.kits.KitPlugin.getCommand(String)" is null\n\tat com.mogsai.kits.KitPlugin.onEnable(KitPlugin.java:42) ~[?:?]`
                  )
                }
                className="text-[10px] text-gray-400 hover:text-gray-200 underline"
              >
                Sample Stack Trace
              </button>
            </div>
            <textarea
              rows={3}
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste Java compiler errors (javac), Gradle build failures, or Paper server stack traces..."
              className="w-full bg-[#0b0e14] border border-[#1e273b] rounded p-2 text-[11px] font-mono text-red-300 placeholder-gray-600 focus:outline-none focus:border-red-500/50 resize-none"
            />
          </div>
        )}
      </form>
    </div>
  );
};
