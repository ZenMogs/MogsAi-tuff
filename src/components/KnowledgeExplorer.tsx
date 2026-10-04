import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Copy,
  Check,
  Code2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { searchKnowledge, KNOWLEDGE_DATABASE, MINECRAFT_VERSIONS, PLATFORM_SPECS } from '../lib/minecraftKnowledge';
import { KnowledgeDoc } from '../types/mogsai';

interface KnowledgeExplorerProps {
  onClose: () => void;
}

export const KnowledgeExplorer: React.FC<KnowledgeExplorerProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const docs = searchKnowledge(searchTerm).filter((doc) => {
    if (selectedCategory === 'all') return true;
    return doc.category === selectedCategory;
  });

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0c1018] border border-[#222c3f] rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-gray-200 font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1b2333] flex items-center justify-between bg-[#0e1420]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Space_Grotesk']">
                Minecraft API Knowledge Base & RAG Index
              </h3>
              <p className="text-xs text-gray-400">
                Official Paper, Adventure, Folia, Fabric, and Spigot API specs for modern versions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#1a2336] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-[#1b2333] flex flex-wrap gap-3 bg-[#0a0d14]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search modern API patterns, Adventure, PDC, Folia, Vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121824] border border-[#212b3e] rounded-lg pl-9 pr-3 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            {['all', 'api_changes', 'best_practices', 'folia', 'gui', 'integrations', 'platforms'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md capitalize font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#141b27]'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {docs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No documentation entries found for "{searchTerm}".
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0f1422] border border-[#1e283c] rounded-xl p-5 space-y-3 shadow-md hover:border-[#2a3854] transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    {doc.title}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    {doc.applicableVersions.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-mono bg-[#162033] text-cyan-300 px-2 py-0.5 rounded border border-[#253655]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-300 text-xs leading-relaxed">{doc.content}</p>

                {doc.codeSnippet && (
                  <div className="relative rounded-lg overflow-hidden border border-[#1c2638] bg-[#070a0f]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d121c] border-b border-[#1c2638] text-[10px] text-gray-400 font-mono">
                      <span>Production Code Pattern</span>
                      <button
                        onClick={() => handleCopyCode(doc.id, doc.codeSnippet!)}
                        className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedId === doc.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === doc.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-emerald-200 overflow-x-auto leading-relaxed">
                      <code>{doc.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
