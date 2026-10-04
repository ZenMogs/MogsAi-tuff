export type MinecraftPlatform =
  | 'paper'
  | 'spigot'
  | 'purpur'
  | 'bukkit'
  | 'fabric'
  | 'neoforge'
  | 'kotlin'
  | 'skript'
  | 'datapack'
  | 'resourcepack';

export type AIMode =
  | 'generate'
  | 'modify'
  | 'fix'
  | 'review'
  | 'explain'
  | 'optimize'
  | 'convert';

export type BuildTool = 'gradle' | 'maven' | 'none';

export type PipelineStep =
  | 'planning'
  | 'documentation'
  | 'architecture'
  | 'generation'
  | 'compilation'
  | 'validation'
  | 'debugging'
  | 'packaging';

export interface StepState {
  id: PipelineStep;
  label: string;
  agent: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'retrying';
  details: string;
  durationMs?: number;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: 'java' | 'kotlin' | 'yaml' | 'json' | 'groovy' | 'skript' | 'markdown' | 'properties';
  isModified?: boolean;
  originalContent?: string;
  diff?: string;
}

export interface ProjectMap {
  entryPoint: string;
  commands: { name: string; permission?: string; description: string; usage: string }[];
  permissions: { node: string; description: string; default: 'true' | 'false' | 'op' }[];
  listeners: { name: string; events: string[]; description: string }[];
  managers: { name: string; responsibility: string }[];
  storage: { type: string; details: string };
  integrations: string[];
  architectureOverview: string;
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
  file?: string;
  line?: number;
}

export interface DebugEntry {
  id: string;
  timestamp: string;
  errorType: string;
  file: string;
  line?: number;
  cause: string;
  fixApplied: string;
  status: 'resolved' | 'unresolved';
}

export interface ReviewIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'optimization';
  category: 'thread_safety' | 'performance' | 'deprecated_api' | 'security' | 'architecture';
  title: string;
  description: string;
  suggestion: string;
  file?: string;
  line?: number;
}

export type BuildStateStatus =
  | 'generating'
  | 'compiling'
  | 'compiler_error'
  | 'validating_artifact'
  | 'packaging'
  | 'validation_failed'
  | 'build_successful'
  | 'build_environment_unavailable';

export interface BuildResultState {
  status: BuildStateStatus;
  passed: boolean;
  message: string;
  jarName?: string;
  details?: string;
  canDownloadJar?: boolean;
}

export interface MogsAIProject {
  id: string;
  name: string;
  description: string;
  platform: MinecraftPlatform;
  version: string;
  javaVersion: number;
  buildTool: BuildTool;
  files: ProjectFile[];
  projectMap: ProjectMap;
  validationChecks: ValidationCheck[];
  debugHistory: DebugEntry[];
  reviewIssues: ReviewIssue[];
  readme: string;
  currentMode: AIMode;
  createdAt: string;
  buildState?: BuildResultState;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  category: 'api_changes' | 'best_practices' | 'platforms' | 'folia' | 'gui' | 'integrations';
  applicableVersions: string[];
  summary: string;
  content: string;
  codeSnippet?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  projectSnapshot?: MogsAIProject;
  buildResult?: BuildResultState;
  pipelineSteps?: StepState[];
  status?: 'sending' | 'generating' | 'completed' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  platform: MinecraftPlatform;
  version: string;
  buildTool: BuildTool;
  javaVersion: number;
  messages: ChatMessage[];
  currentProject: MogsAIProject | null;
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'groq' | 'custom';
  model: string;
  baseUrl?: string;
  apiKey?: string;
}
