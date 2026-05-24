"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car } from "@/types";
import axios from "axios";

interface CarFormProps {
  initialData?: Car;
  onClose: () => void;
}

export default function CarForm({ initialData, onClose }: CarFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "supercar",
    pricePerDay: "",
    available: true,
    featured: false,
    description: "",
    specs_engine: "",
    specs_transmission: "",
    specs_power: "",
    specs_seats: "",
  });
  const [isLoading, setisLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        brand: initialData.brand,
        category: initialData.category,
        pricePerDay: initialData.pricePerDay.toString(),
        available: initialData.available,
        featured: initialData.featured,
        description: initialData.description || "",
        specs_engine: initialData.specs?.engine || "",
        specs_transmission: initialData.specs?.transmission || "",
        specs_power: initialData.specs?.power?.toString() || "",
        specs_seats: initialData.specs?.seats?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setisLoading(true);
    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("brand", formData.brand);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("pricePerDay", formData.pricePerDay.toString());
    formDataToSend.append("description", formData.description);
    formDataToSend.append("available", formData.available.toString());
    formDataToSend.append("featured", formData.featured.toString());

    formDataToSend.append(
      "specs",
      JSON.stringify({
        engine: formData.specs_engine,
        transmission: formData.specs_transmission,
        power: formData.specs_power,
        seats: formData.specs_seats ? parseInt(formData.specs_seats) : null,
      }),
    );

    images.forEach((file) => formDataToSend.append("images", file));

    try {
      await axios.post("http://localhost:8000/cars/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setisLoading(false);
      onClose?.();
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="name"
          placeholder="Car Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
        <Input
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={handleChange}
          required
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full bg-luxury-gray border border-luxury-border px-4 py-2 text-cream text-sm focus:border-gold outline-none"
        >
          <option value="supercar">Supercar</option>
          <option value="luxury_sedan">Luxury Sedan</option>
          <option value="sports">Sports</option>
          <option value="premium_suv">Premium SUV</option>
        </select>
        <Input
          name="pricePerDay"
          type="number"
          placeholder="Price per Day"
          value={formData.pricePerDay}
          onChange={handleChange}
          required
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-6">
        <Input
          name="specs_engine"
          placeholder="Engine (e.g. V8)"
          value={formData.specs_engine}
          onChange={handleChange}
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
        <Input
          name="specs_transmission"
          placeholder="Transmission"
          value={formData.specs_transmission}
          onChange={handleChange}
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
        <Input
          name="specs_power"
          placeholder="Power (e.g. 600hp)"
          value={formData.specs_power}
          onChange={handleChange}
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
        <Input
          name="specs_seats"
          type="number"
          placeholder="Seats"
          value={formData.specs_seats}
          onChange={handleChange}
          className="bg-luxury-gray border-luxury-border text-cream rounded-none"
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="accent-gold"
          />{" "}
          Available
        </label>
        <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="accent-gold"
          />{" "}
          Featured
        </label>
      </div>

      <textarea
        name="description"
        placeholder="Description..."
        value={formData.description}
        onChange={handleChange}
        className="w-full p-4 bg-luxury-gray border border-luxury-border text-cream h-24 focus:border-gold outline-none rounded-none"
      />

      {/* Drag & Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed border-luxury-border p-4 h-48 cursor-pointer flex ${images.length > 0 ? "flex-row gap-4 overflow-x-auto" : "items-center justify-center"}`}
      >
        {images.length === 0 ? (
          <div className="text-center">
            <p className="text-xs text-cream/60 uppercase">
              Drag & Drop Images
            </p>
            <p className="text-xs text-cream/30">or click to browse</p>
          </div>
        ) : (
          images.map((file, index) => (
            <div key={index} className="relative min-w-[100px] h-full">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-full h-full object-cover border border-luxury-border"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 bg-black text-gold rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="w-full rounded-none border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gold"
          className="w-full rounded-none uppercase tracking-widest"
        >
          {initialData
            ? "Update Vehicle"
            : isLoading
              ? "Loading..."
              : "Submit Listing"}
        </Button>
      </div>
    </form>
  );
}
