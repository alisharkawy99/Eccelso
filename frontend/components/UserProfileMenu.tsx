"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/navigation";
import {
  Calendar,
  Car,
  ChevronDown,
  Crown,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import Cookies from "js-cookie";

interface UserProfileMenuProps {
  userName: string;
  userRole?: string;
  userEmail?: string;
  avatarUrl?: string | null;
}

function UserAvatar({
  name,
  avatarUrl,
  size = "sm",
}: {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";

  if (avatarUrl) {
    return (
      <span className={`relative block overflow-hidden rounded-full ${sizeClass}`}>
        <Image src={avatarUrl} alt={name} fill className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light font-bold text-luxury-black shadow-inner ${sizeClass}`}
    >
      {getInitials(name)}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserProfileMenu({
  userName,
  userRole = "User",
  userEmail,
  avatarUrl,
}: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = userRole === "Admin";
  const firstName = userName.split(" ")[0] || userName;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove("authToken");
    sessionStorage.removeItem("user");
    window.location.reload();
  };

  const menuItems = [
    {
      key: "bookings",
      label: "My Bookings",
      href: "/booking",
      icon: Calendar,
    },
    {
      key: "fleet",
      label: "Browse Fleet",
      href: "/fleet",
      icon: Car,
    },
    ...(isAdmin
      ? [
          {
            key: "admin",
            label: "Admin Dashboard",
            href: "/admin",
            icon: Crown,
          },
        ]
      : []),
    {
      key: "settings",
      label: "Account Settings",
      href: "/contact",
      icon: Settings,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex items-center gap-2.5 rounded-full border px-2 py-1.5 pe-3 transition-all duration-300 ${
          open
            ? "border-gold/60 bg-gold/10 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
            : "border-luxury-border bg-luxury-gray/40 hover:border-gold/40 hover:bg-luxury-gray/70"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="relative">
          <UserAvatar name={userName} avatarUrl={avatarUrl} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-luxury-black bg-emerald-500" />
        </span>
        <span className="hidden lg:block text-left">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-cream/40">
            Welcome
          </span>
          <span className="block text-xs font-semibold text-cream">
            {firstName}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-gold transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="user-menu-panel absolute end-0 top-[calc(100%+0.75rem)] z-50 w-72 overflow-hidden rounded-2xl animate-fade-in">
          <div className="border-b border-gold/10 bg-gradient-to-br from-gold/10 via-transparent to-transparent px-4 py-4">
            <div className="flex items-start gap-3">
              <UserAvatar name={userName} avatarUrl={avatarUrl} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-playfair text-base font-semibold text-cream">
                  {userName}
                </p>
                {userEmail && (
                  <p className="truncate text-xs text-cream/40">{userEmail}</p>
                )}
                <span
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isAdmin
                      ? "bg-gold/20 text-gold"
                      : "bg-cream/5 text-cream/60"
                  }`}
                >
                  {isAdmin ? <Crown className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isAdmin ? "Admin" : "VIP Member"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream/70 transition-colors hover:bg-gold/10 hover:text-gold"
              >
                <item.icon className="h-4 w-4 text-gold/70" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-luxury-border/30 p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
