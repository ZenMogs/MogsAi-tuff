import React, { useState } from 'react';
import { GitCompare, CheckCircle2, ArrowRight, List, FileCode, Check } from 'lucide-react';
import { ProjectFile } from '../types/mogsai';

interface DiffViewerProps {
  files: ProjectFile[];
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ files }) => {
  const modifiedFiles = files.filter((f) => f.isModified && f.originalContent);
  const [selectedPath, setSelectedPath] = useState(
    modifiedFiles.length > 0 ? modifiedFiles[0].path : files[0]?.path || ''
  );
  // On mobile: toggle between 'files' and 'diff'
  const [mobileTab, setMobileTab] = useState<'files' | 'diff'>('diff');
  // On mobile diff: view mode 'split' | 'patched' | 'original'
  const [mobileDiffView, setMobileDiffView] = useState<'patched' | 'original'>('patched');

  const currentFile = files.find((f) => f.path === selectedPath) || modifiedFiles[0] || files[0];

  const originalLines = currentFile?.originalContent ? currentFile.originalContent.split('\n') : [];
  const modifiedLines = currentFile ? currentFile.content.split('\n') : [];

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#0a0d14] text-gray-300 font-mono text-xs overflow-hidden min-w-0">
      {/* Mobile-Only Top Control Bar */}
      <div className="flex md:hidden items-center justify-between border-b border-[#1a2233] bg-[#0c1018] px-3 py-1.5 shrink-0 select-none min-w-0">
        <div className="flex items-center space-x-1 border border-[#232f48] rounded-md p-0.5 bg-[#101520] text-xs font-sans">
          <button
            onClick={() => setMobileTab('files')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors ${
              mobileTab === 'files'
                ? 'bg-[#1b253b] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <List className="h-3.5 w-3.5 text-amber-400" />
            <span>Files ({modifiedFiles.length})</span>
          </button>
          <button
            onClick={() => setMobileTab('diff')}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center space-x-1 transition-colors ${
              mobileTab === 'diff'
                ? 'bg-[#1b253b] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5 text-cyan-400" />
            <span>Diff View</span>
          </button>
        </div>

        {mobileTab === 'diff' && (
          <div className="flex items-center space-x-1 bg-[#101520] border border-[#232f48] rounded p-0.5 text-[10px]">
            <button
              onClick={() => setMobileDiffView('patched')}
              className={`px-2 py-0.5 rounded ${
                mobileDiffView === 'patched' ? 'bg-emerald-950/60 text-emerald-300 font-bold' : 'text-gray-400'
              }`}
            >
              Patched
            </button>
            <button
              onClick={() => setMobileDiffView('original')}
              className={`px-2 py-0.5 rounded ${
                mobileDiffView === 'original' ? 'bg-red-950/60 text-red-300 font-bold' : 'text-gray-400'
              }`}
            >
              Original
            </button>
          </div>
        )}
      </div>

      {/* File List for Diff (Desktop sidebar or Mobile Tab 'files') */}
      <div
        className={`w-full md:w-60 lg:w-64 border-r border-[#1a2233] bg-[#0c1018] flex flex-col shrink-0 select-none ${
          mobileTab === 'files' ? 'flex-1 md:flex-initial' : 'hidden md:flex'
        }`}
      >
        <div className="p-2.5 border-b border-[#1a2233] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-1.5 font-sans">
            <GitCompare className="h-3.5 w-3.5 text-amber-400" />
            Changed Files
          </span>
          <span className="text-[10px] text-amber-400 font-mono bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">
            {modifiedFiles.length} modified
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar min-w-0">
          {files.map((file) => {
            const isMod = file.isModified && file.originalContent;
            const isSelected = file.path === currentFile?.path;
            return (
              <button
                key={file.path}
                onClick={() => {
                  setSelectedPath(file.path);
                  setMobileTab('diff'); // Auto switch to diff view on mobile
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors min-w-0 ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#121824]'
                }`}
              >
                <span className="truncate text-[11px] font-mono">{file.path.split('/').pop()}</span>
                {isMod ? (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded shrink-0 font-sans font-bold">
                    DIFF
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-600 shrink-0 font-sans">CLEAN</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Diff View Area (Desktop or Mobile Tab 'diff') */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0d1117] ${
          mobileTab === 'diff' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Header Bar */}
        <div className="h-10 border-b border-[#1b2333] bg-[#0c1018] flex items-center justify-between px-3 md:px-4 select-none shrink-0 min-w-0">
          <div className="flex items-center space-x-1.5 text-xs font-mono truncate min-w-0 mr-2">
            <span className="text-gray-400 shrink-0">File:</span>
            <span className="text-amber-300 font-semibold truncate text-[11px] md:text-xs">
              {currentFile?.path}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-[11px] shrink-0">
            <span className="flex items-center space-x-1 text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span>Original (Pre-patch)</span>
            </span>
            <ArrowRight className="h-3 w-3 text-gray-500" />
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Patched (Autonomous AI)</span>
            </span>
          </div>
        </div>

        {/* Content: Mobile Single-Pane or Desktop Side-by-Side */}
        <div className="flex-1 overflow-auto custom-scrollbar min-w-0">
          {/* Mobile Single-Pane view */}
          <div className="block md:hidden p-3 bg-[#0a0d14] overflow-x-auto min-w-0">
            {mobileDiffView === 'original' ? (
              <div>
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 font-mono">
                  [BEFORE] Original Version ({originalLines.length} lines)
                </div>
                {originalLines.length > 0 ? (
                  <pre className="font-mono text-[11px] leading-5 text-gray-300">
                    {originalLines.map((line, i) => (
                      <div key={i} className="hover:bg-red-950/20 px-1">
                        <span className="inline-block w-7 text-gray-600 select-none">{i + 1}</span>
                        {line}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div className="text-gray-500 italic py-6 text-center text-xs">
                    New file created from scratch by MogsAI. No previous version.
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">
                  [AFTER] Patched / Generated Version ({modifiedLines.length} lines)
                </div>
                <pre className="font-mono text-[11px] leading-5 text-gray-200">
                  {modifiedLines.map((line, i) => {
                    const isNew = i >= originalLines.length || line !== originalLines[i];
                    return (
                      <div
                        key={i}
                        className={`px-1 ${
                          isNew
                            ? 'bg-emerald-950/30 text-emerald-200 border-l-2 border-emerald-500'
                            : 'hover:bg-emerald-950/10'
                        }`}
                      >
                        <span className="inline-block w-7 text-gray-600 select-none">{i + 1}</span>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>

          {/* Desktop Side-by-Side View */}
          <div className="hidden md:grid md:grid-cols-2 divide-x divide-[#1a2233] h-full">
            {/* Left: Original */}
            <div className="p-3 bg-[#0a0d14] overflow-x-auto">
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2 font-mono">
                [BEFORE] Original Version
              </div>
              {originalLines.length > 0 ? (
                <pre className="font-mono text-[11px] leading-5 text-gray-300">
                  {originalLines.map((line, i) => (
                    <div key={i} className="hover:bg-red-950/20 px-1">
                      <span className="inline-block w-8 text-gray-600 select-none">{i + 1}</span>
                      {line}
                    </div>
                  ))}
                </pre>
              ) : (
                <div className="text-gray-500 italic py-8 text-center">
                  New file created from scratch by MogsAI. No previous version.
                </div>
              )}
            </div>

            {/* Right: Modified */}
            <div className="p-3 bg-[#0b0f17] overflow-x-auto">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">
                [AFTER] Patched / Generated Version
              </div>
              <pre className="font-mono text-[11px] leading-5 text-gray-200">
                {modifiedLines.map((line, i) => {
                  const isNew = i >= originalLines.length || line !== originalLines[i];
                  return (
                    <div
                      key={i}
                      className={`px-1 ${
                        isNew
                          ? 'bg-emerald-950/30 text-emerald-200 border-l-2 border-emerald-500'
                          : 'hover:bg-emerald-950/10'
                      }`}
                    >
                      <span className="inline-block w-8 text-gray-600 select-none">{i + 1}</span>
                      {line}
                    </div>
                  );
                })}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
