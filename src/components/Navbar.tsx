import React from 'react';
import {
  Boxes,
  Download,
  Settings,
  BookOpen,
  FileCode,
  Layers,
  Zap,
  Menu,
  MessageSquare,
  FolderCode,
  GitBranch,
  CheckCircle,
  Terminal,
  Bug,
  FileText,
} from 'lucide-react';
import { MinecraftPlatform, AIMode, BuildTool } from '../types/mogsai';
import { MINECRAFT_VERSIONS, PLATFORM_SPECS } from '../lib/minecraftKnowledge';

export type WorkspaceTabType = 'editor' | 'diff' | 'projectMap' | 'audit' | 'console' | 'diagnostics' | 'readme';

interface NavbarProps {
  platform: MinecraftPlatform;
  setPlatform: (p: MinecraftPlatform) => void;
  version: string;
  setVersion: (v: string) => void;
  buildTool: BuildTool;
  setBuildTool: (b: BuildTool) => void;
  javaVersion: number;
  currentMode: AIMode;
  setMode: (m: AIMode) => void;
  onExportZip: () => void;
  onExportJar: () => void;
  onOpenSettings: () => void;
  onOpenKnowledge: () => void;
  currentView: 'chat' | 'workspace';
  setCurrentView: (v: 'chat' | 'workspace') => void;
  activeWorkspaceTab: WorkspaceTabType;
  setActiveWorkspaceTab: (t: WorkspaceTabType) => void;
  onToggleSidebar: () => void;
  hasProject: boolean;
  projectName?: string;
  canDownloadJar?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  platform,
  setPlatform,
  version,
  setVersion,
  buildTool,
  setBuildTool,
  javaVersion,
  currentMode,
  setMode,
  onExportZip,
  onExportJar,
  onOpenSettings,
  onOpenKnowledge,
  currentView,
  setCurrentView,
  activeWorkspaceTab,
  setActiveWorkspaceTab,
  onToggleSidebar,
  hasProject,
  projectName = 'MogsAI Project',
  canDownloadJar = false,
}) => {
  return (
    <header className="border-b border-[#1b2333] bg-[#0c1018] text-white select-none w-full shrink-0">
      {/* Top Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2 gap-2 w-full">
        {/* Left: Menu button + Brand */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg bg-[#141b27] hover:bg-[#1e2638] text-gray-400 hover:text-white border border-[#232d3f] transition-colors"
            title="Menu & Chats"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
              <Boxes className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-['Space_Grotesk']">
              MogsAI
            </span>
          </div>
        </div>

        {/* Center: Main View Toggle [CHAT / WORKSPACE] */}
        <div className="flex items-center space-x-1 border border-[#212c40] rounded-lg p-0.5 bg-[#101520] text-xs font-sans shrink-0">
          <button
            onClick={() => setCurrentView('chat')}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              currentView === 'chat'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setCurrentView('workspace')}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              currentView === 'workspace'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderCode className="h-3.5 w-3.5" />
            <span>Workspace</span>
            {hasProject && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 ml-0.5" />}
          </button>
        </div>

        {/* Right: Desktop Tools & Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Target Environment Badge (hidden on mobile, visible on desktop) */}
          <div className="hidden lg:flex items-center bg-[#131a26] border border-[#232e42] rounded-md px-2 py-1 text-[11px] font-mono">
            <span className="text-gray-500 mr-1.5">Target:</span>
            <span className="text-emerald-300 font-semibold uppercase">{platform} {version}</span>
            <span className="text-gray-500 mx-1">•</span>
            <span className="text-amber-300">Java {javaVersion}</span>
          </div>

          {/* RAG Knowledge (hidden on mobile header, in sidebar drawer) */}
          <button
            onClick={onOpenKnowledge}
            className="hidden sm:flex items-center space-x-1.5 bg-[#141b27] hover:bg-[#1d2738] border border-[#232d3f] text-gray-300 hover:text-white px-2.5 py-1 rounded-md transition-colors text-xs"
            title="Minecraft API Knowledge Base & RAG"
          >
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>RAG</span>
          </button>

          {/* Settings (hidden on mobile header, available in sidebar menu drawer) */}
          <button
            onClick={onOpenSettings}
            className="hidden md:flex p-1.5 rounded-md bg-[#141b27] hover:bg-[#1d2738] border border-[#232d3f] text-gray-400 hover:text-white transition-colors"
            title="Settings & Model Routing"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Source ZIP Export */}
          <button
            onClick={onExportZip}
            disabled={!hasProject}
            className="hidden md:flex items-center space-x-1 bg-[#161f2e] hover:bg-[#202b3e] disabled:opacity-30 disabled:cursor-not-allowed border border-[#29364d] text-gray-200 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
            title="Download full project source archive"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>ZIP</span>
          </button>

          {/* JAR Download: ONLY enabled when verified compiled JAR exists */}
          {canDownloadJar && (
            <button
              onClick={onExportJar}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold shadow-md shadow-emerald-700/20 transition-all border border-emerald-400/30"
              title="Download verified compiled JAR"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-200 fill-emerald-200" />
              <span className="hidden sm:inline">Get JAR</span>
              <span className="sm:hidden">JAR</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-header row on Mobile: [ProjectName · Platform Version · Java] */}
      <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-[#090d14] border-t border-[#182030] text-[11px] font-mono text-gray-400 overflow-x-auto whitespace-nowrap min-w-0">
        <div className="truncate flex-1">
          <span className="text-white font-medium">{projectName}</span>
          <span className="mx-1 text-gray-600">·</span>
          <span className="text-emerald-400 uppercase">{platform} {version}</span>
          <span className="mx-1 text-gray-600">·</span>
          <span className="text-amber-400">Java {javaVersion}</span>
        </div>
        {hasProject && (
          <button
            onClick={onExportZip}
            className="ml-2 text-cyan-400 hover:underline flex items-center space-x-1 shrink-0"
          >
            <Download className="h-3 w-3" />
            <span>Source ZIP</span>
          </button>
        )}
      </div>

      {/* Project Tabs row (Files / Diff / Project Map / Audit) when in Workspace */}
      {currentView === 'workspace' && (
        <div className="flex items-center justify-between px-3 md:px-4 py-1.5 bg-[#090d14] border-t border-[#182030] text-xs">
          <div className="hidden md:flex items-center space-x-2 font-mono text-[11px] text-gray-400 truncate">
            <span className="text-white font-semibold truncate">{projectName}</span>
            <span>•</span>
            <span className="text-emerald-400 uppercase">{platform} {version}</span>
            <span>•</span>
            <span className="text-amber-400">Java {javaVersion}</span>
          </div>

          {/* Horizontally scrollable tabs container with zero viewport overflow */}
          <div className="flex items-center space-x-1 border border-[#1f293d] rounded p-0.5 bg-[#0d121b] overflow-x-auto whitespace-nowrap min-w-0 max-w-full scrollbar-none w-full md:w-auto">
            <button
              onClick={() => setActiveWorkspaceTab('editor')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'editor'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileCode className="h-3 w-3 text-cyan-400" />
              <span>Files</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('diff')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'diff'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <GitBranch className="h-3 w-3 text-amber-400" />
              <span>Diff</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('projectMap')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'projectMap'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="h-3 w-3 text-emerald-400" />
              <span>Project Map</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('audit')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'audit'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <CheckCircle className="h-3 w-3 text-purple-400" />
              <span>Audit</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('console')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'console'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Terminal className="h-3 w-3 text-emerald-400" />
              <span>Console</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('diagnostics')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'diagnostics'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Bug className="h-3 w-3 text-amber-400" />
              <span>Diagnostics</span>
            </button>
            <button
              onClick={() => setActiveWorkspaceTab('readme')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 shrink-0 ${
                activeWorkspaceTab === 'readme'
                  ? 'bg-[#1e2738] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="h-3 w-3 text-cyan-400" />
              <span>README</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
