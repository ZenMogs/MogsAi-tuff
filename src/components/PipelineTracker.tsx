import React from 'react';
import {
  Check,
  Loader2,
  Clock,
  AlertTriangle,
  RotateCw,
  Cpu,
  BookOpen,
  LayoutGrid,
  Code2,
  Terminal,
  ShieldCheck,
  Bug,
  PackageCheck,
} from 'lucide-react';
import { StepState, PipelineStep } from '../types/mogsai';

interface PipelineTrackerProps {
  steps: StepState[];
  currentRunningIndex: number;
}

const STEP_ICONS: Record<PipelineStep, React.ReactNode> = {
  planning: <Cpu className="h-4 w-4" />,
  documentation: <BookOpen className="h-4 w-4" />,
  architecture: <LayoutGrid className="h-4 w-4" />,
  generation: <Code2 className="h-4 w-4" />,
  compilation: <Terminal className="h-4 w-4" />,
  validation: <ShieldCheck className="h-4 w-4" />,
  debugging: <Bug className="h-4 w-4" />,
  packaging: <PackageCheck className="h-4 w-4" />,
};

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({ steps }) => {
  return (
    <div className="bg-[#0e131d] border-b border-[#1b2333] px-4 py-2.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Autonomous Development Pipeline
          </span>
        </div>
        <span className="text-[11px] text-gray-500 font-mono">
          {steps.filter((s) => s.status === 'completed').length} / {steps.length} Stages Completed
        </span>
      </div>

      {/* Steps Horizontal Grid / Mobile Scroll */}
      <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-2 overflow-x-auto scrollbar-none pb-1 min-w-0">
        {steps.map((step) => {
          const isRunning = step.status === 'running';
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';
          const isRetrying = step.status === 'retrying';

          let borderClass = 'border-[#1e273b] bg-[#111723] text-gray-400';
          let iconBg = 'bg-[#182133] text-gray-400';

          if (isRunning) {
            borderClass = 'border-cyan-500/50 bg-cyan-950/20 text-cyan-200 shadow-md shadow-cyan-900/20';
            iconBg = 'bg-cyan-500/20 text-cyan-300';
          } else if (isCompleted) {
            borderClass = 'border-emerald-500/30 bg-emerald-950/15 text-emerald-200';
            iconBg = 'bg-emerald-500/20 text-emerald-300';
          } else if (isError) {
            borderClass = 'border-red-500/40 bg-red-950/20 text-red-200';
            iconBg = 'bg-red-500/20 text-red-400';
          } else if (isRetrying) {
            borderClass = 'border-amber-500/40 bg-amber-950/20 text-amber-200';
            iconBg = 'bg-amber-500/20 text-amber-400';
          }

          return (
            <div
              key={step.id}
              className={`p-2 rounded-lg border transition-all text-xs flex flex-col justify-between relative overflow-hidden group min-w-[130px] md:min-w-0 shrink-0 md:shrink ${borderClass}`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between mb-1.5">
                <div className={`p-1.5 rounded-md ${iconBg}`}>
                  {STEP_ICONS[step.id]}
                </div>
                <div>
                  {isRunning && <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />}
                  {isCompleted && <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />}
                  {isError && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
                  {isRetrying && <RotateCw className="h-3.5 w-3.5 animate-spin text-amber-400" />}
                  {step.status === 'idle' && <Clock className="h-3 w-3 text-gray-600" />}
                </div>
              </div>

              {/* Title & Agent */}
              <div>
                <p className="font-semibold text-[11px] truncate leading-tight">{step.label}</p>
                <p className="text-[10px] text-gray-500 font-mono truncate">{step.agent}</p>
              </div>

              {/* Tooltip on hover with details */}
              <div className="hidden group-hover:block absolute bottom-0 left-0 right-0 bg-[#0b0e14] border-t border-[#263147] p-2 text-[10px] text-gray-300 z-10 shadow-lg">
                <p className="font-semibold text-emerald-300 mb-0.5">{step.label}</p>
                <p>{step.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
