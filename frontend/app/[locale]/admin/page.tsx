'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Car, CarCategory } from '@/types';
import {
  adminGetCars,
  adminAddCar,
  adminUpdateCar,
  adminDeleteCar,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS } from '@/types';
import { Plus, Pencil, Trash2, LogOut, Lock, X } from 'lucide-react';
import Image from 'next/image';

const ADMIN_PASSWORD = 'eccelso2024';

type CarFormData = {
  name: string;
  brand: string;
  category: CarCategory;
  imageUrl: string;
  engine: string;
  power: string;
  seats: string;
  transmission: string;
  available: boolean;
  featured: boolean;
};

const emptyForm: CarFormData = {
  name: '',
  brand: '',
  category: 'supercar',
  imageUrl: '',
  engine: '',
  power: '',
  seats: '2',
  transmission: 'Automatic',
  available: true,
  featured: false,
};

export default function AdminPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) {
      adminGetCars().then((data) => {
        setCars(data);
        setLoading(false);
      });
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const openAdd = () => {
    setEditingCar(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setForm({
      name: car.name,
      brand: car.brand,
      category: car.category,
      imageUrl: car.images[0]?.url || '',
      engine: car.specs.engine,
      power: car.specs.power,
      seats: String(car.specs.seats),
      transmission: car.specs.transmission,
      available: car.available,
      featured: car.featured,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const carData: Omit<Car, 'id'> = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      images: [],
      specs: {
        engine: form.engine,
        power: form.power,
        seats: Number(form.seats),
        transmission: form.transmission,
      },
      available: form.available,
      featured: form.featured,
    };

    if (editingCar) {
      const updated = await adminUpdateCar(editingCar.id, {
        name: carData.name,
        brand: carData.brand,
        category: carData.category,
        specs: carData.specs,
        available: carData.available,
        featured: carData.featured,
      });
      if (updated) {
        setCars((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      }
    } else {
      const newCar = await adminAddCar(carData);
      if (newCar) {
        setCars((prev) => [newCar, ...prev]);
      }
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('confirmDelete'))) return;
    setDeletingId(id);
    await adminDeleteCar(id);
    setCars((prev) => prev.filter((c) => c.id !== id));
    setDeletingId(null);
  };

  // ── Login Gate ────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm card-glass p-8 space-y-6 text-center"
        >
          <Lock className="w-10 h-10 text-gold mx-auto" />
          <div>
            <h1 className="font-playfair text-2xl font-bold text-cream">{t('title')}</h1>
            <p className="text-xs text-cream/40 mt-1 tracking-wide">{t('noDescription')}</p>
          </div>
          <div className="divider-gold" />
          <div className="space-y-2 text-left">
            <label className="block text-xs tracking-widest uppercase text-cream/60">
              {t('password')}
            </label>
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              required
            />
            {passwordError && (
              <p className="text-xs text-red-400">{t('wrongPassword')}</p>
            )}
          </div>
          <Button type="submit" variant="gold" className="w-full">
            {t('login')}
          </Button>
        </form>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <>
      <div className="pt-20 min-h-screen bg-luxury-black">
        {/* Header */}
        <div className="bg-luxury-dark border-b border-luxury-border/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className={`font-playfair text-2xl font-bold text-cream${isRTL ? ' text-right' : ''}`}>
                {t('title')}
              </h1>
              <p className="text-xs text-cream/40 tracking-wide mt-0.5">{t('noDescription')}</p>
            </div>
            <div className={`flex items-center gap-3${isRTL ? ' flex-row-reverse' : ''}`}>
              <Button onClick={openAdd} variant="gold" size="sm">
                <Plus className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                {t('addCar')}
              </Button>
              <Button
                onClick={() => setAuthenticated(false)}
                variant="ghost"
                size="sm"
                className="text-cream/40"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-luxury-gray animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-luxury-border/30">
                    {[t('tableImage'), 'Name', t('category'), t('tableStatus'), t('actions')].map(
                      (h) => (
                        <th
                          key={h}
                          className={`py-3 px-3 text-left text-xs tracking-widest uppercase text-cream/40 font-normal${isRTL ? ' text-right' : ''}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr
                      key={car.id}
                      className="border-b border-luxury-border/10 hover:bg-luxury-gray/30 transition-colors"
                    >
                      {/* Image */}
                      <td className="py-3 px-3">
                        <div className="w-14 h-10 relative bg-luxury-gray overflow-hidden flex-shrink-0">
                          {car.images[0]?.url && (
                            <Image
                              src={car.images[0].url}
                              alt={car.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          )}
                        </div>
                      </td>
                      {/* Name */}
                      <td className={`py-3 px-3${isRTL ? ' text-right' : ''}`}>
                        <p className="font-medium text-cream">{car.name}</p>
                        <p className="text-xs text-cream/40">{car.brand}</p>
                      </td>
                      {/* Category */}
                      <td className="py-3 px-3">
                        <Badge variant="category" size="sm">
                          {CATEGORY_LABELS[car.category][locale as 'en' | 'ar']}
                        </Badge>
                      </td>
                      {/* Status */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            variant={car.sold ? 'sold' : car.available ? 'available' : 'dark'}
                            size="sm"
                            dot={!car.sold && car.available}
                          >
                            {car.sold
                              ? locale === 'ar' ? 'مباعة' : 'Sold'
                              : car.available
                                ? t('available')
                                : 'Off'}
                          </Badge>
                          {car.featured && (
                            <Badge variant="featured" size="sm">
                              ★ Featured
                            </Badge>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="py-3 px-3">
                        <div className={`flex items-center gap-2${isRTL ? ' flex-row-reverse' : ''}`}>
                          <button
                            onClick={() => openEdit(car)}
                            className="p-1.5 text-cream/40 hover:text-gold transition-colors"
                            title={t('editCar')}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(car.id)}
                            disabled={deletingId === car.id}
                            className="p-1.5 text-cream/40 hover:text-red-400 transition-colors disabled:opacity-30"
                            title={t('deleteCar')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cars.length === 0 && (
                <div className="text-center py-16 text-cream/30 text-sm">
                  {locale === 'ar' ? 'لا توجد سيارات بعد' : 'No cars yet'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-luxury-black/90 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-luxury-dark border border-luxury-border w-full max-w-xl my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-border/30">
              <h2 className="font-playfair text-lg font-semibold text-cream">
                {editingCar ? t('editCar') : t('addCar')}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-cream/40 hover:text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="form-scroll px-6 py-5 space-y-4 max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('name')} *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('brand')} *</label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs tracking-wider uppercase text-cream/50">{t('category')} *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as CarCategory }))}
                  className="flex h-10 w-full bg-luxury-gray border border-luxury-border px-3 py-2 text-sm text-cream focus:outline-none focus:border-gold rounded-none"
                >
                  <option value="supercar">Supercar</option>
                  <option value="luxury_sedan">Luxury Sedan</option>
                  <option value="sports">Sports</option>
                  <option value="premium_suv">Premium SUV</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs tracking-wider uppercase text-cream/50">{t('imageUrl')}</label>
                <Input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('engine')} *</label>
                  <Input
                    value={form.engine}
                    onChange={(e) => setForm((p) => ({ ...p, engine: e.target.value }))}
                    placeholder="3.9L Twin-Turbo V8"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('power')} *</label>
                  <Input
                    value={form.power}
                    onChange={(e) => setForm((p) => ({ ...p, power: e.target.value }))}
                    placeholder="660 hp"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('seats')} *</label>
                  <Input
                    type="number"
                    value={form.seats}
                    onChange={(e) => setForm((p) => ({ ...p, seats: e.target.value }))}
                    min="1"
                    max="9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs tracking-wider uppercase text-cream/50">{t('transmission')} *</label>
                  <Input
                    value={form.transmission}
                    onChange={(e) => setForm((p) => ({ ...p, transmission: e.target.value }))}
                    placeholder="7-Speed DCT"
                    required
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm((p) => ({ ...p, available: e.target.checked }))}
                    className="w-4 h-4 accent-[#c9a84c]"
                  />
                  <span className="text-xs tracking-wider uppercase text-cream/60">{t('available')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="w-4 h-4 accent-[#c9a84c]"
                  />
                  <span className="text-xs tracking-wider uppercase text-cream/60">{t('featured')}</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="gold" disabled={saving} className="flex-1">
                  {saving ? '...' : t('save')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
