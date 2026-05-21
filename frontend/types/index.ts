export type CarCategory = 'supercar' | 'luxury_sedan' | 'sports' | 'premium_suv';

export interface CarSpecs {
  engine: string;
  power: string;
  seats: number;
  transmission: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  category: CarCategory;
  pricePerDay: number;
  images: string[];
  specs: CarSpecs;
  available: boolean;
  featured: boolean;
  description?: string;
}

export interface BookingInquiry {
  carId: string;
  startDate: string;
  endDate: string;
  customerName: string;
  phone: string;
  notes?: string;
}

export interface ContactMessage {
  name: string;
  phone: string;
  message: string;
}

export interface AdminCar extends Car {
  createdAt?: string;
  updatedAt?: string;
}

export const CATEGORY_LABELS: Record<CarCategory, { en: string; ar: string }> = {
  supercar: { en: 'Supercar', ar: 'سيارة فائقة' },
  luxury_sedan: { en: 'Luxury Sedan', ar: 'سيدان فاخرة' },
  sports: { en: 'Sports', ar: 'رياضية' },
  premium_suv: { en: 'Premium SUV', ar: 'SUV فاخرة' },
};
