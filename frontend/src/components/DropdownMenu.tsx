"use client";

import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  QuestionMarkCircleIcon,
  HomeIcon,
  UsersIcon,
  LockClosedIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Gavel } from "lucide-react";
import { UserProfile } from "./Props/UserProfileProps";

interface DropdownMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  user?: UserProfile | null;
  onLogout?: () => void; // Optional logout function
}

export default function DropdownMenu({
  isOpen,
  setIsOpen,
  user,
  onLogout,
}: DropdownMenuProps) {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    if (path) router.push(path);
  };

  const handleAuctionManagement = () => {
    setIsOpen(false);
    router.push("/auction-management");
  };

  if (!isOpen) return null;

  // Only allow Bids for roles 2, 3, 4
  const role = user?.role_id ?? 0;
  const canSeeBids = role === 2 || role === 3 || role === 4;

  return (
    <div className="w-full space-y-2">
      {user && (
        <>
          <p className="text-sm text-gray-700 px-4">
            Welcome, {user.name || "User"}!
          </p>
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

      {/* Bids (roles 2,3,4 only) */}
      {canSeeBids && (
        <button
          onClick={() => handleNavigation("/bids")}
          className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
        >
          <Gavel className="h-5 w-5 text-gray-400 mr-3" />
          Bids
        </button>
      )}

      {(user?.role_id === 4 || user?.role_id === 3) && (
        <button
          onClick={handleAuctionManagement}
          className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
        >
          <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
          Auction Management
        </button>
      )}
      <button
        onClick={() => handleNavigation("/help")}
        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
        Help Center
      </button>

      <button
        onClick={() => handleNavigation("/become-a-host")}
        className="flex items-start w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
      >
        <HomeIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
        <div>
          <div className="font-medium">Become a host</div>
          <div className="text-sm text-gray-500">
            It’s easy to start hosting and earn extra income.
          </div>
        </div>
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
