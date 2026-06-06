"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { Car } from "@/types";
import { getCarById, adminMarkCarSold } from "@/lib/api";
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
  MessageCircle,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import Modal from "@/components/Modal";
import { useAuth } from "@/app/hooks/useAuth";
import { WHATSAPP_URL } from "@/lib/social";

const galleryBtn =
  "flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 backdrop-blur-md text-cream/70 transition-all duration-200 hover:border-gold/50 hover:bg-gold/10 hover:text-gold";

const thumbDeleteBtn =
  "flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm text-cream/50 transition-all opacity-0 group-hover:opacity-100 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-400";

export default function CarDetailPage() {
  const params = useParams();
  const t = useTranslations("car");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const { isAdmin } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [openUpload, setOpenUpload] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const [markingSold, setMarkingSold] = useState(false);
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

  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const thumb = strip.querySelector<HTMLElement>(
      `[data-thumb-index="${activeImage}"]`,
    );
    if (!thumb) return;

    const thumbLeft = thumb.offsetLeft;
    const thumbWidth = thumb.offsetWidth;
    const stripWidth = strip.clientWidth;
    strip.scrollTo({
      left: thumbLeft - stripWidth / 2 + thumbWidth / 2,
      behavior: "smooth",
    });
  }, [activeImage]);

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
      <div className="min-h-screen overflow-x-hidden bg-luxury-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-4 w-32 bg-luxury-gray rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-10">
            <div className="aspect-[4/3] sm:aspect-[3/2] bg-luxury-gray rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 w-24 bg-luxury-gray rounded" />
              <div className="h-10 w-3/4 bg-luxury-gray rounded" />
              <div className="h-20 bg-luxury-gray rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-luxury-gray rounded-lg" />
                ))}
              </div>
            </div>
          </div>
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
    car.specs.power
      ? { label: t("power"), value: car.specs.power, icon: Zap }
      : null,
    car.specs.seats != null
      ? {
          label: t("seats"),
          value: String(car.specs.seats),
          icon: Users,
        }
      : null,
    {
      label: t("transmission"),
      value: car.specs.transmission,
      icon: Settings2,
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    icon: typeof Cog;
  }[];

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
      <div className="flex gap-3">
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

      <div className="min-h-screen overflow-x-hidden bg-luxury-black pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/fleet"
            className={`inline-flex items-center gap-2 text-xs tracking-widest uppercase text-cream/40 hover:text-gold transition-colors mb-8${isRTL ? " flex-row-reverse" : ""}`}
          >
            {isRTL ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5" />
            )}
            {t("backToFleet")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-10 lg:gap-14 items-start">
            {/* Gallery */}
            <div className="min-w-0 space-y-4">
              <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden rounded-2xl border border-luxury-border/30 bg-luxury-gray shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)]">
                <Image
                  src={car.images[activeImage].url}
                  alt={`${car.name} - ${activeImage + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {isAdmin && (
                  <div
                    className={`absolute top-3 flex items-center gap-2${isRTL ? " left-3" : " right-3"}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenUpload(true)}
                      className={galleryBtn}
                      aria-label="Add images"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {car.images.length > 1 && (
                  <>
                    <span
                      className={`absolute bottom-3 rounded-lg border border-luxury-border/50 bg-luxury-black/70 px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream/60 backdrop-blur-sm${isRTL ? " right-3" : " left-3"}`}
                    >
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
                      className={`absolute top-1/2 -translate-y-1/2 ${galleryBtn} ${
                        isRTL ? "right-3" : "left-3"
                      }`}
                      aria-label="Previous"
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
                      className={`absolute top-1/2 -translate-y-1/2 ${galleryBtn} ${
                        isRTL ? "left-3" : "right-3"
                      }`}
                      aria-label="Next"
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
                <div className="relative overflow-hidden rounded-xl">
                  <div
                    className={`pointer-events-none absolute inset-y-0 z-10 w-8 bg-gradient-to-r from-luxury-black to-transparent${isRTL ? " right-0 rotate-180" : " left-0"}`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-y-0 z-10 w-8 bg-gradient-to-l from-luxury-black to-transparent${isRTL ? " left-0 rotate-180" : " right-0"}`}
                  />

                  <div
                    ref={thumbStripRef}
                    className={`flex gap-2.5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 rounded-xl border border-luxury-border/20 bg-luxury-gray/15 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden${isRTL ? " flex-row-reverse" : ""}`}
                  >
                    {car.images.map((img, i) => (
                      <div
                        key={img.id}
                        data-thumb-index={i}
                        className="group relative shrink-0 snap-center w-24 sm:w-28 aspect-[4/3]"
                      >
                        <button
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`relative w-full h-full overflow-hidden rounded-lg transition-all duration-200 ${
                            activeImage === i
                              ? "border-2 border-gold opacity-100 shadow-[0_0_16px_rgba(212,175,55,0.2)]"
                              : "border border-luxury-border/30 opacity-55 hover:opacity-90 hover:border-gold/40"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={`${car.name} ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeleteImageId(img.id)}
                            className={`absolute top-1.5 right-1.5 ${thumbDeleteBtn}`}
                            aria-label="Delete image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className={`min-w-0 space-y-6${isRTL ? " text-right" : ""}`}>
              <div
                className={`flex flex-wrap items-center gap-2${isRTL ? " flex-row-reverse" : ""}`}
              >
                <Badge variant="category">{categoryLabel}</Badge>
                <Badge variant="condition">
                  {car.condition === "new"
                    ? locale === "ar" ? "جديدة" : "New"
                    : locale === "ar" ? "مستعملة" : "Used"}
                </Badge>
                {car.sold ? (
                  <Badge variant="sold">
                    {locale === "ar" ? "مباعة" : "Sold"}
                  </Badge>
                ) : (
                  <Badge variant="available" dot>
                    {t("available")}
                  </Badge>
                )}
                {car.featured && (
                  <Badge variant="featured">
                    <Sparkles className="h-3 w-3" />
                    {locale === "ar" ? "مميزة" : "Featured"}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-xs tracking-[0.3em] uppercase text-cream/40 mb-1">
                  {car.brand}
                </p>
                <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-cream leading-tight">
                  {car.name}
                </h1>
              </div>

              {car.description && (
                <p className="text-cream/50 text-sm leading-relaxed border-l-2 border-gold/30 pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                  {car.description}
                </p>
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
                        className="rounded-xl border border-luxury-border/25 bg-luxury-gray/25 p-3 space-y-1.5"
                      >
                        <div
                          className={`flex items-center gap-1.5 text-gold/70${isRTL ? " flex-row-reverse" : ""}`}
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-[10px] tracking-widest uppercase text-cream/35">
                            {spec.label}
                          </span>
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
                className={`flex flex-col sm:flex-row gap-3 pt-2 border-t border-luxury-border/30${isRTL ? " sm:flex-row-reverse" : ""}`}
              >
                <Link href={`/booking?car=${car.id}`} className="flex-1">
                  <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={car.sold}
                  >
                    {t("bookNow")}
                  </Button>
                </Link>
                {isAdmin && !car.sold && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    disabled={markingSold}
                    onClick={async () => {
                      if (
                        !window.confirm(
                          locale === "ar"
                            ? "تأكيد وضع علامة مباعة على هذه السيارة؟"
                            : "Mark this vehicle as sold?",
                        )
                      )
                        return;
                      setMarkingSold(true);
                      await adminMarkCarSold(car.id);
                      await refreshCarData();
                      setMarkingSold(false);
                    }}
                  >
                    {markingSold
                      ? "..."
                      : locale === "ar"
                        ? "وضع علامة مباعة"
                        : "Mark as Sold"}
                  </Button>
                )}
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
