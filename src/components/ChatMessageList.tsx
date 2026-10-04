import React from 'react';
import {
  Boxes,
  User,
  CheckCircle,
  AlertTriangle,
  Folder,
  Download,
  FileCode,
  RotateCw,
  Sparkles,
  Paperclip,
  Edit3,
  ExternalLink,
  Layers,
  Terminal,
  ShieldAlert,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { ChatMessage, MogsAIProject, BuildStateStatus } from '../types/mogsai';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSelectPromptSuggestion: (prompt: string) => void;
  onOpenWorkspace: (project: MogsAIProject) => void;
  onDownloadJar: (project: MogsAIProject) => void;
  onDownloadZip: (project: MogsAIProject) => void;
  onEditMessage: (message: ChatMessage) => void;
  onRegenerate: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isGenerating,
  onSelectPromptSuggestion,
  onOpenWorkspace,
  onDownloadJar,
  onDownloadZip,
  onEditMessage,
  onRegenerate,
}) => {
  const suggestions = [
    'Create a Paper plugin with "/spawn".',
    'Create a Skript that gives a player a starter kit when they join.',
    'Create a GUI shop with configurable prices.',
    'Create a prison plugin with mines, ranks and "/mine".',
  ];

  const renderBuildBadge = (buildResult?: ChatMessage['buildResult'], project?: MogsAIProject) => {
    const status = buildResult?.status || project?.buildState?.status || (buildResult?.passed ? 'build_successful' : 'build_environment_unavailable');

    switch (status) {
      case 'build_successful':
        return (
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>✓ Build Successful · Ready for deployment</span>
          </div>
        );
      case 'build_environment_unavailable':
        return (
          <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>● Build Environment Unavailable</span>
          </div>
        );
      case 'validation_failed':
        return (
          <div className="flex items-center space-x-1.5 text-red-400 font-bold text-xs">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>● Artifact Validation Failed</span>
          </div>
        );
      case 'compiler_error':
        return (
          <div className="flex items-center space-x-1.5 text-red-400 font-bold text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>● Compiler Error</span>
          </div>
        );
      case 'validating_artifact':
        return (
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span>● Validating Artifact Bytecode</span>
          </div>
        );
      case 'compiling':
        return (
          <div className="flex items-center space-x-1.5 text-blue-400 font-semibold text-xs">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span>● Compiling Source</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1.5 text-gray-300 font-medium text-xs">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span>● Source Generated</span>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar w-full min-w-0">
      {/* Empty State / Welcome Screen */}
      {messages.length === 0 && (
        <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6 sm:space-y-8 min-w-0">
          <div className="text-center space-y-2 sm:space-y-3">
            <div className="inline-flex h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-xl shadow-emerald-500/20 border border-emerald-400/30">
              <Boxes className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              MogsAI
            </h1>
            <p className="text-xs sm:text-sm text-emerald-400 font-mono">Your AI Minecraft Developer</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed px-2">
              Describe any Minecraft plugin, mod, script, or configuration. MogsAI will
              autonomously plan, architect, write production code, validate in an isolated sandbox, and package
              production-ready software.
            </p>
          </div>

          {/* Dynamic Example Prompts */}
          <div className="space-y-2.5 px-1 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-mono uppercase text-gray-500 font-semibold tracking-wider block">
              Try an idea:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPromptSuggestion(sug)}
                  className="text-left p-3 rounded-xl bg-[#111624] hover:bg-[#161e31] border border-[#202a40] hover:border-emerald-500/40 text-xs text-gray-200 transition-all shadow-sm flex items-start space-x-2.5 group min-w-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="leading-snug break-words flex-1 min-w-0">{sug}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message List */}
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const project = message.projectSnapshot;
        const canDownloadJar = Boolean(
          message.buildResult?.canDownloadJar ||
          (project?.buildState?.status === 'build_successful' && project.buildState.canDownloadJar)
        );

        return (
          <div
            key={message.id}
            className={`flex items-start space-x-2 sm:space-x-3 max-w-4xl mx-auto w-full min-w-0 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            {/* Assistant Avatar */}
            {!isUser && (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Boxes className="h-4 w-4 text-emerald-400" />
              </div>
            )}

            {/* Content Bubble */}
            <div
              className={`space-y-3 rounded-2xl p-3.5 sm:p-4 text-xs font-sans shadow-md max-w-full sm:max-w-[85%] md:max-w-[80%] min-w-0 overflow-hidden ${
                isUser
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none ml-auto'
                  : 'bg-[#111724] border border-[#212c42] text-gray-200 rounded-tl-none mr-auto'
              }`}
            >
              {/* Message text with word-wrap and horizontal scroll for code blocks */}
              <div className="leading-relaxed whitespace-pre-wrap break-words min-w-0">
                {message.content}
              </div>

              {/* Attachments pills if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 min-w-0">
                  {message.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center space-x-1.5 bg-black/20 px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono text-emerald-200 max-w-full min-w-0"
                    >
                      <Paperclip className="h-3 w-3 shrink-0" />
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* MogsAI Structured Project Card */}
              {!isUser && project && (
                <div className="mt-3 bg-[#0a0e16] border border-[#1e283c] rounded-xl p-3 sm:p-3.5 space-y-3 font-mono text-[11px] min-w-0 overflow-hidden">
                  {/* Status header */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#1b2336] pb-2 font-sans min-w-0">
                    <div className="min-w-0">
                      {renderBuildBadge(message.buildResult, project)}
                    </div>

                    <div className="flex items-center space-x-1.5 text-[9px] sm:text-[10px] text-gray-400 shrink-0">
                      <span className="bg-[#141c2c] px-1.5 sm:px-2 py-0.5 rounded border border-[#202c42] uppercase font-mono">
                        {project.platform} {project.version}
                      </span>
                      <span className="bg-[#141c2c] px-1.5 sm:px-2 py-0.5 rounded border border-[#202c42] font-mono">
                        Java {project.javaVersion}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Files generated */}
                  <div className="space-y-1 font-sans text-gray-300 min-w-0">
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span className="font-semibold text-white truncate">{project.name}</span>
                      <span className="text-gray-400 font-mono text-[10px] shrink-0">
                        {project.files.length} files
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{project.description}</p>

                    {/* Explanatory note for build environment unavailable */}
                    {project.buildState?.status === 'build_environment_unavailable' && (
                      <p className="text-[10px] text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-800/30 leading-relaxed font-sans">
                        {project.buildState.message}
                      </p>
                    )}

                    {project.buildState?.status === 'validation_failed' && (
                      <p className="text-[10px] text-red-300 bg-red-950/20 p-2 rounded border border-red-800/30 leading-relaxed font-sans">
                        {project.buildState.message}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-[#1b2336] flex flex-wrap items-center gap-1.5 sm:gap-2 font-sans">
                    <button
                      onClick={() => onOpenWorkspace(project)}
                      className="flex items-center space-x-1.5 bg-[#172133] hover:bg-[#202d45] text-cyan-300 border border-cyan-500/30 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
                    >
                      <Folder className="h-3.5 w-3.5 shrink-0" />
                      <span>Workspace</span>
                    </button>

                    <button
                      onClick={() => onDownloadZip(project)}
                      className="flex items-center space-x-1.5 bg-[#151c2a] hover:bg-[#1d273a] text-gray-200 hover:text-white border border-[#28354f] px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>Source ZIP</span>
                    </button>

                    {/* JAR Download is strictly conditioned on verified build */}
                    {canDownloadJar && (
                      <button
                        onClick={() => onDownloadJar(project)}
                        className="flex items-center space-x-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                      >
                        <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Download JAR</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Footer row: timestamp & edit */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 font-mono">
                <span>{message.timestamp}</span>
                {isUser && (
                  <button
                    onClick={() => onEditMessage(message)}
                    className="opacity-70 hover:opacity-100 flex items-center space-x-1 transition-opacity text-white cursor-pointer"
                    title="Edit & Resend"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5 text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Loading animation while generating */}
      {isGenerating && (
        <div className="flex items-start space-x-2 sm:space-x-3 max-w-4xl mx-auto w-full min-w-0">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Boxes className="h-4 w-4 text-emerald-400 animate-spin" />
          </div>
          <div className="bg-[#111724] border border-[#212c42] rounded-2xl rounded-tl-none p-3.5 sm:p-4 text-xs text-gray-300 space-y-1.5 max-w-full sm:max-w-[80%] min-w-0">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-semibold text-cyan-300 font-mono text-[11px] sm:text-xs">
                MogsAI Autonomous Pipeline Executing...
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-400">
              Analyzing requirements, compiling source, and verifying artifact bytecode...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
