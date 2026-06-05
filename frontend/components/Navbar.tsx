"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { Link } from "@/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import Modal from "./Modal";
import UserAuthForm from "./UserForm";
import Cookies from "js-cookie";
import UserProfileMenu from "./UserProfileMenu";
import { useAuth } from "@/app/hooks/useAuth";
import { Calendar, Crown } from "lucide-react";

interface StoredUser {
  name: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
}

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const token = Cookies.get("authToken");
  const [user, setUser] = useState<StoredUser | null>(null);
  const { isAdmin, authReady } = useAuth();
  const isRTL = locale === "ar";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const userString = sessionStorage.getItem("user");
    if (!userString) {
      setUser(null);
      return;
    }

    try {
      setUser(JSON.parse(userString));
    } catch {
      setUser(null);
    }
  }, [openUserModal, token]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/fleet", label: t("fleet") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "en" | "ar" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-playfair text-xl font-bold tracking-[0.15em] text-cream uppercase">
            Eccelso
          </span>
          <span className="text-[10px] tracking-[0.2em] text-gold uppercase">
            by Sharkawy
          </span>
        </Link>

        <div
          className={`hidden md:flex items-center gap-8${isRTL ? " flex-row-reverse" : ""}`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs tracking-widest uppercase transition-colors duration-200 ${
                pathname === link.href
                  ? "text-gold"
                  : "text-cream/70 hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div
          className={`hidden md:flex items-center gap-3${isRTL ? " flex-row-reverse" : ""}`}
        >
          {token && user && authReady ? (
            <>
              <Link
                href="/my-bookings"
                className={`inline-flex items-center gap-1.5 text-xs tracking-widest uppercase px-4 py-2 rounded-xl border transition-all duration-300 ${
                  pathname === "/my-bookings"
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-luxury-border/40 text-cream/70 hover:border-gold/40 hover:text-gold"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {locale === "ar" ? "حجوزاتي" : "My Bookings"}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/bookings"
                  className={`inline-flex items-center gap-1.5 text-xs tracking-widest uppercase px-4 py-2 rounded-xl border transition-all duration-300 ${
                    pathname === "/admin/bookings"
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-luxury-border/40 text-cream/70 hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  {locale === "ar" ? "لوحة الإدارة" : "Admin"}
                </Link>
              )}
            </>
          ) : (
            <Link
              href="/booking"
              className="btn-gold-outline text-xs tracking-widest uppercase px-5 py-[9px]"
            >
              {t("booking")}
            </Link>
          )}
          {token && user ? (
            <UserProfileMenu
              userName={user.name}
              userRole={user.role}
              userEmail={user.email}
              avatarUrl={user.avatar_url}
            />
          ) : (
            <Button size="md" onClick={() => setOpenUserModal(true)}>
              Sign in
            </Button>
          )}
        </div>

        <button
          className="md:hidden text-cream/70 hover:text-gold transition-colors p-2 rounded-xl"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden bg-luxury-dark border-b border-luxury-border animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
            {token && user && (
              <div className="rounded-2xl border border-gold/20 bg-gold/5 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
                  Signed in as
                </p>
                <p className="font-playfair text-lg text-cream">{user.name}</p>
                <p className="text-xs text-gold/80">
                  {user.role === "Admin" ? "Admin Access" : "VIP Member"}
                </p>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-widest uppercase py-2 border-b border-luxury-border/30 transition-colors ${
                  pathname === link.href ? "text-gold" : "text-cream/70"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {token && user && authReady && (
              <div className="flex flex-col gap-2">
                <Link
                  href="/my-bookings"
                  className={`inline-flex items-center justify-center gap-2 text-xs tracking-widest uppercase py-3 rounded-xl border transition-colors ${
                    pathname === "/my-bookings"
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-luxury-border/40 text-cream/70"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  {locale === "ar" ? "حجوزاتي" : "My Bookings"}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/bookings"
                    className={`inline-flex items-center justify-center gap-2 text-xs tracking-widest uppercase py-3 rounded-xl border transition-colors ${
                      pathname === "/admin/bookings"
                        ? "border-gold/50 bg-gold/10 text-gold"
                        : "border-luxury-border/40 text-cream/70"
                    }`}
                  >
                    <Crown className="h-4 w-4" />
                    {locale === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
                  </Link>
                )}
              </div>
            )}

            {!token && (
              <Link
                href="/booking"
                className="btn-gold text-center text-xs tracking-widest uppercase py-3 mt-2"
              >
                {t("booking")}
              </Link>
            )}

            {token && user ? (
              <UserProfileMenu
                userName={user.name}
                userRole={user.role}
                userEmail={user.email}
                avatarUrl={user.avatar_url}
              />
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setMobileOpen(false);
                  setOpenUserModal(true);
                }}
              >
                Sign in
              </Button>
            )}

            <div className="flex gap-4 pt-2">
              {["en", "ar"].map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`text-xs tracking-wider uppercase rounded-lg px-2 py-1 ${
                    locale === l ? "text-gold" : "text-cream/40"
                  }`}
                >
                  {l === "en" ? "English" : "عربي"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal
        variant="auth"
        isOpen={openUserModal}
        onClose={() => setOpenUserModal(false)}
        content={<UserAuthForm onClose={() => setOpenUserModal(false)} />}
      />
    </header>
  );
}
