"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import {
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import {
  FieldErrors,
  hasErrors,
  inputErrorClass,
  validateEmail,
  validateImageFile,
  validateName,
  validatePassword,
  validatePhone,
} from "@/lib/validation";
import Cookies from "js-cookie";

interface UserAuthFormProps {
  onClose: () => void;
}

export default function UserAuthForm({ onClose }: UserAuthFormProps) {
  const [step, setStep] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    mobile: "",
    email: "",
    address: "",
  });

  const fieldClass = "bg-luxury-black/50 border-luxury-border text-cream focus:border-gold outline-none";

  const clearFieldError = (name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
    if (error) setError("");
  };

  const validateLogin = (): FieldErrors => {
    const next: FieldErrors = {};
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    if (emailError) next.email = emailError;
    if (passwordError) next.password = passwordError;
    return next;
  };

  const validateRegister = (): FieldErrors => {
    const next: FieldErrors = { ...validateLogin() };
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.mobile);
    const avatarError = validateImageFile(avatar);
    if (nameError) next.name = nameError;
    if (phoneError) next.mobile = phoneError;
    if (avatarError) next.avatar = avatarError;
    return next;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const avatarError = validateImageFile(file);
    if (avatarError) {
      setErrors((prev) => ({ ...prev, avatar: avatarError }));
      return;
    }

    clearFieldError("avatar");
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    clearFieldError("avatar");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = step === "login" ? validateLogin() : validateRegister();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsLoading(true);
    setError("");

    try {
      if (step === "login") {
        const response = await apiClient.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data) {
          Cookies.set("authToken", response.data.token, {
            expires: 7,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
          });
          sessionStorage.setItem("user", JSON.stringify(response.data.user));
          onClose();
        }
      } else {
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("phone_number", formData.mobile);
        if (formData.address.trim()) {
          formDataToSend.append("address", formData.address);
        }
        if (avatar) formDataToSend.append("avatar", avatar);

        const response = await apiClient.post("/auth/register", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.message) {
          setStep("login");
          setError("");
          removeAvatar();
        }
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { status?: number; data?: { detail?: string } } };
      if (apiError.response?.status === 404 && step === "login") {
        setStep("register");
        setError("No account found. Complete your registration below.");
      } else {
        setError(
          apiError.response?.data?.detail ||
            "Something went wrong. Please check your details and try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[520px] flex-col md:flex-row">
      <div className="relative hidden overflow-hidden md:flex md:w-[42%] md:flex-col md:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-luxury-black to-luxury-black" />
        <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-8 bottom-16 h-32 w-32 rounded-full bg-gold/5 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-8 py-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold/80">
            Eccelso by Sharkawy
          </p>
          <h2 className="mt-4 font-playfair text-3xl font-bold leading-tight text-cream">
            Your gateway to
            <span className="block text-gold-gradient">luxury driving</span>
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/50">
            Sign in to manage bookings, access exclusive fleet offers, and enjoy
            a seamless rental experience in Cairo.
          </p>

          <div className="mt-8 space-y-3">
            {["Premium fleet access", "Priority booking", "Member-only offers"].map(
              (item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-cream/60">
                  <Sparkles className="h-4 w-4 shrink-0 text-gold/70" />
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="relative z-10 border-t border-gold/10 px-8 py-5">
          <p className="text-xs text-cream/35">
            Trusted luxury car rental — Cairo, Egypt
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 py-8 md:px-8 md:py-10">
        <div className="mb-6 md:mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40 md:hidden">
            Eccelso Members
          </p>
          <h3 className="mt-2 font-playfair text-2xl font-semibold text-cream">
            {step === "login" ? "Welcome back" : "Join Eccelso"}
          </h3>
          <p className="mt-1 text-sm text-cream/45">
            {step === "login"
              ? "Enter your credentials to access your account"
              : "Create your account to start your luxury journey"}
          </p>
        </div>

        <div className="mb-6 flex rounded-xl border border-luxury-border bg-luxury-gray/30 p-1">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStep(tab);
                setError("");
                setErrors({});
              }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 ${
                step === tab
                  ? "bg-gold text-luxury-black shadow-[0_4px_20px_rgba(201,168,76,0.25)]"
                  : "text-cream/45 hover:text-cream/70"
              }`}
            >
              {tab === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4" noValidate>
          <FormField label="Email" error={errors.email} required icon={<Mail className="h-3 w-3" />}>
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputErrorClass(!!errors.email, fieldClass)}
            />
          </FormField>

          <FormField label="Password" error={errors.password} required icon={<KeyRound className="h-3 w-3" />}>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={inputErrorClass(!!errors.password, `${fieldClass} pe-10`)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-2.5 text-cream/40 transition-colors hover:text-gold"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>

          {step === "register" && (
            <div className="space-y-4 animate-fade-in">
              <FormField
                label="Profile Photo"
                error={errors.avatar}
                icon={<ImagePlus className="h-3 w-3" />}
              >
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors ${
                      errors.avatar
                        ? "border-red-500/70 bg-red-500/5"
                        : "border-luxury-border bg-luxury-gray/40 hover:border-gold/40"
                    }`}
                  >
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-5 w-5 text-cream/40" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs text-cream/50">Optional profile photo</p>
                    <p className="text-[10px] text-cream/30">JPG, PNG up to 5MB</p>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300"
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </FormField>

              <FormField label="Full Name" error={errors.name} required icon={<User className="h-3 w-3" />}>
                <Input
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputErrorClass(!!errors.name, fieldClass)}
                />
              </FormField>

              <FormField label="Mobile" error={errors.mobile} required icon={<Phone className="h-3 w-3" />}>
                <Input
                  name="mobile"
                  placeholder="+20 ..."
                  value={formData.mobile}
                  onChange={handleChange}
                  className={inputErrorClass(!!errors.mobile, fieldClass)}
                />
              </FormField>

              <FormField label="Address" icon={<MapPin className="h-3 w-3" />}>
                <Input
                  name="address"
                  placeholder="Your address (optional)"
                  value={formData.address}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </FormField>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="w-full border-luxury-border text-cream sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gold"
              disabled={isLoading}
              className="w-full uppercase tracking-widest sm:flex-1"
            >
              {isLoading
                ? "Processing..."
                : step === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
