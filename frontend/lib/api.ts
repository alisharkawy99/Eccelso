import axios, { AxiosError } from 'axios';
import { Car, BookingInquiry, ContactMessage } from '@/types';

// ─── Configuration ──────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Helper to handle API errors consistently.
 * Logs the error and returns a fallback value.
 */
async function safeApiCall<T>(apiPromise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await apiPromise;
  } catch (error) {
    const err = error as AxiosError;
    console.error(`[API Error] ${err.config?.url}:`, err.message);
    return fallback;
  }
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getCars(): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars/').then((res) => res.data);
  return safeApiCall(request, []);
}

export async function getFeaturedCars(): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars/', {
    params: { featured: true }
  }).then((res) => res.data);
  return safeApiCall(request, []);
}

export async function getCarById(id: string): Promise<Car | null> {
  const request = apiClient.get<Car>(`/cars/${id}`).then((res) => res.data);
  return safeApiCall(request, null);
}

export async function getCarsByCategory(category: string): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars/', {
    params: { car_category:category }
  }).then((res) => res.data);
  
  return safeApiCall(request, []);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function submitBooking(inquiry: BookingInquiry): Promise<{ success: boolean; id: string }> {
  const request = apiClient.post<{ success: boolean; id: string }>('/bookings/', inquiry).then((res) => res.data);
  return safeApiCall(request, { success: false, id: '' });
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function submitContactMessage(message: ContactMessage): Promise<{ success: boolean }> {
  const request = apiClient.post<{ success: boolean }>('/contact/', message).then((res) => res.data);
  return safeApiCall(request, { success: false });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminAddCar(car: Omit<Car, 'id'>): Promise<Car | null> {
  const request = apiClient.post<Car>('/cars/', car).then((res) => res.data);
  return safeApiCall(request, null);
}

export async function adminUpdateCar(id: string, updates: Partial<Car>): Promise<Car | null> {
  const request = apiClient.patch<Car>(`/cars/${id}`, updates).then((res) => res.data);
  return safeApiCall(request, null);
}

export async function adminDeleteCar(id: string): Promise<{ success: boolean }> {
  const request = apiClient.delete<{ success: boolean }>(`/cars/${id}`).then((res) => res.data);
  return safeApiCall(request, { success: false });
}