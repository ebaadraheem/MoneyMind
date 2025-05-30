import React from "react";
const SendIcon: React.FC<{ loading: boolean }> = ({ loading }) =>
  loading ? (
    <svg
      className="animate-spin h-5 w-5 text-white"
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 text-white transform rotate-45"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  );

interface FooterProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  loading: boolean;
}

// --- Input Area Component  ---
export const InputArea: React.FC<FooterProps> = ({
  input,
  setInput,
  handleSend,
  loading,
}) => {
  return (
    <footer className="p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-sm sticky bottom-0 left-0 right-0">
      <label
        htmlFor="chatInput" // Points to the input's ID
        className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full py-1 px-2 w-full cursor-text focus-within:ring-1 focus-within:ring-blue-500 focus-within:ring-opacity-60 transition duration-200"
      >
        <input
          id="chatInput" // ID for the label to target
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white px-2 placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Ask about finance..."
        />
        <button
          onClick={(e) => {
            // Prevent label click when button is clicked & handle send
            e.preventDefault();
            handleSend();
          }}
          disabled={loading || !input.trim()}
          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 flex items-center justify-center transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          <SendIcon loading={loading} />
        </button>
      </label>
    </footer>
  );
};
