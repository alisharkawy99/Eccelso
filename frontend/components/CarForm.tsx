"use client";

import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { Car } from "@/types";
import { apiClient } from "@/lib/api";
import {
  FieldErrors,
  hasErrors,
  inputErrorClass,
  validatePositiveNumber,
  validateRequired,
} from "@/lib/validation";

interface CarFormProps {
  initialData?: Car;
  onClose: () => void;
  isLoading?: boolean;
  setisLoading?: Dispatch<SetStateAction<boolean>>;
}

export default function CarForm({
  initialData,
  onClose,
  setisLoading,
  isLoading,
}: CarFormProps) {
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
  const [isEdit, setIsEdit] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldClass = "bg-luxury-gray border-luxury-border text-cream";

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
      setIsEdit(true);
    }
  }, [initialData]);

  const clearFieldError = (name: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

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
    clearFieldError(name);
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const nameError = validateRequired(formData.name, "Car name");
    const brandError = validateRequired(formData.brand, "Brand");
    const priceError = validatePositiveNumber(formData.pricePerDay, "Price per day");
    const engineError = validateRequired(formData.specs_engine, "Engine");
    const transmissionError = validateRequired(formData.specs_transmission, "Transmission");

    if (nameError) next.name = nameError;
    if (brandError) next.brand = brandError;
    if (priceError) next.pricePerDay = priceError;
    if (engineError) next.specs_engine = engineError;
    if (transmissionError) next.specs_transmission = transmissionError;
    if (!isEdit && images.length === 0) next.images = "At least one image is required";

    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setisLoading?.(true);
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
      if (isEdit) {
        await apiClient.patch(`/cars/${initialData?.id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/cars", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setisLoading?.(false);
      onClose?.();
    } catch (error) {
      console.error("Submission error:", error);
      setisLoading?.(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
      clearFieldError("images");
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const selectClass = (hasError?: boolean) =>
    inputErrorClass(
      hasError,
      "w-full rounded-xl bg-luxury-gray border border-luxury-border px-4 py-2 text-cream text-sm focus:border-gold outline-none",
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Car Name" error={errors.name} required>
          <Input
            name="name"
            placeholder="Car Name"
            value={formData.name}
            onChange={handleChange}
            className={inputErrorClass(!!errors.name, fieldClass)}
          />
        </FormField>
        <FormField label="Brand" error={errors.brand} required>
          <Input
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
            className={inputErrorClass(!!errors.brand, fieldClass)}
          />
        </FormField>
        <FormField label="Category" required>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={selectClass()}
          >
            <option value="supercar">Supercar</option>
            <option value="luxury_sedan">Luxury Sedan</option>
            <option value="sports">Sports</option>
            <option value="premium_suv">Premium SUV</option>
          </select>
        </FormField>
        <FormField label="Price per Day" error={errors.pricePerDay} required>
          <Input
            name="pricePerDay"
            type="number"
            placeholder="Price per Day"
            value={formData.pricePerDay}
            onChange={handleChange}
            className={inputErrorClass(!!errors.pricePerDay, fieldClass)}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FormField label="Engine" error={errors.specs_engine} required>
          <Input
            name="specs_engine"
            placeholder="Engine (e.g. V8)"
            value={formData.specs_engine}
            onChange={handleChange}
            className={inputErrorClass(!!errors.specs_engine, fieldClass)}
          />
        </FormField>
        <FormField label="Transmission" error={errors.specs_transmission} required>
          <Input
            name="specs_transmission"
            placeholder="Transmission"
            value={formData.specs_transmission}
            onChange={handleChange}
            className={inputErrorClass(!!errors.specs_transmission, fieldClass)}
          />
        </FormField>
        <FormField label="Power">
          <Input
            name="specs_power"
            placeholder="Power (e.g. 600hp)"
            value={formData.specs_power}
            onChange={handleChange}
            className={fieldClass}
          />
        </FormField>
        <FormField label="Seats">
          <Input
            name="specs_seats"
            type="number"
            placeholder="Seats"
            value={formData.specs_seats}
            onChange={handleChange}
            className={fieldClass}
          />
        </FormField>
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="accent-gold"
          />
          Available
        </label>
        <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="accent-gold"
          />
          Featured
        </label>
      </div>

      <FormField label="Description">
        <textarea
          name="description"
          placeholder="Description..."
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-xl p-4 bg-luxury-gray border border-luxury-border text-cream h-24 focus:border-gold outline-none"
        />
      </FormField>

      <FormField label="Images" error={errors.images} required={!isEdit}>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
            clearFieldError("images");
          }}
          onDragOver={(e) => e.preventDefault()}
          className={`rounded-xl border-2 border-dashed p-4 h-36 my-2 cursor-pointer flex ${
            errors.images ? "border-red-500/70 bg-red-500/5" : "border-luxury-border"
          } ${images.length > 0 ? "flex-row gap-4 overflow-x-auto" : "items-center justify-center"}`}
        >
          {images.length === 0 ? (
            <div className="text-center">
              <p className="text-xs text-cream/60 uppercase">Drag & Drop Images</p>
              <p className="text-xs text-cream/30">or click to browse</p>
            </div>
          ) : (
            images.map((file, index) => (
              <div key={index} className="relative min-w-[100px] h-full">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover rounded-lg border border-luxury-border"
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
      </FormField>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="w-full border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gold"
          className="w-full uppercase tracking-widest"
        >
          {initialData
            ? "Update Vehicle"
            : isLoading
              ? "Adding Vehicle..."
              : "Submit Listing"}
        </Button>
      </div>
    </form>
  );
}
