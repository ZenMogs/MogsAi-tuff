import React from 'react';
import {
  Layers,
  Terminal,
  KeyRound,
  Radio,
  Briefcase,
  Database,
  Plug,
  Cpu,
  FileCode2,
} from 'lucide-react';
import { ProjectMap, ProjectFile } from '../types/mogsai';

interface ProjectMapVisualizerProps {
  projectMap: ProjectMap;
  files: ProjectFile[];
}

export const ProjectMapVisualizer: React.FC<ProjectMapVisualizerProps> = ({
  projectMap,
  files,
}) => {
  return (
    <div className="p-5 space-y-6 text-xs text-gray-300 font-sans overflow-y-auto h-full custom-scrollbar">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-[#111928] to-[#0c121e] border border-[#23314d] rounded-xl p-4 shadow-lg">
        <div className="flex items-center space-x-2 text-emerald-400 mb-1.5">
          <Layers className="h-4 w-4" />
          <h3 className="font-bold text-sm text-white">Project Architecture & Component Map</h3>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">
          {projectMap.architectureOverview ||
            'Autonomous layered Minecraft software architecture with decoupled domain logic, async persistence, and secure GUI event handling.'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="bg-[#1b253b] text-cyan-300 px-2 py-0.5 rounded border border-[#2a3959]">
            Entry Point: <span className="font-bold">{projectMap.entryPoint}</span>
          </span>
          <span className="bg-[#1b253b] text-purple-300 px-2 py-0.5 rounded border border-[#2a3959]">
            Files: <span className="font-bold">{files.length}</span>
          </span>
          <span className="bg-[#1b253b] text-emerald-300 px-2 py-0.5 rounded border border-[#2a3959]">
            Storage: <span className="font-bold">{projectMap.storage.type}</span>
          </span>
        </div>
      </div>

      {/* Grid of Architectural Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Commands */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-semibold border-b border-[#1e293d] pb-2">
            <Terminal className="h-4 w-4" />
            <span>Registered Commands ({projectMap.commands.length})</span>
          </div>
          <div className="space-y-2">
            {projectMap.commands.map((cmd) => (
              <div key={cmd.name} className="bg-[#121927] p-2.5 rounded border border-[#222d42] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">/{cmd.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{cmd.permission || 'public'}</span>
                </div>
                <p className="text-gray-400 text-[11px]">{cmd.description}</p>
                <div className="font-mono text-[10px] text-gray-500">{cmd.usage}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold border-b border-[#1e293d] pb-2">
            <KeyRound className="h-4 w-4" />
            <span>Permission Tree ({projectMap.permissions.length})</span>
          </div>
          <div className="space-y-2">
            {projectMap.permissions.map((perm) => (
              <div key={perm.node} className="bg-[#121927] p-2.5 rounded border border-[#222d42] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-300 font-bold text-[11px] truncate">{perm.node}</span>
                  <span className="text-[10px] font-mono bg-[#1c2638] text-gray-300 px-1 rounded">
                    {perm.default}
                  </span>
                </div>
                <p className="text-gray-400 text-[11px]">{perm.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Event Listeners */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold border-b border-[#1e293d] pb-2">
            <Radio className="h-4 w-4" />
            <span>Event Listeners ({projectMap.listeners.length})</span>
          </div>
          <div className="space-y-2">
            {projectMap.listeners.map((listener) => (
              <div key={listener.name} className="bg-[#121927] p-2.5 rounded border border-[#222d42] space-y-1">
                <div className="font-bold text-emerald-300 font-mono">{listener.name}</div>
                <div className="flex flex-wrap gap-1">
                  {listener.events.map((ev) => (
                    <span key={ev} className="text-[10px] font-mono bg-emerald-950/40 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      {ev}
                    </span>
                  ))}
                </div>
                <p className="text-gray-400 text-[11px]">{listener.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Managers & Services */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-purple-400 font-semibold border-b border-[#1e293d] pb-2">
            <Briefcase className="h-4 w-4" />
            <span>Managers & Services ({projectMap.managers.length})</span>
          </div>
          <div className="space-y-2">
            {projectMap.managers.map((mgr) => (
              <div key={mgr.name} className="bg-[#121927] p-2.5 rounded border border-[#222d42] space-y-1">
                <div className="font-bold text-purple-300 font-mono">{mgr.name}</div>
                <p className="text-gray-400 text-[11px]">{mgr.responsibility}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Storage & Persistence */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-teal-400 font-semibold border-b border-[#1e293d] pb-2">
            <Database className="h-4 w-4" />
            <span>Data Storage & Persistence</span>
          </div>
          <div className="bg-[#121927] p-3 rounded border border-[#222d42] space-y-2">
            <div className="font-bold text-teal-300">{projectMap.storage.type}</div>
            <p className="text-gray-400 text-[11px] leading-relaxed">{projectMap.storage.details}</p>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-[#1e293d] pb-2">
            <Plug className="h-4 w-4" />
            <span>Integrations & APIs</span>
          </div>
          <div className="space-y-1.5">
            {projectMap.integrations.map((integ) => (
              <div
                key={integ}
                className="bg-[#121927] p-2 rounded border border-[#222d42] font-mono text-[11px] text-indigo-300 flex items-center justify-between"
              >
                <span>{integ}</span>
                <span className="text-[9px] bg-indigo-950/40 text-indigo-200 px-1 rounded">CONNECTED</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
