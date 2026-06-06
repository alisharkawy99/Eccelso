import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import {
  Car,
  Booking,
  BookingCreate,
  BookingWithUser,
  AdminBookingStats,
  ContactMessage,
} from '@/types';

// ─── Configuration ──────────────────────────────────────────────────────────

export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || '/api';
export const API_BASE_URL = API_PREFIX;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
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

function getApiErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ detail?: string }>;
  return err.response?.data?.detail || err.message || 'Something went wrong';
}

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getCars(): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars').then((res) => res.data);
  return safeApiCall(request, []);
}

export async function getFeaturedCars(): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars', {
    params: { featured: true }
  }).then((res) => res.data);
  return safeApiCall(request, []);
}

export async function getCarById(id: string): Promise<Car | null> {
  const request = apiClient.get<Car>(`/cars/${id}`).then((res) => res.data);
  return safeApiCall(request, null);
}

export async function getCarsByCategory(category: string): Promise<Car[]> {
  const request = apiClient.get<Car[]>('/cars', {
    params: { category }
  }).then((res) => res.data);
  
  return safeApiCall(request, []);
}

export async function adminMarkCarSold(id: string): Promise<Car | null> {
  const request = apiClient.patch<Car>(`/cars/${id}/sold`).then((res) => res.data);
  return safeApiCall(request, null);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data: BookingCreate): Promise<Booking> {
  const response = await apiClient.post<Booking>('/bookings', data);
  return response.data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const request = apiClient.get<Booking[]>('/bookings/me').then((res) => res.data);
  return safeApiCall(request, []);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const request = apiClient.get<Booking>(`/bookings/${id}`).then((res) => res.data);
  return safeApiCall(request, null);
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`);
  return response.data;
}

export async function adminApproveBooking(id: string): Promise<BookingWithUser> {
  const response = await apiClient.patch<BookingWithUser>(`/bookings/${id}/approve`);
  return response.data;
}

export async function adminRejectBooking(id: string): Promise<BookingWithUser> {
  const response = await apiClient.patch<BookingWithUser>(`/bookings/${id}/reject`);
  return response.data;
}

export async function adminMarkBookingSold(id: string): Promise<BookingWithUser> {
  const response = await apiClient.patch<BookingWithUser>(`/bookings/${id}/sold`);
  return response.data;
}

export { getApiErrorMessage };

export async function adminGetBookings(): Promise<BookingWithUser[]> {
  const request = apiClient
    .get<BookingWithUser[]>('/bookings/admin/all')
    .then((res) => res.data);
  return safeApiCall(request, []);
}

export async function adminGetBookingStats(): Promise<AdminBookingStats | null> {
  const request = apiClient
    .get<AdminBookingStats>('/bookings/admin/stats')
    .then((res) => res.data);
  return safeApiCall(request, null);
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function submitContactMessage(message: ContactMessage): Promise<{ success: boolean }> {
  const request = apiClient.post<{ success: boolean }>('/contact', message).then((res) => res.data);
  return safeApiCall(request, { success: false });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminAddCar(car: Omit<Car, 'id'>): Promise<Car | null> {
  const request = apiClient.post<Car>('/cars', car).then((res) => res.data);
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

export async function adminGetCars(): Promise<Car[]> {
  return getCars();
}
