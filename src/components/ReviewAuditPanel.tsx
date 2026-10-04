import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap,
  Cpu,
  Lock,
  Layers,
} from 'lucide-react';
import { ReviewIssue, ValidationCheck } from '../types/mogsai';

interface ReviewAuditPanelProps {
  issues: ReviewIssue[];
  checks: ValidationCheck[];
  onApplyOptimization?: (issueId: string) => void;
}

export const ReviewAuditPanel: React.FC<ReviewAuditPanelProps> = ({
  issues,
  checks,
  onApplyOptimization,
}) => {
  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const optCount = issues.filter((i) => i.severity === 'optimization' || i.severity === 'info').length;

  const passedChecks = checks.filter((c) => c.status === 'passed').length;

  const getCategoryIcon = (category: ReviewIssue['category']) => {
    switch (category) {
      case 'thread_safety':
        return <Cpu className="h-4 w-4 text-purple-400" />;
      case 'performance':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'security':
        return <Lock className="h-4 w-4 text-red-400" />;
      case 'architecture':
        return <Layers className="h-4 w-4 text-blue-400" />;
      case 'deprecated_api':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-5 space-y-6 text-xs text-gray-300 font-sans overflow-y-auto h-full custom-scrollbar">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-3">
          <div className="text-[11px] text-gray-400 uppercase font-mono">Passed Assertions</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
            <CheckCircle className="h-4 w-4" />
            {passedChecks} / {checks.length}
          </div>
        </div>

        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-3">
          <div className="text-[11px] text-gray-400 uppercase font-mono">Critical Security / Bugs</div>
          <div className="text-xl font-bold text-red-400 mt-1 flex items-center gap-1.5 font-mono">
            <ShieldAlert className="h-4 w-4" />
            {criticalCount}
          </div>
        </div>

        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-3">
          <div className="text-[11px] text-gray-400 uppercase font-mono">Warnings & Deprecations</div>
          <div className="text-xl font-bold text-amber-400 mt-1 flex items-center gap-1.5 font-mono">
            <AlertTriangle className="h-4 w-4" />
            {warningCount}
          </div>
        </div>

        <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-3">
          <div className="text-[11px] text-gray-400 uppercase font-mono">Optimization Hints</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 flex items-center gap-1.5 font-mono">
            <Zap className="h-4 w-4" />
            {optCount}
          </div>
        </div>
      </div>

      {/* Validation Checklist */}
      <div className="bg-[#0e1420] border border-[#1e293d] rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono border-b border-[#1e293d] pb-2">
          Automated Static Verification Checks
        </h4>
        <div className="space-y-1.5">
          {checks.map((chk, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-[#121927] border border-[#222d42]"
            >
              <div className="flex items-center space-x-2">
                {chk.status === 'passed' && <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />}
                {chk.status === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />}
                {chk.status === 'failed' && <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />}
                <div>
                  <span className="font-medium text-gray-200">{chk.name}</span>
                  <p className="text-[11px] text-gray-400">{chk.message}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  chk.status === 'passed'
                    ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                    : chk.status === 'warning'
                    ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                    : 'bg-red-950/40 text-red-400 border border-red-800/40'
                }`}
              >
                {chk.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
          Code Quality, Security & Performance Review Findings
        </h4>

        {issues.length === 0 ? (
          <div className="p-6 bg-[#0f1422] rounded-lg border border-[#1e293d] text-center text-gray-400">
            <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-white font-medium">No Code Smells, Bugs, or Vulnerabilities Found</p>
            <p className="text-xs text-gray-500 mt-1">
              Project complies with modern Paper, Adventure Component, and Java 21 standards.
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-[#0f1422] border border-[#232f48] rounded-lg p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(issue.category)}
                  <span className="font-bold text-white text-xs">{issue.title}</span>
                  <span className="text-[10px] font-mono text-gray-500 bg-[#161f31] px-1.5 py-0.5 rounded">
                    {issue.category.replace('_', ' ')}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    issue.severity === 'critical'
                      ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                      : issue.severity === 'warning'
                      ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                      : 'bg-cyan-950/40 text-cyan-400 border border-cyan-800/40'
                  }`}
                >
                  {issue.severity}
                </span>
              </div>

              <p className="text-gray-300 text-xs leading-relaxed">{issue.description}</p>

              <div className="bg-[#121927] p-2.5 rounded border border-[#1c2638] text-[11px] text-emerald-300 flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">Recommendation:</span>
                <span>{issue.suggestion}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
