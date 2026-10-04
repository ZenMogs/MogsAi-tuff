import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Paperclip,
  X,
  Sparkles,
  Server,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { MinecraftPlatform, FileAttachment } from '../types/mogsai';
import { MINECRAFT_VERSIONS, PLATFORM_SPECS } from '../lib/minecraftKnowledge';

interface ChatComposerProps {
  onSendMessage: (content: string, attachments: FileAttachment[]) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  platform: MinecraftPlatform;
  setPlatform: (p: MinecraftPlatform) => void;
  version: string;
  setVersion: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  initialPrompt?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  platform,
  setPlatform,
  version,
  setVersion,
  selectedModel,
  setSelectedModel,
  initialPrompt = '',
}) => {
  const [content, setContent] = useState(initialPrompt);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setContent(initialPrompt);
      textareaRef.current?.focus();
    }
  }, [initialPrompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;
    if (!content.trim() && attachments.length === 0) return;

    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: 'att_' + Date.now() + '_' + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content: text || '',
          },
        ]);
      };
      // Read text files directly, or base64 for binaries/zip
      if (file.name.endsWith('.zip') || file.name.endsWith('.jar')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="border-t border-[#1a2336] bg-[#0c1018] p-3 md:p-4 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Attachment Chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-1.5 bg-[#141d2d] border border-[#23314d] rounded-lg px-2.5 py-1 text-xs text-gray-200"
              >
                <Paperclip className="h-3 w-3 text-emerald-400" />
                <span className="truncate max-w-[180px] font-mono text-[11px]">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-gray-400 hover:text-white p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Card */}
        <div className="relative rounded-2xl bg-[#111724] border border-[#212c42] focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/30 transition-all shadow-inner overflow-hidden">
          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="w-full bg-transparent px-4 py-3 text-xs md:text-sm text-white placeholder-gray-500 focus:outline-none resize-none font-sans leading-relaxed selection:bg-emerald-500/30"
          />

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-2.5 sm:px-3 py-2 border-t border-[#1a2336]/60 bg-[#0e1420] text-xs gap-2 min-w-0">
            {/* Left: Model & Environment Selectors */}
            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto scrollbar-none min-w-0 flex-1">
              {/* Attachment Button */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".java,.kt,.sk,.yml,.yaml,.json,.gradle,.md,.txt,.log,.zip,.jar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#182133] transition-colors shrink-0"
                title="Attach project ZIP, source file, or error log"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Platform Selector */}
              <div className="flex items-center bg-[#151c2a] border border-[#243147] rounded-md px-1.5 sm:px-2 py-1 shrink-0">
                <span className="text-gray-500 mr-1 font-mono text-[9px] sm:text-[10px]">Platform:</span>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as MinecraftPlatform)}
                  className="bg-transparent text-emerald-300 font-medium focus:outline-none cursor-pointer text-[11px] sm:text-xs"
                >
                  {Object.entries(PLATFORM_SPECS).map(([k, spec]) => (
                    <option key={k} value={k} className="bg-[#151c2a] text-white">
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version Selector */}
              <div className="flex items-center bg-[#151c2a] border border-[#243147] rounded-md px-1.5 sm:px-2 py-1 shrink-0">
                <span className="text-gray-500 mr-1 font-mono text-[9px] sm:text-[10px]">MC:</span>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="bg-transparent text-cyan-300 font-medium focus:outline-none cursor-pointer text-[11px] sm:text-xs"
                >
                  {Object.keys(MINECRAFT_VERSIONS).map((ver) => (
                    <option key={ver} value={ver} className="bg-[#151c2a] text-white">
                      {ver}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selector */}
              <div className="hidden md:flex items-center bg-[#151c2a] border border-[#243147] rounded-md px-2 py-1 shrink-0">
                <span className="text-gray-500 mr-1 font-mono text-[10px]">Model:</span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-purple-300 font-medium focus:outline-none cursor-pointer text-xs"
                >
                  <option value="gemini-3.8-flash" className="bg-[#151c2a] text-white">
                    gemini-3.8-flash
                  </option>
                  <option value="claude-3.7-sonnet" className="bg-[#151c2a] text-white">
                    claude-3.7-sonnet
                  </option>
                  <option value="gpt-4o" className="bg-[#151c2a] text-white">
                    gpt-4o
                  </option>
                  <option value="ollama-local" className="bg-[#151c2a] text-white">
                    ollama (local)
                  </option>
                </select>
              </div>
            </div>

            {/* Right: Send / Stop Button */}
            <div className="flex items-center space-x-2">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg shadow-md transition-colors"
                >
                  <Square className="h-3.5 w-3.5 fill-white" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!content.trim() && attachments.length === 0}
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-md shadow-emerald-700/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-emerald-400/30"
                >
                  <span>Build</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Small footer tip */}
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono px-1">
          <span>Enter to send • Shift + Enter for newline</span>
          <span>Isolated compiler sandbox • Real JAR packaging</span>
        </div>
      </div>
    </div>
  );
};
