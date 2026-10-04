import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Search,
  Folder,
  FileText,
  FileJson,
  Code,
  Terminal,
  Save,
  ChevronRight,
  List,
} from 'lucide-react';
import { ProjectFile } from '../types/mogsai';

interface CodeEditorProps {
  files: ProjectFile[];
  selectedFilePath: string;
  onSelectFile: (path: string) => void;
  onUpdateFileContent: (path: string, newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  selectedFilePath,
  onSelectFile,
  onUpdateFileContent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Mobile sub-tab: 'files' | 'editor'
  const [mobileSubTab, setMobileSubTab] = useState<'files' | 'editor'>('files');

  const selectedFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (path: string, lang?: string) => {
    if (path.endsWith('.java')) return <FileCode className="h-4 w-4 text-amber-400 shrink-0" />;
    if (path.endsWith('.kt')) return <Code className="h-4 w-4 text-purple-400 shrink-0" />;
    if (path.endsWith('.yml') || path.endsWith('.yaml')) return <FileText className="h-4 w-4 text-emerald-400 shrink-0" />;
    if (path.endsWith('.json')) return <FileJson className="h-4 w-4 text-blue-400 shrink-0" />;
    if (path.endsWith('.gradle') || path.endsWith('.gradle.kts')) return <Terminal className="h-4 w-4 text-cyan-400 shrink-0" />;
    if (path.endsWith('.sk')) return <Code className="h-4 w-4 text-rose-400 shrink-0" />;
    return <FileText className="h-4 w-4 text-gray-400 shrink-0" />;
  };

  const lines = selectedFile ? selectedFile.content.split('\n') : [];

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[#0a0d14] text-gray-300 font-mono text-xs overflow-hidden">
      {/* Mobile-Only Tab Switcher: [ Files | Editor ] */}
      <div className="flex md:hidden items-center justify-between border-b border-[#1a2233] bg-[#0c1018] px-3 py-1.5 shrink-0 select-none">
        <div className="flex items-center space-x-1 border border-[#232f48] rounded-md p-0.5 bg-[#101520] text-xs font-sans">
          <button
            onClick={() => setMobileSubTab('files')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              mobileSubTab === 'files'
                ? 'bg-[#1b253b] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <List className="h-3.5 w-3.5 text-emerald-400" />
            <span>Files ({files.length})</span>
          </button>

          <button
            onClick={() => setMobileSubTab('editor')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center space-x-1.5 transition-colors ${
              mobileSubTab === 'editor'
                ? 'bg-[#1b253b] text-white shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileCode className="h-3.5 w-3.5 text-cyan-400" />
            <span>Code Editor</span>
          </button>
        </div>

        {selectedFile && mobileSubTab === 'editor' && (
          <span className="text-[10px] text-gray-400 truncate max-w-[140px] font-mono">
            {selectedFile.path.split('/').pop()}
          </span>
        )}
      </div>

      {/* File Explorer (Visible on Desktop, or when mobileSubTab === 'files' on mobile) */}
      <div
        className={`w-full md:w-60 lg:w-64 border-r border-[#1a2233] bg-[#0c1018] flex flex-col shrink-0 select-none ${
          mobileSubTab === 'files' ? 'flex-1 md:flex-initial' : 'hidden md:flex'
        }`}
      >
        {/* Explorer Header */}
        <div className="p-2.5 border-b border-[#1a2233] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-1.5 font-sans">
            <Folder className="h-3.5 w-3.5 text-emerald-400" />
            Project Files
          </span>
          <span className="text-[10px] text-gray-500 font-mono bg-[#141b27] px-1.5 py-0.5 rounded border border-[#212b3e]">
            {files.length} files
          </span>
        </div>

        {/* Search */}
        <div className="p-2 border-b border-[#1a2233]">
          <div className="relative">
            <Search className="h-3 w-3 absolute left-2 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121824] border border-[#212b3e] rounded pl-7 pr-2 py-1 text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* File Tree List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar min-w-0">
          {filteredFiles.map((file) => {
            const isSelected = file.path === selectedFile?.path;
            const parts = file.path.split('/');
            const fileName = parts.pop() || '';
            const dirName = parts.length > 0 ? parts.join('/') : '';

            return (
              <button
                key={file.path}
                onClick={() => {
                  onSelectFile(file.path);
                  setMobileSubTab('editor'); // Auto switch to editor on mobile click
                }}
                className={`w-full text-left px-2 py-1.5 rounded-md flex items-center space-x-2 transition-all min-w-0 ${
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#121824]'
                }`}
              >
                {getFileIcon(file.path, file.language)}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="truncate text-[11px] font-sans font-medium">{fileName}</div>
                  {dirName && (
                    <div className="text-[9px] text-gray-500 truncate font-mono">{dirName}</div>
                  )}
                </div>
                {file.isModified && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Modified" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor & Viewer Area (Visible on Desktop, or when mobileSubTab === 'editor' on mobile) */}
      <div
        className={`flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0d1117] ${
          mobileSubTab === 'editor' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {/* Editor Top Bar */}
        <div className="h-10 border-b border-[#1b2333] bg-[#0c1018] flex items-center justify-between px-3 select-none shrink-0 min-w-0">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-400 font-mono truncate min-w-0 mr-2">
            {getFileIcon(selectedFile?.path || '', selectedFile?.language || '')}
            <span className="text-gray-200 font-medium truncate text-xs">{selectedFile?.path}</span>
            {selectedFile?.isModified && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30 shrink-0">
                MODIFIED
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2 py-1 rounded text-[11px] flex items-center space-x-1 border transition-colors ${
                isEditing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-[#151c28] text-gray-300 border-[#263147] hover:text-white'
              }`}
            >
              <Save className="h-3 w-3" />
              <span className="hidden sm:inline">{isEditing ? 'Editing' : 'Edit'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2 py-1 rounded text-[11px] bg-[#151c28] hover:bg-[#1f293b] text-gray-300 hover:text-white border border-[#263147] flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Content View / Edit */}
        <div className="flex-1 overflow-auto custom-scrollbar flex min-w-0">
          {isEditing ? (
            <textarea
              value={selectedFile?.content || ''}
              onChange={(e) => onUpdateFileContent(selectedFile.path, e.target.value)}
              className="w-full h-full bg-[#0b0e14] text-emerald-200 p-3 md:p-4 font-mono text-xs focus:outline-none resize-none leading-relaxed border-none selection:bg-emerald-500/30"
              spellCheck={false}
            />
          ) : (
            <div className="flex min-w-full">
              {/* Line Numbers */}
              <div className="w-10 sm:w-12 py-3 pr-2 sm:pr-3 text-right bg-[#090c12] text-gray-600 select-none border-r border-[#182030] shrink-0 font-mono text-[11px]">
                {lines.map((_, i) => (
                  <div key={i} className="leading-5">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Code text with independent horizontal scroll */}
              <pre className="p-3 text-gray-200 overflow-x-auto font-mono text-[11px] leading-5 whitespace-pre flex-1 selection:bg-emerald-500/30 selection:text-emerald-100 min-w-0">
                <code>{selectedFile?.content}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
