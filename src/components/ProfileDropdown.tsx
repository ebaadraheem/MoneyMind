import React, { useState, useEffect, useRef } from "react";
import type { User } from "firebase/auth";

const LogoutIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

const UserAvatarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={
      className || "h-8 w-8 rounded-full text-blue-600 dark:text-blue-400"
    }
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

interface ProfileDropdownProps {
  user: User | null | undefined;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null); // Ref for the trigger button

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    // Add event listener only when dropdown is open
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run effect if isOpen changes

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {" "}
      <button
        ref={triggerRef} // Assign ref to the button
        type="button"
        onClick={() => setIsOpen(!isOpen)} // Click toggles on all screen sizes
        className="flex cursor-pointer items-center text-sm rounded-full focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-600 p-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        id="user-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        <UserAvatarIcon className="h-7 w-7 rounded-full text-blue-600 dark:text-blue-400" />
      </button>
      {/* Dropdown Panel */}
      <div
        ref={dropdownRef} // Assign ref to the dropdown panel
        className={`absolute  right-0 mt-2 w-64 origin-top-right bg-white dark:bg-gray-900 rounded-md shadow-2xl ring-1 ring-blue-600 dark:ring-gray-700 ring-opacity-5 focus:outline-none pt-1 z-50 transform transition-all ease-out duration-150 ${
          isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        {/* User Email Display */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Signed in as
          </p>
          <p
            className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate"
            title={user.email || ""}
          >
            {user.email || "No email available"}
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            onLogout();
            setIsOpen(false); // Close dropdown on logout
          }}
          className="w-full rounded-b-md  cursor-pointer text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center group transition-colors"
          role="menuitem"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
