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
import { CATEGORY_LABELS } from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cog,
  ImagePlus,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Modal from "@/components/Modal";

const galleryActionClass =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-luxury-border/60 bg-luxury-black/70 backdrop-blur-sm text-cream/60 transition-all duration-200 hover:border-gold/40 hover:bg-gold/10 hover:text-gold";

const galleryDeleteClass =
  "flex h-7 w-7 items-center justify-center rounded-lg border border-luxury-border/50 bg-luxury-black/70 backdrop-blur-sm text-cream/50 transition-all duration-200 hover:border-red-500/50 hover:bg-red-500/15 hover:text-red-400";

export default function CarDetailPage() {
  const params = useParams();
  const t = useTranslations("car");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const refreshCarData = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const data = await getCarById(params.id as string);
      setCar(data);
      if (data) {
        setActiveImage((current) =>
          current >= data.images.length
            ? Math.max(0, data.images.length - 1)
            : current,
        );
      }
    } catch (err) {
      console.error("Failed to fetch car data:", err);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    refreshCarData();
  }, [refreshCarData]);

  const handleUploadIcons = async () => {
    if (images.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      images.forEach((img) => formData.append("uploaded_images", img));

      await apiClient.post(`/cars/${params.id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImages([]);
      setOpenUpload(false);
      await refreshCarData();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = useCallback(async () => {
    if (!deleteImageId) return;
    setIsDeletingImage(true);
    try {
      await apiClient.delete(`/images/${deleteImageId}`);
      setDeleteImageId(null);
      await refreshCarData();
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setIsDeletingImage(false);
    }
  }, [deleteImageId, refreshCarData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black pt-20 flex items-center justify-center">
        <div className="text-gold/40 text-sm tracking-widest uppercase animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!car || car.images.length === 0) {
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

  const specItems = [
    { label: t("engine"), value: car.specs.engine, icon: Cog },
    { label: t("power"), value: car.specs.power || "—", icon: Zap },
    { label: t("seats"), value: String(car.specs.seats ?? "—"), icon: Users },
    {
      label: t("transmission"),
      value: car.specs.transmission,
      icon: Settings2,
    },
  ];

  const uploadImages = () => (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }}
        onDragOver={(e) => e.preventDefault()}
        className={`rounded-xl border-2 border-dashed p-4 h-36 cursor-pointer flex transition-colors ${
          images.length > 0
            ? "flex-row gap-4 overflow-x-auto border-luxury-border"
            : "items-center justify-center border-luxury-border hover:border-gold/30"
        }`}
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
                className="absolute -top-2 -right-2 bg-luxury-black border border-gold/40 text-gold rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gold/10"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      <div className="flex flex-row gap-3">
        <Button
          type="button"
          onClick={() => {
            setOpenUpload(false);
            setImages([]);
          }}
          variant="outline"
          className="w-full border-luxury-border text-cream"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="gold"
          className="w-full uppercase tracking-widest"
          onClick={handleUploadIcons}
          disabled={isUploading || images.length === 0}
        >
          {isUploading ? "Uploading..." : "Upload Images"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept="image/*"
      />

      <Modal
        isOpen={openUpload}
        onClose={() => {
          setOpenUpload(false);
          setImages([]);
        }}
        title={locale === "ar" ? "إضافة صور" : "Add Gallery Images"}
        subtitle={
          locale === "ar"
            ? "ارفع صوراً جديدة لهذه السيارة"
            : "Upload new photos for this vehicle"
        }
        size="md"
        content={uploadImages()}
      />

      <Modal
        isOpen={!!deleteImageId}
        onClose={() => setDeleteImageId(null)}
        title={locale === "ar" ? "حذف الصورة؟" : "Delete Image?"}
        subtitle={
          locale === "ar"
            ? "سيتم إزالة هذه الصورة من المعرض"
            : "This photo will be removed from the gallery"
        }
        variant="confirm"
        size="sm"
        content={
          <div className="space-y-4">
            <p className="text-sm text-cream/55">
              {locale === "ar"
                ? "لا يمكن التراجع عن هذا الإجراء."
                : "This action cannot be undone."}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-luxury-border text-cream"
                onClick={() => setDeleteImageId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                size="sm"
                disabled={isDeletingImage}
                className="w-full uppercase tracking-widest hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                onClick={handleDeleteImage}
              >
                {isDeletingImage ? "Deleting..." : "Delete Image"}
              </Button>
            </div>
          </div>
        }
      />

      <div className="pt-24 pb-4 bg-luxury-black border-b border-luxury-border/20">
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

      <section className="bg-luxury-black pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] bg-luxury-gray overflow-hidden rounded-xl border border-luxury-border/30">
                <Image
                  src={car.images[activeImage].url}
                  alt={`${car.name} - image ${activeImage + 1}`}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-luxury-black/60 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-luxury-black/60 to-transparent pointer-events-none" />

                <div
                  className={`absolute top-3 flex items-center gap-2${isRTL ? " left-3" : " right-3"}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenUpload(true)}
                    className={galleryActionClass}
                    title="Add images"
                    aria-label="Add images"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {car.images.length > 1 && (
                  <>
                    <span className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 rounded-lg border border-luxury-border/50 bg-luxury-black/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream/60 backdrop-blur-sm">
                      {activeImage + 1} / {car.images.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImage(
                          (p) =>
                            (p - 1 + car.images.length) % car.images.length,
                        )
                      }
                      className={`absolute top-1/2 -translate-y-1/2 ${galleryActionClass} ${
                        isRTL ? "right-3" : "left-3"
                      }`}
                      aria-label="Previous image"
                    >
                      {isRTL ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronLeft className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveImage((p) => (p + 1) % car.images.length)
                      }
                      className={`absolute top-1/2 -translate-y-1/2 ${galleryActionClass} ${
                        isRTL ? "left-3" : "right-3"
                      }`}
                      aria-label="Next image"
                    >
                      {isRTL ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>

              {car.images.length > 1 && (
                <div
                  className={`flex gap-2 overflow-x-auto pb-1${isRTL ? " flex-row-reverse" : ""}`}
                >
                  {car.images.map((img, i) => (
                    <div
                      key={img.id}
                      className="group relative shrink-0 w-24 aspect-[4/3]"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`relative w-full h-full overflow-hidden rounded-lg border-2 transition-all ${
                          activeImage === i
                            ? "border-gold ring-1 ring-gold/30"
                            : "border-transparent opacity-50 hover:opacity-90"
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`${car.name} thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteImageId(img.id);
                        }}
                        className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 ${galleryDeleteClass}`}
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="space-y-4">
                <div
                  className={`flex items-center gap-2 flex-wrap${isRTL ? " flex-row-reverse" : ""}`}
                >
                  <Badge variant="gold">{categoryLabel}</Badge>
                  <Badge variant={car.available ? "available" : "unavailable"}>
                    {car.available ? t("available") : t("unavailable")}
                  </Badge>
                  {car.featured && (
                    <Badge variant="gold" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      {locale === "ar" ? "مميزة" : "Featured"}
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-1">
                    {car.brand}
                  </p>
                  <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-cream leading-tight">
                    {car.name}
                  </h1>
                </div>
              </div>

              {car.description && (
                <div className="card-glass p-5 space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold">
                    {locale === "ar" ? "نبذة" : "Overview"}
                  </p>
                  <p className="text-cream/55 text-sm leading-relaxed">
                    {car.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h2 className="text-[10px] tracking-[0.25em] uppercase text-gold font-semibold">
                  {t("specs")}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {specItems.map((spec) => {
                    const Icon = spec.icon;
                    return (
                      <div
                        key={spec.label}
                        className={`card-glass p-4 space-y-2${isRTL ? " text-right" : ""}`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-gold/70${isRTL ? " flex-row-reverse" : ""}`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <p className="text-[10px] tracking-widest uppercase text-cream/35">
                            {spec.label}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-cream">
                          {spec.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className={`flex gap-3 pt-2${isRTL ? " flex-row-reverse" : ""}`}
              >
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
    </>
  );
}
