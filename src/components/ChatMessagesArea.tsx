import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DisplayMessage } from "../pages/ChatPage";
import { ChatBubbleLeftEllipsisIcon as ChatAltIcon } from "@heroicons/react/24/outline";

const UserIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={
      "h-7 w-7 rounded-full text-blue-600 bg-gray-200 p-1 dark:text-blue-400"
    }
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />{" "}
  </svg>
);
const AssistantIcon: React.FC = () => (
  <svg
    className="h-7 w-7 text-gray-600 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-full p-1"
    fill="currentColor"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path d="M21 10.975V8a2 2 0 0 0-2-2h-6V4.688c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5a2 2 0 0 0-2 2v2.998l-.072.005A.999.999 0 0 0 2 12v2a1 1 0 0 0 1 1v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a1 1 0 0 0 1-1v-1.938a1.004 1.004 0 0 0-.072-.455c-.202-.488-.635-.605-.928-.632zM7 12c0-1.104.672-2 1.5-2s1.5.896 1.5 2-.672 2-1.5 2S7 13.104 7 12zm8.998 6c-1.001-.003-7.997 0-7.998 0v-2s7.001-.002 8.002 0l-.004 2zm-.498-4c-.828 0-1.5-.896-1.5-2s.672-2 1.5-2 1.5.896 1.5 2-.672 2-1.5 2z" />{" "}
  </svg>
);

interface ChatMessagesAreaProps {
  messages: DisplayMessage[];
  currentChatID: string | null;
  isLoading: boolean;
  isLoadingSessions: boolean; // To know if initial session load is happening
  error: string | null;
}

const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  messages,
  currentChatID,
  isLoading,
  isLoadingSessions,
  error,
}) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {!currentChatID && !isLoading && !isLoadingSessions && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ChatAltIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Welcome to Moneymind Chat
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chat from the sidebar or create a new one to start.
          </p>
        </div>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end space-x-3 ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.role === "assistant" && <AssistantIcon />}
          <div
            className={`max-w-[260px] sm:max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-lg"
                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-lg"
            }`}
          >
            <div className="text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
          {msg.role === "user" && <UserIcon />}
        </div>
      ))}
      {/* Loading indicator for AI response */}
      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <div className="flex items-end space-x-3 justify-start animate-fadeIn">
            <AssistantIcon />
            <div className="max-w-xs p-3 rounded-2xl shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-lg">
              <div className="flex items-center space-x-1.5">
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      {/* Loading indicator for fetching history */}
      {isLoading &&
        (!messages.length ||
          (messages.length > 0 &&
            messages[messages.length - 1].role !== "user")) &&
        currentChatID && (
          <div className="flex justify-center items-center pt-4">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <AssistantIcon />
              <span>Loading messages...</span>
            </div>
          </div>
        )}
      {error && (
        <div className="text-center text-red-500 text-sm p-2 bg-red-100 dark:bg-red-900/50 rounded-md">
          {error}
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
};
export default ChatMessagesArea;
