"use client";

import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Avatar,
} from "@nextui-org/react";
import { User, LogOut, Settings, Car } from "lucide-react";
import Cookies from "js-cookie";

interface UserProfileMenuProps {
  userName: string;
}

export default function UserProfileMenu({ userName }: UserProfileMenuProps) {
  const handleLogout = () => {
    Cookies.remove("authToken");
    window.location.reload();
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="bordered"
          className="border-gray-700 bg-[#1a1a1a] text-white hover:border-[#c9a84c]"
        >
          <User size={18} />
          {userName}
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Profile Actions"
        variant="flat"
        className="bg-[#1a1a1a] text-white border border-gray-800"
      >
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-semibold">Signed in as</p>
          <p className="font-semibold">{userName}</p>
        </DropdownItem>

        <DropdownItem key="bookings" startContent={<Car size={16} />}>
          My Bookings
        </DropdownItem>

        <DropdownItem key="settings" startContent={<Settings size={16} />}>
          Settings
        </DropdownItem>

        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          startContent={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Logout
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
