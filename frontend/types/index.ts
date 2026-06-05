export type CarCategory = 'supercar' | 'luxury_sedan' | 'sport' | 'premium_suv' | 'sports';
export type CarCondition = 'new' | 'used';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface CarSpecs {
  engine: string;
  power: string;
  seats: number;
  transmission: string;
}
export interface ICarImages{
  id:string;
  url:string;
  public_id:string
}
export interface Car {
  id: string;
  name: string;
  brand: string;
  category: CarCategory;
  condition?: CarCondition;
  images: ICarImages[];
  specs: CarSpecs;
  available: boolean;
  featured: boolean;
  sold?: boolean;
  sold_at?: string | null;
  description?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  car_id: string | null;
  status: BookingStatus;
  notes?: string | null;
  car_name: string;
  car_brand: string;
  car_image_url?: string | null;
  car_condition: CarCondition;
  created_at: string;
  updated_at?: string | null;
  cancelled_at?: string | null;
  car?: Car | null;
}

export interface BookingWithUser extends Booking {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  };
}

export interface AdminBookingStats {
  total_bookings: number;
  pending_bookings: number;
  approved_bookings: number;
  rejected_bookings: number;
  cancelled_bookings: number;
}

export interface BookingCreate {
  car_id: string;
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
  sport: { en: 'Sports', ar: 'رياضية' },
  sports: { en: 'Sports', ar: 'رياضية' },
  premium_suv: { en: 'Premium SUV', ar: 'SUV فاخرة' },
};
