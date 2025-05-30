import React from "react";
import type { User as FirebaseUser } from "firebase/auth";
import ProfileDropdown from "./ProfileDropdown";
import { Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";

interface AppHeaderProps {
  authUser: FirebaseUser | null | undefined;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  authUser,
  onLogout,
  onToggleSidebar,
}) => {
  return (
    <header className="py-3 px-4 sm:px-6 bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-xs flex justify-between items-center flex-shrink-0">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="mr-3 p-1 transition-all md:hidden text-gray-500 hover:bg-slate-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200  cursor-pointer rounded-full " // Only show on mobile to toggle sidebar
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-1.5">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl pt-0.5 font-semibold">Moneymind</h1>
        </div>
      </div>
      {authUser && (
        <ProfileDropdown user={authUser as FirebaseUser} onLogout={onLogout} />
      )}
    </header>
  );
};

export default AppHeader;
