"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { getCarById } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Modal from "@/components/Modal";

export default function CarDetailPage() {
  const params = useParams();
  const t = useTranslations("car");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 1. Define the refetcher function once
  const refreshCarData = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      console.log("fetching");
      const data = await getCarById(params.id as string);
      console.log("fetched");
      setCar(data);
    } catch (err) {
      console.error("Failed to fetch car data:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  // 2. Use it in useEffect for initial load
  useEffect(() => {
    refreshCarData();
  }, [refreshCarData]);

  // 3. Use it in your handlers
  const handleUploadIcons = async () => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("uploaded_images", img));

      await apiClient.post(`/cars/${params.id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages([]);
      setOpenUpload(false);
      // Reuse the refetcher
      await refreshCarData();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/images/${id}`);
        // Reuse the refetcher
        await refreshCarData();
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    },
    [refreshCarData],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-20 flex items-center justify-center">
        <div className="text-gold/40 text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-luxury-black pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-cream/40 text-sm">Car not found</p>
        <Link href="/fleet">
          <Button variant="outline">{t("backToFleet")}</Button>
        </Link>
      </div>
    );
  }
  const categoryLabel = CATEGORY_LABELS[car.category][locale as "en" | "ar"];

  const uploadImages = () => {
    return (
      <div className="flex flex-col gap-3">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className={`border-2 border-dashed border-luxury-border p-4 h-36 my-2 cursor-pointer flex ${images.length > 0 ? "flex-row gap-4 overflow-x-auto" : "items-center justify-center"}`}
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
        <div className="flex flex-row justify-between gap-4">
          <Button
            type="button"
            onClick={() => setOpenUpload(false)}
            variant="outline"
            className="w-full border-luxury-border text-cream"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            className="w-full uppercase tracking-widest"
            onClick={handleUploadIcons}
            disabled={isUploading}
          >
            {isUploading ? "Uploading....." : "Upload Images"}
          </Button>
        </div>
      </div>
    );
  };
  return (
    <>
      {/* Back button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />
      <div className="pt-24 pb-4 bg-luxury-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/fleet"
            className={`inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cream/40 hover:text-gold transition-colors${isRTL ? " flex-row-reverse" : ""}`}
          >
            {isRTL ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5" />
            )}
            {t("backToFleet")}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <section className="bg-luxury-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* ── Gallery ── */}
            <div className="space-y-3">
              {/* Main image */}
              <div className="relative aspect-[16/10] bg-luxury-gray overflow-hidden">
                <button
                  onClick={() => {
                    setOpenUpload(true);
                  }}
                  className="absolute top-0 right-0 z-50 border border-white rounded-full"
                  title="Add Image"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <Image
                  src={car.images[activeImage].url}
                  alt={`${car.name} - image ${activeImage + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                {/* Prev/Next arrows */}
                {car.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImage(
                          (p) =>
                            (p - 1 + car.images.length) % car.images.length,
                        )
                      }
                      className={`absolute top-1/2 -translate-y-1/2 p-2 bg-luxury-black/60 hover:bg-luxury-black text-cream hover:text-gold transition-colors ${
                        isRTL ? "right-2" : "left-2"
                      }`}
                    >
                      {isRTL ? (
                        <ChevronRight className="w-5 h-5" />
                      ) : (
                        <ChevronLeft className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setActiveImage((p) => (p + 1) % car.images.length)
                      }
                      className={`absolute top-1/2 -translate-y-1/2 p-2 bg-luxury-black/60 hover:bg-luxury-black text-cream hover:text-gold transition-colors ${
                        isRTL ? "left-2" : "right-2"
                      }`}
                    >
                      {isRTL ? (
                        <ChevronLeft className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {car.images.length > 1 && (
                <div
                  className={`flex gap-2${isRTL ? " flex-row-reverse" : ""}`}
                >
                  {car.images.map((img, i) => (
                    <div
                      key={img.id}
                      className="group relative flex-1 aspect-[4/3]"
                    >
                      {/* The Thumbnail Button */}
                      <button
                        onClick={() => setActiveImage(i)}
                        className={`w-full h-full overflow-hidden border-2 transition-colors ${
                          activeImage === i
                            ? "border-gold"
                            : "border-transparent opacity-50 hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`${car.name} thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="120px"
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents triggering the thumbnail click
                          handleDeleteImage(img.id); // Call your delete function
                        }}
                        className="absolute transition-opacity opacity-0 top-1 right-1 bg-black/50 p-1 rounded-full hover:bg-red-600 group-hover:opacity-100"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div
                  className={`flex items-center gap-2 mb-2 flex-wrap${isRTL ? " flex-row-reverse" : ""}`}
                >
                  <Badge variant="gold">{categoryLabel}</Badge>
                  <Badge variant={car.available ? "available" : "unavailable"}>
                    {car.available ? t("available") : t("unavailable")}
                  </Badge>
                </div>
                <p className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-1">
                  {car.brand}
                </p>
                <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-cream">
                  {car.name}
                </h1>
              </div>

              {/* Price */}
              <div className="border-t border-b border-luxury-border/30 py-4">
                <div
                  className={`flex items-baseline gap-2${isRTL ? " flex-row-reverse" : ""}`}
                >
                  <span className="font-playfair text-4xl font-bold text-gold">
                    {formatPrice(car.pricePerDay, locale)}
                  </span>
                  <span className="text-sm text-cream/40 tracking-wide">
                    {t("pricePerDay")}
                  </span>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <p className="text-cream/50 text-sm leading-relaxed">
                  {car.description}
                </p>
              )}

              {/* Specs */}
              <div className="space-y-3">
                <h2 className="text-xs tracking-[0.3em] uppercase text-gold font-semibold">
                  {t("specs")}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t("engine"), value: car.specs.engine },
                    { label: t("power"), value: car.specs.power },
                    { label: t("seats"), value: String(car.specs.seats) },
                    { label: t("transmission"), value: car.specs.transmission },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className={`bg-luxury-gray p-3 space-y-1${isRTL ? " text-right" : ""}`}
                    >
                      <p className="text-[10px] tracking-widest uppercase text-cream/30">
                        {spec.label}
                      </p>
                      <p className="text-sm font-medium text-cream">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className={`flex gap-3${isRTL ? " flex-row-reverse" : ""}`}>
                <Link href={`/booking?car=${car.id}`} className="flex-1">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={!car.available}
                  >
                    {t("bookNow")}
                  </Button>
                </Link>
                <a
                  href="https://wa.me/201000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal
        isOpen={openUpload}
        onClose={() => setOpenUpload(false)}
        content={uploadImages()}
      />
    </>
  );
}
