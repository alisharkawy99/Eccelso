"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
interface UserAuthFormProps {
  onClose: () => void;
}

export default function UserAuthForm({ onClose }: UserAuthFormProps) {
  const [step, setStep] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    mobile: "",
    email: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === "login") {
        // Attempt to login
        const response = await axios.post("http://localhost:8000/users/login", {
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
        // Final Registration
        const response = await axios.post(
          "http://localhost:8000/users/register",
          {
            ...formData,
            phone_number: formData.mobile,
          },
        );
        if (response.data.message) {
          setStep("login");
        }
      }
    } catch (error: any) {
      // If user doesn't exist, switch to registration
      if (error.response?.status === 404) {
        setStep("register");
      } else {
        console.error("Submission error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 flex flex-col gap-4"
    >
      <h2 className="text-cream text-xl uppercase tracking-widest border-b border-luxury-border pb-2">
        {step === "login" ? "Sign In" : "Complete Registration"}
      </h2>

      {/* Email Field */}
      <div className="space-y-1">
        <label className="text-xs text-cream/70 uppercase">email</label>
        <Input
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-black border-luxury-border text-cream rounded-none focus:border-gold outline-none"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-1">
        <label className="text-xs text-cream/70 uppercase">Password</label>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-black border-luxury-border text-cream rounded-none pr-10 focus:border-gold outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-cream/50 hover:text-gold transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Additional Registration Fields */}
      {step === "register" && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="space-y-1">
            <label className="text-xs text-cream/70 uppercase">UserName</label>
            <Input
              name="name"
              placeholder="Enter your username"
              value={formData.name}
              onChange={handleChange}
              required
              className="bg-black border-luxury-border text-cream rounded-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-cream/70 uppercase">Mobile</label>
            <Input
              name="mobile"
              placeholder="Enter your mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="bg-black border-luxury-border text-cream rounded-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-cream/70 uppercase">Address</label>
            <Input
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              required
              className="bg-black border-luxury-border text-cream rounded-none"
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 mt-5">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="w-full !rounded-lg border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gold"
          className="w-full !rounded-lg uppercase tracking-widest"
        >
          {isLoading
            ? "Processing..."
            : step === "login"
              ? "Sign In"
              : "Register"}
        </Button>
      </div>
    </form>
  );
}
