import React, { useState, useEffect, useRef } from "react";
import {
  PlusIcon,
  TrashIcon,
  ChatBubbleLeftEllipsisIcon as ChatAltIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import type { User as FirebaseUser } from "firebase/auth";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  chatSessions: ChatSession[];
  currentChatID: string | null;
  handleCreateNewChat: () => void;
  handleSelectChat: (chatID: string) => void;
  handleDeleteChatInitiate: (session: ChatSession) => void;
  handleRenameChatConfirm: (chatID: string, newTitle: string) => Promise<void>;
  isCreatingChat: boolean;
  isLoadingSessions: boolean;
  deletingChatID: string | null;
  authUser: FirebaseUser | null | undefined;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  chatSessions,
  currentChatID,
  handleCreateNewChat,
  handleSelectChat,
  handleDeleteChatInitiate,
  handleRenameChatConfirm,
  isCreatingChat,
  isLoadingSessions,
  deletingChatID,
  authUser,
}) => {
  // --- NEW INTERNAL STATE FOR RENAMING ---
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null
  );
  const [currentEditTitle, setCurrentEditTitle] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // --- NEW HANDLERS FOR RENAMING ---
  const startRename = (session: ChatSession) => {
    setRenamingSessionId(session.id);
    setCurrentEditTitle(session.title || "Untitled Chat");
  };

  const confirmRename = async () => {
    if (renamingSessionId && currentEditTitle.trim() !== "") {
      // Check if title actually changed from original to avoid unnecessary API calls
      const originalSession = chatSessions.find(
        (s) => s.id === renamingSessionId
      );
      if (
        originalSession &&
        originalSession.title !== currentEditTitle.trim()
      ) {
        await handleRenameChatConfirm(
          renamingSessionId,
          currentEditTitle.trim()
        );
      }
    }
    setRenamingSessionId(null);
    setCurrentEditTitle("");
  };

  const cancelRename = () => {
    setRenamingSessionId(null);
    setCurrentEditTitle("");
  };

  // Focus input when renaming starts
  useEffect(() => {
    if (renamingSessionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingSessionId]);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-30 w-64 sm:w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out h-full md:relative md:translate-x-0 md:flex md:flex-shrink-0`}
    >
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-center gap-2 w-full ">
            <img src="/logo.png" alt="Logo" className="w-7 h-7" />
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Moneymind Chats
            </h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className=" md:hidden cursor-pointer transition-all rounded-full hover:bg-slate-200 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-2 flex-shrink-0">
          {" "}
          <button
            onClick={handleCreateNewChat}
            disabled={isCreatingChat || !authUser || !!renamingSessionId} // Disable if renaming
            className="w-full flex items-center cursor-pointer justify-center gap-2 p-3 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            {isCreatingChat ? "Creating..." : "New Chat"}
          </button>
        </div>

        {/* Chat Sessions List */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {isLoadingSessions && (
            <p className="p-2 text-sm text-center text-gray-500 dark:text-gray-400">
              Loading chats...
            </p>
          )}
          {!isLoadingSessions &&
            chatSessions.length === 0 &&
            !isCreatingChat && (
              <p className="p-2 text-sm text-center text-gray-500 dark:text-gray-400">
                No chats yet. Start one!
              </p>
            )}

          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`group relative w-full flex items-center justify-between gap-1 p-0.5 pr-1 text-left text-sm rounded-md transition-colors
                          ${
                            currentChatID === session.id && !renamingSessionId
                              ? "bg-gray-200 dark:bg-gray-700"
                              : "hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
            >
              {renamingSessionId === session.id ? (
                // --- RENAMING UI ---
                <div className="flex items-center gap-2 py-1.5 pl-1.5 flex-1">
                  <ChatAltIcon className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={currentEditTitle}
                    onChange={(e) => setCurrentEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        confirmRename();
                      } else if (e.key === "Escape") {
                        cancelRename();
                      }
                    }}
                    onBlur={confirmRename}
                    className="flex-1 px-1.5 py-0.5 text-sm bg-white dark:bg-gray-600 border border-blue-500 rounded focus:ring-1 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-50"
                  />
                </div>
              ) : (
                // --- NORMAL DISPLAY UI ---
                <button
                  onClick={() => handleSelectChat(session.id)}
                  disabled={!!renamingSessionId} // Disable selection if another chat is being renamed
                  className={`flex items-center gap-3 p-1.5 flex-1 truncate rounded-l-md 
                              ${
                                currentChatID === session.id
                                  ? "font-semibold text-gray-800 dark:text-gray-100"
                                  : "text-gray-700 dark:text-gray-300"
                              }
                              disabled:opacity-70 disabled:cursor-not-allowed`}
                  title={session.title || "Untitled Chat"}
                >
                  <ChatAltIcon className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  <span className="truncate flex-1">
                    {session.title || "Untitled Chat"}
                  </span>
                </button>
              )}

              {renamingSessionId !== session.id && (
                <div
                  className={`flex items-center flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 
                                ${
                                  currentChatID === session.id
                                    ? "opacity-100"
                                    : ""
                                } 
                                transition-opacity pr-1`}
                >
                  <button
                    onClick={() => startRename(session)}
                    disabled={
                      !!renamingSessionId || deletingChatID === session.id
                    } // Disable if any rename is active or this is being deleted
                    className="p-1 text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Rename chat: ${
                      session.title || "Untitled Chat"
                    }`}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChatInitiate(session);
                    }}
                    disabled={
                      deletingChatID === session.id || !!renamingSessionId
                    } // Disable if any rename is active or this is already being deleted
                    className="p-1 cursor-pointer text-gray-400 hover:text-red-600 dark:hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete chat: ${
                      session.title || "Untitled Chat"
                    }`}
                  >
                    {deletingChatID === session.id ? (
                      <svg
                        className="animate-spin h-4 w-4 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
