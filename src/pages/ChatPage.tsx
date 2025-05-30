import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import ChatMessagesArea from "../components/ChatMessagesArea";
import ConfirmationModal from "../components/ConfirmationModal";
import { InputArea } from "../components/InputArea";

export interface GeminiHistoryItem {
  role: "user" | "model";
  parts: string[];
}
export interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  id?: string;
}
export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastUpdatedAt?: string;
}

// --- Constants ---
const API_URL = import.meta.env.VITE_SERVER_URL;
const CHATS_API_BASE_URL = `${API_URL}/chats`;
const DEFAULT_NEW_CHAT_TITLE_PREFIX = "New Chat -";

const ChatPage: React.FC = () => {
  const [authUser] = useAuthState(auth);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiHistoryItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // For AI response or loading specific chat messages
  const [error, setError] = useState<string | null>(null);

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatID, setCurrentChatID] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<ChatSession | null>(null);
  const [deletingChatID, setDeletingChatID] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const justCreatedChatIdRef = useRef<string | null>(null);

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    if (!authUser) return null;
    try {
      return await authUser.getIdToken();
    } catch (tokenError) {
      console.error("Error getting auth token:", tokenError);
      setError("Authentication session expired. Please log in again.");
      return null;
    }
  }, [authUser]);

  const sortSessions = (sessions: ChatSession[]): ChatSession[] => {
    return [...sessions].sort(
      (a, b) =>
        new Date(b.lastUpdatedAt || b.createdAt).getTime() -
        new Date(a.lastUpdatedAt || a.createdAt).getTime()
    );
  };

  const fetchChatSessions = useCallback(async () => {
    // Removed autoSelectLatestIfNone from here
    if (!authUser) return;
    setIsLoadingSessions(true);
    setError(null);
    const token = await getAuthToken();
    if (!token) {
      setIsLoadingSessions(false);
      return;
    }

    try {
      const response = await axios.get<{ sessions: ChatSession[] }>(
        `${CHATS_API_BASE_URL}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const fetchedSessions = response.data.sessions || [];
      setChatSessions(sortSessions(fetchedSessions));
    } catch (err) {
      console.error("Error fetching chat sessions:", err);
      setError("Could not load chat sessions.");
      setChatSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [authUser, getAuthToken]);

  const fetchMessagesForChat = useCallback(
    async (chatID: string) => {
      setIsLoading(true);
      setError(null);
      setMessages([]);
      setGeminiHistory([]); // Clear history for this chat

      const token = await getAuthToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get<{ history: GeminiHistoryItem[] }>(
          `${CHATS_API_BASE_URL}/${chatID}/history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fetchedHistory: GeminiHistoryItem[] = response.data.history || [];
        setGeminiHistory(fetchedHistory);
        setMessages(
          fetchedHistory.map((item, index) => ({
            id: `msg-${chatID}-${index}`,
            role: item.role === "user" ? "user" : "assistant",
            content: item.parts.join(" "),
          }))
        );
      } catch (err) {
        console.error(`Error fetching history for chat ${chatID}:`, err);
        setError("Could not load chat history for this session.");
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken]
  );

  // Effect for initial session load when user logs in
  useEffect(() => {
    if (authUser) {
      fetchChatSessions();
    } else {
      setChatSessions([]);
      setCurrentChatID(null);
      setMessages([]);
      setGeminiHistory([]);
      setIsSidebarOpen(window.innerWidth >= 768);
    }
  }, [authUser, fetchChatSessions]);

  // Effect for auto-selecting a chat after sessions are loaded/updated or authUser changes
  useEffect(() => {
    if (!authUser || isLoadingSessions || isCreatingChat) {
      return;
    }

    if (chatSessions.length > 0) {
      const currentChatIsValid = chatSessions.some(
        (s) => s.id === currentChatID
      );
      if (currentChatID && currentChatIsValid) {
        return;
      }
      setCurrentChatID(chatSessions[0].id);
    } else {
      // No chats exist
      if (currentChatID !== null) {
        setCurrentChatID(null);
      }
    }
  }, [
    authUser,
    chatSessions,
    isLoadingSessions,
    isCreatingChat,
    currentChatID,
    setCurrentChatID,
  ]);

  useEffect(() => {
    if (currentChatID && authUser) {
      if (justCreatedChatIdRef.current === currentChatID) {
        justCreatedChatIdRef.current = null;
      } else {
        fetchMessagesForChat(currentChatID);
      }
    } else {
      setMessages([]);
      setGeminiHistory([]); // Clear if no current chat or no user
    }
  }, [currentChatID, authUser, fetchMessagesForChat]);

  // Effect to handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        window.innerWidth < 768 &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  const handleCreateNewChat = async () => {
    if (isCreatingChat || !authUser) return;

    const latestChat = chatSessions[0];
    if (
      latestChat &&
      latestChat.id === currentChatID &&
      latestChat.title.startsWith(DEFAULT_NEW_CHAT_TITLE_PREFIX) &&
      messages.length === 0
    ) {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      setInput("");
      return;
    }

    setIsCreatingChat(true);
    setError(null);
    const token = await getAuthToken();
    if (!token) {
      setIsCreatingChat(false);
      return;
    }

    try {
      const response = await axios.post<{ session: ChatSession }>(
        `${CHATS_API_BASE_URL}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newSession = response.data.session;
      setChatSessions((prev) => sortSessions([newSession, ...prev]));
      setCurrentChatID(newSession.id);
      justCreatedChatIdRef.current = newSession.id;
      setMessages([]);
      setGeminiHistory([]);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Error creating new chat:", err);
      setError("Could not create new chat.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleSelectChat = (chatID: string) => {
    if (chatID === currentChatID) {
      if (window.innerWidth < 768 && isSidebarOpen) setIsSidebarOpen(false);
      return;
    }
    setCurrentChatID(chatID);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteChatInitiate = (session: ChatSession) => {
    setChatToDelete(session);
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    if (!chatToDelete || deletingChatID) return;
    setDeletingChatID(chatToDelete.id);
    setError(null);
    setShowDeleteModal(false);
    const token = await getAuthToken();
    if (!token) {
      setError("Authentication required.");
      setDeletingChatID(null);
      setChatToDelete(null);
      return;
    }
    try {
      await axios.delete(`${CHATS_API_BASE_URL}/${chatToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedSessions = chatSessions.filter(
        (s) => s.id !== chatToDelete.id
      );
      setChatSessions(updatedSessions);
      if (currentChatID === chatToDelete.id) {
        setCurrentChatID(null);
        if (updatedSessions.length > 0) {
          setCurrentChatID(updatedSessions[0].id);
        }
      }
    } catch (err: any) {
      console.error(`Error deleting chat ${chatToDelete.id}:`, err);
      setError(err.response?.data?.error || "Could not delete chat.");
    } finally {
      setDeletingChatID(null);
      setChatToDelete(null);
    }
  };

  const handleSend = async () => {
    const currentInput = input.trim();
    if (!currentInput || isLoading || !authUser) return;

    setIsLoading(true);
    setError(null);
    const token = await getAuthToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let chatIDToUse = currentChatID;
    let isNewChatFlow = false;
    let historyForAPICall = [...geminiHistory];

    if (!chatIDToUse) {
      isNewChatFlow = true;
      try {
        const createChatResponse = await axios.post<{ session: ChatSession }>(
          `${CHATS_API_BASE_URL}`,
          { initial_prompt: currentInput },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newSession = createChatResponse.data.session;
        setChatSessions((prev) => sortSessions([newSession, ...prev]));
        chatIDToUse = newSession.id;
        setCurrentChatID(newSession.id);
        justCreatedChatIdRef.current = chatIDToUse;

        setMessages([]);
        setGeminiHistory([]);
        historyForAPICall = [];
      } catch (err) {
        console.error("Error auto-creating new chat during send:", err);
        setError("Could not start a new chat. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    if (!chatIDToUse) {
      setError("Chat session ID is missing.");
      setIsLoading(false);
      return;
    }

    const userMessageForDisplay: DisplayMessage = {
      id: `msg-${chatIDToUse}-user-${Date.now()}`,
      role: "user",
      content: currentInput,
    };
    setMessages((prevMsgs) => [...prevMsgs, userMessageForDisplay]);
    setInput("");

    try {
      const response = await axios.post<{
        response: string;
        updatedSession?: ChatSession;
      }>(
        `${CHATS_API_BASE_URL}/${chatIDToUse}/message`,
        { prompt: currentInput, history: historyForAPICall },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponseText = response.data.response;
      const aiMessage: DisplayMessage = {
        id: `msg-${chatIDToUse}-ai-${Date.now()}`,
        role: "assistant",
        content: aiResponseText,
      };
      setMessages((prevMsgs) => [...prevMsgs, aiMessage]);

      setGeminiHistory((prevGH) => [
        ...prevGH,
        { role: "user", parts: [currentInput] },
        { role: "model", parts: [aiResponseText] },
      ]);

      const updatedSessionFromServer = response.data.updatedSession;
      setChatSessions((prevSessions) =>
        sortSessions(
          prevSessions.map((s) => {
            if (s.id === chatIDToUse) {
              let newTitle = s.title;
              if (updatedSessionFromServer?.title) {
                newTitle = updatedSessionFromServer.title;
              } else if (
                historyForAPICall.length === 0 &&
                s.title.startsWith(DEFAULT_NEW_CHAT_TITLE_PREFIX)
              ) {
                const words = currentInput.split(" ");
                const potentialTitle = words.slice(0, 5).join(" ");
                newTitle = potentialTitle.trim()
                  ? words.length > 5
                    ? `${potentialTitle}...`
                    : potentialTitle
                  : s.title;
              }
              return {
                ...s,
                title: newTitle,
                lastUpdatedAt:
                  updatedSessionFromServer?.lastUpdatedAt ||
                  new Date().toISOString(),
              };
            }
            return s;
          })
        )
      );
    } catch (err: any) {
      console.error("Error sending message to chat:", chatIDToUse, err);
      const errorMsgContent =
        err.response?.data?.error || "Sorry, I couldn't respond.";
      setMessages((prevMsgs) => [
        ...prevMsgs,
        {
          id: `msg-${chatIDToUse}-error-${Date.now()}`,
          role: "assistant",
          content: errorMsgContent,
        },
      ]);
      setError(errorMsgContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
      setError("Failed to sign out.");
    }
  };

  const handleRenameChatConfirmInPage = async (
    chatID: string,
    newTitle: string
  ) => {
    if (!chatID || !newTitle.trim() || !authUser) {
      console.warn("Rename prerequisites not met:", {
        chatID,
        newTitle: newTitle.trim(),
        authUser,
      });
      if (!newTitle.trim()) {
        setError("New title cannot be empty.");
      }
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      setError("Authentication error. Cannot rename chat.");
      return;
    }

    const trimmedNewTitle = newTitle.trim();
    const originalChatSessions = [...chatSessions];

    const sessionToUpdate = chatSessions.find((s) => s.id === chatID);
    if (sessionToUpdate && sessionToUpdate.title === trimmedNewTitle) {
      return;
    }

    setChatSessions((prevSessions) =>
      sortSessions(
        // Make sure sortSessions correctly handles the updated item
        prevSessions.map((session) =>
          session.id === chatID
            ? {
                ...session,
                title: trimmedNewTitle,
                lastUpdatedAt: new Date().toISOString(),
              }
            : session
        )
      )
    );

    try {
      await axios.put(
        `${CHATS_API_BASE_URL}/${chatID}/rename`,
        { title: trimmedNewTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err: any) {
      console.error("Error renaming chat via API:", err);
      setError(
        err.response?.data?.error ||
          `Failed to rename chat to "${trimmedNewTitle}".`
      );
      setChatSessions(originalChatSessions); // Revert optimistic update on error
    }
  };
  return (
    <>
      {" "}
      <div
        className={`flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800 ${
          showDeleteModal
            ? "opacity-50 filter blur-sm pointer-events-none"
            : "opacity-100"
        } transition-all duration-300 ease-in-out`}
      >
        <div ref={sidebarRef} className="flex-shrink-0">
          {" "}
          {/* Sidebar container */}
          <Sidebar
            authUser={authUser}
            chatSessions={chatSessions}
            currentChatID={currentChatID}
            isSidebarOpen={isSidebarOpen}
            handleSelectChat={handleSelectChat}
            handleCreateNewChat={handleCreateNewChat}
            handleDeleteChatInitiate={handleDeleteChatInitiate}
            handleRenameChatConfirm={handleRenameChatConfirmInPage}
            isLoadingSessions={isLoadingSessions}
            isCreatingChat={isCreatingChat}
            setIsSidebarOpen={setIsSidebarOpen}
            deletingChatID={deletingChatID}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader
            authUser={authUser}
            onLogout={handleLogout}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          <ChatMessagesArea
            messages={messages}
            currentChatID={currentChatID}
            isLoading={isLoading}
            isLoadingSessions={isLoadingSessions}
            error={error}
          />
          <InputArea
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            loading={isLoading || !authUser}
          />
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Chat"
        message={`Are you sure you want to delete "${
          chatToDelete?.title || "this chat"
        }"? This action cannot be undone.`}
        onConfirm={confirmDeleteChat}
        onCancel={() => {
          setShowDeleteModal(false);
          setChatToDelete(null);
        }}
        confirmText="Delete"
        isDanger={true}
      />
    </>
  );
};
export default ChatPage;
