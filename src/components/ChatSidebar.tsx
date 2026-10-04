import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Settings,
  BookOpen,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { ChatSession } from '../types/mogsai';

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
  onOpenKnowledge: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  onOpenSettings,
  onOpenKnowledge,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this chat and its project history?')) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay - closes on outside click */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Sidebar Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-20 w-72 md:w-64 lg:w-72 bg-[#0c1018] border-r border-[#1a2336] flex flex-col shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-3.5 border-b border-[#1a2336] flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 border border-emerald-400/30 shrink-0">
              <Boxes className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-['Space_Grotesk']">
                MogsAI
              </span>
              <p className="text-[10px] text-gray-400 font-mono truncate">Your AI Minecraft Developer</p>
            </div>
          </div>

          {/* Close button on mobile & desktop toggle */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-[#151c2b] transition-colors"
            title="Close sidebar"
          >
            <X className="h-4 w-4 md:hidden" />
            <PanelLeftClose className="h-4 w-4 hidden md:block" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-[#1a2336]">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 border border-emerald-500/30 font-medium text-xs transition-all shadow-sm group cursor-pointer"
          >
            <Plus className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-2.5 border-b border-[#1a2336]">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121826] border border-[#212c42] rounded-md pl-8 pr-2.5 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-w-0">
          <div className="text-[10px] uppercase font-mono text-gray-500 font-semibold px-2 py-1">
            Recent Chats ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-xs italic">
              {searchTerm ? 'No matching chats' : 'No chats yet'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative rounded-lg px-2.5 py-2 flex items-center justify-between cursor-pointer text-xs transition-all min-w-0 ${
                    isActive
                      ? 'bg-emerald-950/20 text-emerald-200 border border-emerald-500/30 font-medium'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#121826]'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate flex-1 min-w-0">
                    <MessageSquare
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isActive ? 'text-emerald-400' : 'text-gray-500'
                      }`}
                    />
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveRename(session.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center space-x-1 min-w-0"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          onBlur={(e) => handleSaveRename(session.id, e)}
                          className="bg-[#0b0e14] border border-emerald-500/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full"
                        />
                        <button type="submit" className="text-emerald-400 p-0.5 shrink-0">
                          <Check className="h-3 w-3" />
                        </button>
                      </form>
                    ) : (
                      <div className="truncate flex-1 min-w-0">
                        <div className="truncate font-sans text-xs">{session.title}</div>
                        <div className="text-[9px] text-gray-500 font-mono flex items-center space-x-1 mt-0.5 truncate">
                          <span className="uppercase">{session.platform}</span>
                          <span>•</span>
                          <span>{session.version}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover actions */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 pl-1 shrink-0 transition-opacity">
                      <button
                        onClick={(e) => startRename(session, e)}
                        className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#1a2336]"
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-1 text-gray-400 hover:text-red-400 rounded hover:bg-[#1a2336]"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-3 border-t border-[#1a2336] bg-[#090d14] space-y-1.5 text-xs font-sans">
          <button
            onClick={() => {
              onOpenKnowledge();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#141b29] transition-colors"
          >
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>Minecraft RAG Docs</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#141b29] transition-colors"
          >
            <Settings className="h-4 w-4 text-purple-400" />
            <span>Model Routing & Providers</span>
          </button>
        </div>
      </aside>
    </>
  );
};
