"use client";

import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  QuestionMarkCircleIcon,
  HomeIcon,
  UsersIcon,
  GiftIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { UserProfile } from "./Type/UserProfileProps";

interface DropdownMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  user?: UserProfile | null;
  onLogout?: () => void; // Optional logout function
}

export default function DropdownMenu({ isOpen, setIsOpen, user, onLogout }: DropdownMenuProps) {
  const router = useRouter();

  const   handleNavigation = (path: string) => {
    setIsOpen(false);
    if (path) router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full space-y-2">
      {user && (
        <>
          <p className="text-sm text-gray-700 px-4">Welcome, {user.name || "User"}!</p>
          <button
            onClick={() => {
              onLogout?.();
              setIsOpen(false);
            }}
            className="flex items-center w-full text-left px-4 py-2 text-red-500 hover:text-red-700 hover:bg-gray-50 rounded-lg transition"
          >
            <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
            Logout
          </button>
        </>
      )}
      <button
        onClick={() => handleNavigation("/help")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
        Help Center
      </button>
      <button
        onClick={() => handleNavigation("/become-host")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <HomeIcon className="h-5 w-5 text-gray-400 mr-3" />
        <div>
          <div className="font-medium">Become a host</div>
          <div className="text-sm text-gray-500">It’s easy to start hosting and earn extra income.</div>
        </div>
      </button>
      <button
        onClick={() => handleNavigation("/refer-host")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
        Refer a Host
      </button>
      <button
        onClick={() => handleNavigation("/find-cohost")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
        Find a co-host
      </button>
      <button
        onClick={() => handleNavigation("/gift-cards")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <GiftIcon className="h-5 w-5 text-gray-400 mr-3" />
        Gift cards
      </button>
      {!user && (
        <button
          onClick={() => handleNavigation("/login")}
          className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
        >
          <LockClosedIcon className="h-5 w-5 text-gray-400 mr-3" />
          Log in or sign up
        </button>
      )}
    </div>
  );
}