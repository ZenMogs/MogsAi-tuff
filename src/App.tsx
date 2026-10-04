import React, { useState, useEffect, useRef } from 'react';
import { Navbar, WorkspaceTabType } from './components/Navbar';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMessageList } from './components/ChatMessageList';
import { ChatComposer } from './components/ChatComposer';
import { PipelineTracker } from './components/PipelineTracker';
import { CodeEditor } from './components/CodeEditor';
import { DiffViewer } from './components/DiffViewer';
import { ProjectMapVisualizer } from './components/ProjectMapVisualizer';
import { ReviewAuditPanel } from './components/ReviewAuditPanel';
import { BuildConsole, LogLine } from './components/BuildConsole';
import { ErrorDiagnosticPanel } from './components/ErrorDiagnosticPanel';
import { KnowledgeExplorer } from './components/KnowledgeExplorer';
import { SettingsModal } from './components/SettingsModal';
import {
  MinecraftPlatform,
  AIMode,
  BuildTool,
  StepState,
  MogsAIProject,
  ChatMessage,
  ChatSession,
  FileAttachment,
} from './types/mogsai';
import {
  executeAutonomousPipeline,
  INITIAL_PIPELINE_STEPS,
} from './lib/autonomousPipeline';
import { exportProjectZip, exportCompiledJar, downloadBlob } from './lib/projectPackager';
import { getRecommendedJava } from './lib/minecraftKnowledge';
import { Terminal, Bug, FileText, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'mogsai_chat_sessions_v2';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'chat' | 'workspace'>('chat');
  // Initialize sidebar closed on mobile (<768px), open on desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTabType>('editor');
  const [bottomTab, setBottomTab] = useState<'console' | 'diagnostics' | 'readme'>('console');
  const [isBottomOpen, setIsBottomOpen] = useState(true);

  // Modals
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings & Model Routing
  const [maxRetries, setMaxRetries] = useState(3);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [routingMode, setRoutingMode] = useState<'auto' | 'quality' | 'speed'>('auto');

  // Environment Defaults
  const [platform, setPlatform] = useState<MinecraftPlatform>('paper');
  const [version, setVersion] = useState<string>('1.21.4');
  const [javaVersion, setJavaVersion] = useState<number>(21);
  const [buildTool, setBuildTool] = useState<BuildTool>('gradle');
  const [currentMode, setMode] = useState<AIMode>('generate');

  // Chat Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat sessions from localStorage', e);
    }
    // Default initial session
    const initialSessionId = 'session_' + Date.now();
    return [
      {
        id: initialSessionId,
        title: 'New Minecraft Project',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        platform: 'paper',
        version: '1.21.4',
        buildTool: 'gradle',
        javaVersion: 21,
        messages: [],
        currentProject: null,
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || 'default');
  const [composerInitialPrompt, setComposerInitialPrompt] = useState('');

  // Generation & Pipeline Tracking
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<StepState[]>(INITIAL_PIPELINE_STEPS);

  // Workspace Selected File
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');

  // Build Console Logs
  const [logs, setLogs] = useState<LogLine[]>([
    { timestamp: new Date().toLocaleTimeString(), type: 'info', text: '[MogsAI] Workspace initialized. Ready for instructions.' },
  ]);

  // Active Session helper
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const activeProject = currentSession?.currentProject || null;

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage', e);
    }
  }, [sessions]);

  // Sync Java version when MC version changes
  useEffect(() => {
    setJavaVersion(getRecommendedJava(version));
  }, [version]);

  // Update selected file when project changes
  useEffect(() => {
    if (activeProject && activeProject.files.length > 0) {
      if (!selectedFilePath || !activeProject.files.some((f) => f.path === selectedFilePath)) {
        setSelectedFilePath(activeProject.files[0].path);
      }
    }
  }, [activeProject]);

  const addLog = (text: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { text, type, timestamp: time }]);
  };

  // Chat Session Actions
  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Minecraft Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      platform,
      version,
      buildTool,
      javaVersion,
      messages: [],
      currentProject: null,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setCurrentView('chat');
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const freshId = 'session_' + Date.now();
        return [
          {
            id: freshId,
            title: 'New Minecraft Project',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            platform: 'paper',
            version: '1.21.4',
            buildTool: 'gradle',
            javaVersion: 21,
            messages: [],
            currentProject: null,
          },
        ];
      }
      return remaining;
    });
    if (activeSessionId === id) {
      setActiveSessionId(sessions.find((s) => s.id !== id)?.id || '');
    }
  };

  // Main Generation Pipeline from Chat
  const handleSendMessage = async (userPrompt: string, attachments: FileAttachment[] = []) => {
    if (isGenerating) return;

    // 1. Add User Message
    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments,
    };

    // Auto-update session title on first message if default
    let sessionTitle = currentSession.title;
    if (currentSession.messages.length === 0 || sessionTitle === 'New Minecraft Project') {
      sessionTitle = userPrompt.slice(0, 30).trim() + (userPrompt.length > 30 ? '...' : '');
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, userMessage],
            }
          : s
      )
    );

    // 2. Execute Autonomous Pipeline
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    addLog(`----------------------------------------------------------------------`, 'info');
    addLog(`[MogsAI] Ingested user prompt: "${userPrompt}"`, 'info');

    // Multi-turn conversation history
    const conversationHistory = (currentSession.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const resultProject = await executeAutonomousPipeline(
        {
          prompt: userPrompt,
          mode: currentSession.currentProject ? 'modify' : currentMode,
          platform,
          version,
          buildTool,
          javaVersion,
          existingProject: currentSession.currentProject,
          history: conversationHistory,
          attachments,
          abortSignal: abortControllerRef.current.signal,
        },
        {
          onStepUpdate: (steps) => setPipelineSteps(steps),
          onLog: (line, type) => addLog(line, type),
        }
      );

      // 3. Add Assistant Message with genuine, non-fabricated build verification
      const isBuildSuccessful = Boolean(
        resultProject.buildState?.status === 'build_successful' && resultProject.buildState?.canDownloadJar
      );
      const isBuildEnvUnavailable = resultProject.buildState?.status === 'build_environment_unavailable';
      const isValidationFailed = resultProject.buildState?.status === 'validation_failed';
      const isCompilerError = resultProject.buildState?.status === 'compiler_error';

      let buildStatusReport = '';
      if (isBuildSuccessful) {
        buildStatusReport = `## Build & Verification\n✓ Compiled successfully with javac for ${resultProject.platform.toUpperCase()} ${resultProject.version} on Java ${resultProject.javaVersion}.\n✓ Bytecode and plugin descriptor verified. Production JAR ready for server \`/plugins/\`.`;
      } else if (isBuildEnvUnavailable) {
        buildStatusReport = `## Build Notice\n⚠ **Build Sandbox Notice**: Host environment lacks a Java compiler (\`javac\`). To maintain strict integrity, MogsAI **never creates fake placeholder JARs**.\n- **Source Code**: 100% complete and validated. Download the **Source ZIP** to build locally with \`./gradlew build\` or \`mvn package\`.\n- **Deployable JAR**: Requires compilation in an environment with JDK ${resultProject.javaVersion}.`;
      } else if (isValidationFailed) {
        buildStatusReport = `## Validation Notice\n✖ **Artifact Validation Failed**: ${resultProject.buildState?.message || 'Static verification failed.'}\nMogsAI will not produce an invalid or unverified JAR.`;
      } else if (isCompilerError) {
        buildStatusReport = `## Compiler Error\n✖ **Compilation Failed**: ${resultProject.buildState?.message || 'Compiler reported errors.'}\nInspect the Error Diagnostics panel for root cause details.`;
      } else {
        buildStatusReport = `## Build Status\n✓ All ${resultProject.files.length} project files generated and structured.`;
      }

      const assistantMessage: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: `I have analyzed your request and implemented the required Minecraft software.\n\n## Architecture\n${resultProject.projectMap.architectureOverview}\n\n## Implementation (${resultProject.files.length} files)\n${resultProject.files.map((f) => `- \`${f.path}\``).slice(0, 6).join('\n')}${resultProject.files.length > 6 ? `\n- *...and ${resultProject.files.length - 6} more files*` : ''}\n\n${buildStatusReport}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        projectSnapshot: resultProject,
        buildResult: resultProject.buildState || {
          status: isBuildSuccessful ? 'build_successful' : 'build_environment_unavailable',
          passed: isBuildSuccessful,
          message: isBuildSuccessful
            ? `✓ Build successful for ${resultProject.name}`
            : 'Source generated successfully. Production JAR requires local JDK build.',
          canDownloadJar: isBuildSuccessful,
          jarName: isBuildSuccessful ? `${resultProject.name}-1.0.0.jar` : undefined,
        },
        status: 'completed',
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                currentProject: resultProject,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, assistantMessage],
              }
            : s
        )
      );

      setSelectedFilePath(resultProject.files[0]?.path || '');
    } catch (err: any) {
      if (err.message === 'Pipeline stopped by user') {
        addLog(`[Pipeline] Generation cancelled by user.`, 'warn');
      } else {
        addLog(`[Pipeline Error] ${err?.message || 'Build failed'}`, 'error');
        // Add error message to chat
        const errorMsg: ChatMessage = {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: `Build encountered an issue:\n${err?.message || 'Error executing pipeline'}\n\nMogsAI was unable to complete this generation step.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'error',
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s))
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleEditMessage = (msg: ChatMessage) => {
    setComposerInitialPrompt(msg.content);
  };

  const handleRegenerate = () => {
    const lastUserMsg = [...(currentSession.messages || [])].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.attachments || []);
    }
  };

  const handleUpdateFileContent = (path: string, newContent: string) => {
    if (!activeProject) return;

    const updatedFiles = activeProject.files.map((f) => {
      if (f.path === path) {
        return {
          ...f,
          content: newContent,
          isModified: true,
          originalContent: f.originalContent || f.content,
        };
      }
      return f;
    });

    const updatedProject = { ...activeProject, files: updatedFiles };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              currentProject: updatedProject,
            }
          : s
      )
    );
  };

  const handleExportZip = async () => {
    if (!activeProject) return;
    addLog(`[Packager] Generating full source code ZIP archive...`, 'info');
    try {
      const blob = await exportProjectZip(activeProject);
      downloadBlob(blob, `${activeProject.name}-source.zip`);
      addLog(`[Packager] Successfully exported ${activeProject.name}-source.zip`, 'success');
    } catch (err: any) {
      addLog(`[Packager Error] ${err?.message}`, 'error');
    }
  };

  const handleExportJar = async () => {
    if (!activeProject) return;
    if (!activeProject.buildState?.canDownloadJar) {
      addLog(
        `[Packager] Cannot export JAR: No verified compiled bytecode exists for this project. To maintain integrity, MogsAI never creates fake placeholder JARs. Please download the complete Source ZIP and run ./gradlew build or mvn package with JDK ${activeProject.javaVersion}.`,
        'warn'
      );
      return;
    }
    addLog(`[Packager] Compiling runnable production-ready .jar binary...`, 'info');
    try {
      const blob = await exportCompiledJar(activeProject);
      downloadBlob(blob, `${activeProject.name}-1.0.0.jar`);
      addLog(`[Packager] Successfully exported ${activeProject.name}-1.0.0.jar ready for server /plugins/`, 'success');
    } catch (err: any) {
      addLog(`[Packager Error] ${err?.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-full overflow-hidden overflow-x-hidden bg-[#090c13] text-gray-200 font-sans">
      {/* Top Navbar */}
      <Navbar
        platform={platform}
        setPlatform={setPlatform}
        version={version}
        setVersion={setVersion}
        buildTool={buildTool}
        setBuildTool={setBuildTool}
        javaVersion={javaVersion}
        currentMode={currentMode}
        setMode={setMode}
        onExportZip={handleExportZip}
        onExportJar={handleExportJar}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeWorkspaceTab={activeWorkspaceTab}
        setActiveWorkspaceTab={setActiveWorkspaceTab}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        hasProject={Boolean(activeProject)}
        projectName={activeProject?.name}
        canDownloadJar={Boolean(activeProject?.buildState?.canDownloadJar)}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Chat Sessions Sidebar */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setCurrentView('chat');
          }}
          onNewChat={handleNewChat}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenKnowledge={() => setIsKnowledgeOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Center Content View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0a0d14]">
          {/* VIEW A: CHAT VIEW */}
          {currentView === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Visual Pipeline Banner if generating */}
              {isGenerating && <PipelineTracker steps={pipelineSteps} currentRunningIndex={0} />}

              {/* Chat Messages */}
              <ChatMessageList
                messages={currentSession.messages}
                isGenerating={isGenerating}
                onSelectPromptSuggestion={(sug) => handleSendMessage(sug)}
                onOpenWorkspace={(proj) => setCurrentView('workspace')}
                onDownloadJar={handleExportJar}
                onDownloadZip={handleExportZip}
                onEditMessage={handleEditMessage}
                onRegenerate={handleRegenerate}
              />

              {/* Composer at Bottom */}
              <ChatComposer
                onSendMessage={handleSendMessage}
                onStopGeneration={handleStopGeneration}
                isGenerating={isGenerating}
                platform={platform}
                setPlatform={setPlatform}
                version={version}
                setVersion={setVersion}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                initialPrompt={composerInitialPrompt}
              />
            </div>
          )}

          {/* VIEW B: WORKSPACE VIEW */}
          {currentView === 'workspace' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {activeProject ? (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  {/* Active tab content in Workspace */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {activeWorkspaceTab === 'editor' && (
                      <CodeEditor
                        files={activeProject.files}
                        selectedFilePath={selectedFilePath}
                        onSelectFile={(p) => setSelectedFilePath(p)}
                        onUpdateFileContent={handleUpdateFileContent}
                      />
                    )}

                    {activeWorkspaceTab === 'diff' && <DiffViewer files={activeProject.files} />}

                    {activeWorkspaceTab === 'projectMap' && (
                      <ProjectMapVisualizer
                        projectMap={activeProject.projectMap}
                        files={activeProject.files}
                      />
                    )}

                    {activeWorkspaceTab === 'audit' && (
                      <ReviewAuditPanel
                        issues={activeProject.reviewIssues}
                        checks={activeProject.validationChecks}
                      />
                    )}

                    {activeWorkspaceTab === 'console' && (
                      <div className="h-full flex flex-col min-h-0 overflow-hidden">
                        <BuildConsole
                          logs={logs}
                          onClear={() => setLogs([])}
                          isBuilding={isGenerating}
                        />
                      </div>
                    )}

                    {activeWorkspaceTab === 'diagnostics' && (
                      <div className="h-full overflow-y-auto custom-scrollbar">
                        <ErrorDiagnosticPanel debugHistory={activeProject.debugHistory} />
                      </div>
                    )}

                    {activeWorkspaceTab === 'readme' && (
                      <div className="h-full overflow-y-auto p-4 custom-scrollbar bg-[#080b11] text-xs font-mono">
                        <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">
                          {activeProject.readme ||
                            activeProject.files.find((f) => f.path === 'README.md')?.content ||
                            '# MogsAI Plugin\nProject documentation.'}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Bottom Drawer: Console & Diagnostics (Visible on desktop; on mobile these are accessible via top tabs) */}
                  <div
                    className={`hidden md:flex border-t border-[#1b2333] bg-[#0c1018] flex-col transition-all duration-200 shrink-0 ${
                      isBottomOpen ? 'h-56' : 'h-8'
                    }`}
                  >
                    {/* Drawer Header */}
                    <div className="h-8 px-3 bg-[#0a0d14] border-b border-[#1b2333] flex items-center justify-between select-none">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setBottomTab('console');
                            setIsBottomOpen(true);
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-medium flex items-center space-x-1.5 transition-colors ${
                            bottomTab === 'console' && isBottomOpen
                              ? 'bg-[#1b2438] text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <Terminal className="h-3 w-3 text-emerald-400" />
                          <span>Compiler Sandbox ({logs.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setBottomTab('diagnostics');
                            setIsBottomOpen(true);
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-medium flex items-center space-x-1.5 transition-colors ${
                            bottomTab === 'diagnostics' && isBottomOpen
                              ? 'bg-[#1b2438] text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <Bug className="h-3 w-3 text-amber-400" />
                          <span>Error Diagnostics ({activeProject.debugHistory.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setBottomTab('readme');
                            setIsBottomOpen(true);
                          }}
                          className={`px-3 py-1 rounded text-[11px] font-medium flex items-center space-x-1.5 transition-colors ${
                            bottomTab === 'readme' && isBottomOpen
                              ? 'bg-[#1b2438] text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <FileText className="h-3 w-3 text-cyan-400" />
                          <span>README</span>
                        </button>
                      </div>

                      {/* Collapse / Expand Toggle */}
                      <button
                        onClick={() => setIsBottomOpen(!isBottomOpen)}
                        className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1a2336] transition-colors"
                        title={isBottomOpen ? 'Collapse panel' : 'Expand panel'}
                      >
                        {isBottomOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Drawer Content */}
                    {isBottomOpen && (
                      <div className="flex-1 min-h-0 overflow-hidden">
                        {bottomTab === 'console' && (
                          <BuildConsole
                            logs={logs}
                            onClear={() => setLogs([])}
                            isBuilding={isGenerating}
                          />
                        )}

                        {bottomTab === 'diagnostics' && (
                          <div className="h-full overflow-y-auto custom-scrollbar">
                            <ErrorDiagnosticPanel debugHistory={activeProject.debugHistory} />
                          </div>
                        )}

                        {bottomTab === 'readme' && (
                          <div className="h-full overflow-y-auto p-4 custom-scrollbar bg-[#080b11] text-xs font-mono">
                            <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                              {activeProject.readme ||
                                activeProject.files.find((f) => f.path === 'README.md')?.content ||
                                '# MogsAI Plugin\nProject documentation.'}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
                  <Terminal className="h-10 w-10 text-gray-600" />
                  <h3 className="text-white font-semibold text-sm">No Project Active in this Chat</h3>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Switch to Chat and describe what you want to build. MogsAI will generate the files and they will appear here in the workspace.
                  </p>
                  <button
                    onClick={() => setCurrentView('chat')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Go to Chat
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RAG Knowledge Explorer Modal */}
      {isKnowledgeOpen && <KnowledgeExplorer onClose={() => setIsKnowledgeOpen(false)} />}

      {/* Settings & Model Routing Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          maxRetries={maxRetries}
          setMaxRetries={setMaxRetries}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          routingMode={routingMode}
          setRoutingMode={setRoutingMode}
        />
      )}
    </div>
  );
}
