"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { Link } from "@/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isRTL = locale === "ar";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/fleet", label: t("fleet") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as "en" | "ar" });
    setLangOpen(false);
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
          className={`hidden md:flex items-center gap-4${isRTL ? " flex-row-reverse" : ""}`}
        >
          <Link
            href="/booking"
            className="btn-gold-outline text-xs tracking-widest uppercase px-5 py-2"
          >
            {t("booking")}
          </Link>

          <div className="relative flex flex-row gap-3 items-center justify-center">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-xs tracking-widest text-cream/60 hover:text-gold transition-colors uppercase"
            >
              {locale === "en" ? "EN" : "عربي"}
              <ChevronDown
                className={`w-3 h-3 transition-transform${langOpen ? " rotate-180" : ""}`}
              />
            </button>

            {langOpen && (
              <div className="absolute top-full mt-2 right-0 bg-luxury-dark border border-luxury-border w-24 py-1 z-50">
                {["en", "ar"].map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLocale(l)}
                    className={`w-full text-left px-4 py-2 text-xs tracking-wider uppercase transition-colors ${
                      locale === l
                        ? "text-gold"
                        : "text-cream/60 hover:text-gold"
                    }`}
                  >
                    {l === "en" ? "English" : "عربي"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className="md:hidden text-cream/70 hover:text-gold transition-colors p-2"
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
            <Link
              href="/booking"
              className="btn-gold text-center text-xs tracking-widest uppercase py-3 mt-2"
            >
              {t("booking")}
            </Link>

            <div className="flex gap-4 pt-2">
              {["en", "ar"].map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  className={`text-xs tracking-wider uppercase ${
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
    </header>
  );
}
