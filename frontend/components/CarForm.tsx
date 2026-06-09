"use client";

import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";
import { Car } from "@/types";
import { apiClient } from "@/lib/api";
import {
  FieldErrors,
  hasErrors,
  inputErrorClass,
  validateRequired,
} from "@/lib/validation";
import {
  CarFront,
  ImagePlus,
  Info,
  Settings2,
  Tag,
} from "lucide-react";

interface CarFormProps {
  initialData?: Car;
  onClose: () => void;
  onSuccess?: (car: Car) => void;
  isLoading?: boolean;
  setisLoading?: Dispatch<SetStateAction<boolean>>;
}

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
            {title}
          </h3>
        </div>
        {description && (
          <p className="mt-1.5 text-xs text-cream/40">{description}</p>
        )}
        <div className="mt-3 h-px bg-luxury-border/30" />
      </div>
      {children}
    </section>
  );
}

export default function CarForm({
  initialData,
  onClose,
  onSuccess,
  setisLoading,
  isLoading,
}: CarFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "supercar",
    condition: "new",
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
        condition: initialData.condition || "new",
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
    const engineError = validateRequired(formData.specs_engine, "Engine");
    const transmissionError = validateRequired(
      formData.specs_transmission,
      "Transmission",
    );

    if (nameError) next.name = nameError;
    if (brandError) next.brand = brandError;
    if (engineError) next.specs_engine = engineError;
    if (transmissionError) next.specs_transmission = transmissionError;
    if (!isEdit && images.length === 0)
      next.images = "At least one image is required";

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
    formDataToSend.append("condition", formData.condition);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("available", formData.available.toString());
    formDataToSend.append("featured", formData.featured.toString());

    formDataToSend.append(
      "specs",
      JSON.stringify({
        engine: formData.specs_engine,
        transmission: formData.specs_transmission,
        power: formData.specs_power || null,
        seats: formData.specs_seats ? parseInt(formData.specs_seats, 10) : null,
      }),
    );

    images.forEach((file) => formDataToSend.append("images", file));
    try {
      let savedCar: Car;
      if (isEdit) {
        const { data } = await apiClient.patch<Car>(
          `/cars/${initialData?.id}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        savedCar = data;
      } else {
        const { data } = await apiClient.post<Car>("/cars", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        savedCar = data;
      }

      setisLoading?.(false);
      onSuccess?.(savedCar);
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
    <form
      onSubmit={handleSubmit}
      className="form-scroll space-y-8 max-h-[60vh]"
      noValidate
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />

      <FormSection
        title="Vehicle Identity"
        description="Basic information shown on fleet cards and detail pages."
        icon={<CarFront className="h-3.5 w-3.5 text-gold/70" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Car Name" error={errors.name} required>
            <Input
              name="name"
              placeholder="e.g. Huracán EVO"
              value={formData.name}
              onChange={handleChange}
              className={inputErrorClass(!!errors.name, fieldClass)}
            />
          </FormField>
          <FormField label="Brand" error={errors.brand} required>
            <Input
              name="brand"
              placeholder="e.g. Lamborghini"
              value={formData.brand}
              onChange={handleChange}
              className={inputErrorClass(!!errors.brand, fieldClass)}
            />
          </FormField>
          <FormField
            label="Category"
            required
            icon={<Tag className="h-3 w-3" />}
          >
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
          <FormField label="Condition" required>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={selectClass()}
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </FormField>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
            <input
              type="checkbox"
              name="available"
              checked={formData.available}
              onChange={handleChange}
              className="accent-gold"
            />
            Available for booking
          </label>
          <label className="flex items-center gap-2 text-cream text-sm cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="accent-gold"
            />
            Featured on homepage
          </label>
        </div>
      </FormSection>

      <FormSection
        title="Specifications"
        description="Engine and performance details for the listing."
        icon={<Settings2 className="h-3.5 w-3.5 text-gold/70" />}
      >
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Engine" error={errors.specs_engine} required>
            <Input
              name="specs_engine"
              placeholder="e.g. V10 Twin-Turbo"
              value={formData.specs_engine}
              onChange={handleChange}
              className={inputErrorClass(!!errors.specs_engine, fieldClass)}
            />
          </FormField>
          <FormField
            label="Transmission"
            error={errors.specs_transmission}
            required
          >
            <Input
              name="specs_transmission"
              placeholder="e.g. 7-Speed DCT"
              value={formData.specs_transmission}
              onChange={handleChange}
              className={inputErrorClass(
                !!errors.specs_transmission,
                fieldClass,
              )}
            />
          </FormField>
          <FormField label="Power">
            <Input
              name="specs_power"
              type="text"
              inputMode="text"
              placeholder="e.g. 640 hp (optional)"
              value={formData.specs_power}
              onChange={handleChange}
              className={fieldClass}
            />
          </FormField>
          <FormField label="Seats">
            <Input
              name="specs_seats"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2 (optional)"
              value={formData.specs_seats}
              onChange={handleChange}
              className={fieldClass}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Media & Description"
        description="Upload photos and add a short description."
        icon={<ImagePlus className="h-3.5 w-3.5 text-gold/70" />}
      >
        <FormField label="Description" icon={<Info className="h-3 w-3" />}>
          <textarea
            name="description"
            placeholder="Describe the vehicle experience, highlights, and unique features..."
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
              errors.images
                ? "border-red-500/70 bg-red-500/5"
                : "border-luxury-border hover:border-gold/30"
            } ${images.length > 0 ? "flex-row gap-4 overflow-x-auto" : "items-center justify-center"}`}
          >
            {images.length === 0 ? (
              <div className="text-center">
                <ImagePlus className="mx-auto h-6 w-6 text-gold/50 mb-2" />
                <p className="text-xs text-cream/60 uppercase tracking-wider">
                  Drag & Drop Images
                </p>
                <p className="text-xs text-cream/30">or click to browse</p>
              </div>
            ) : (
              images.map((file, index) => (
                <div key={index} className="relative min-w-[100px] h-full">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    unoptimized
                    width={100}
                    height={100}
                    className="w-full h-full object-cover rounded-lg border border-luxury-border"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute -top-2 -right-2 bg-luxury-black border border-gold/40 text-gold rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gold/10"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </FormField>
      </FormSection>

      <div className="flex gap-4 pt-2 border-t border-luxury-border/30">
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
          disabled={isLoading}
          className="w-full uppercase tracking-widest"
        >
          {isLoading
            ? isEdit
              ? "Updating..."
              : "Adding Vehicle..."
            : isEdit
              ? "Update Vehicle"
              : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}

