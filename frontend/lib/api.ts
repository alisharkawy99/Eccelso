/**
 * API Abstraction Layer — Eccelso by Sharkawy
 *
 * All data fetching goes through this file.
 * Currently returns dummy data for development.
 *
 * TO INTEGRATE FASTAPI BACKEND:
 *   1. Set NEXT_PUBLIC_API_URL in .env.local  →  NEXT_PUBLIC_API_URL=http://localhost:8000
 *   2. Replace each function body with a fetch() call to the corresponding endpoint.
 *      Example:
 *        export async function getCars(): Promise<Car[]> {
 *          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars`);
 *          if (!res.ok) throw new Error('Failed to fetch cars');
 *          return res.json();
 *        }
 */

import { dummyCars } from '@/data/dummy';
import { Car, BookingInquiry, ContactMessage } from '@/types';

const simulateDelay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getCars(): Promise<Car[]> {
  await simulateDelay();
  // LATER: return fetch(`${API}/cars`).then(r => r.json());
  return [...dummyCars];
}

export async function getFeaturedCars(): Promise<Car[]> {
  await simulateDelay();
  // LATER: return fetch(`${API}/cars?featured=true`).then(r => r.json());
  return dummyCars.filter((car) => car.featured);
}

export async function getCarById(id: string): Promise<Car | null> {
  await simulateDelay();
  // LATER: return fetch(`${API}/cars/${id}`).then(r => r.ok ? r.json() : null);
  return dummyCars.find((car) => car.id === id) ?? null;
}

export async function getCarsByCategory(category: string): Promise<Car[]> {
  await simulateDelay();
  // LATER: return fetch(`${API}/cars?category=${category}`).then(r => r.json());
  if (category === 'all') return [...dummyCars];
  return dummyCars.filter((car) => car.category === category);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function submitBooking(inquiry: BookingInquiry): Promise<{ success: boolean; id: string }> {
  await simulateDelay(800);
  // LATER:
  //   const res = await fetch(`${API}/bookings`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(inquiry),
  //   });
  //   return res.json();
  console.log('[Booking submitted]', inquiry);
  return { success: true, id: `BK-${Date.now()}` };
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function submitContactMessage(message: ContactMessage): Promise<{ success: boolean }> {
  await simulateDelay(600);
  // LATER:
  //   const res = await fetch(`${API}/contact`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(message),
  //   });
  //   return res.json();
  console.log('[Contact message submitted]', message);
  return { success: true };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

let adminCarsStore: Car[] = [...dummyCars];

export async function adminGetCars(): Promise<Car[]> {
  await simulateDelay();
  return [...adminCarsStore];
}

export async function adminAddCar(car: Omit<Car, 'id'>): Promise<Car> {
  await simulateDelay(500);
  // LATER: return fetch(`${API}/admin/cars`, { method: 'POST', ... }).then(r => r.json());
  const newCar: Car = { ...car, id: `${Date.now()}` };
  adminCarsStore = [newCar, ...adminCarsStore];
  return newCar;
}

export async function adminUpdateCar(id: string, updates: Partial<Car>): Promise<Car | null> {
  await simulateDelay(500);
  // LATER: return fetch(`${API}/admin/cars/${id}`, { method: 'PUT', ... }).then(r => r.json());
  const idx = adminCarsStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  adminCarsStore[idx] = { ...adminCarsStore[idx], ...updates };
  return adminCarsStore[idx];
}

export async function adminDeleteCar(id: string): Promise<{ success: boolean }> {
  await simulateDelay(400);
  // LATER: return fetch(`${API}/admin/cars/${id}`, { method: 'DELETE' }).then(r => r.json());
  adminCarsStore = adminCarsStore.filter((c) => c.id !== id);
  return { success: true };
}
