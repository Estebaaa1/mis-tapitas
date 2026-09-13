import { createId } from "./id";
import type { DayPlan, DayRecord, Product } from "./types";

const KEYS = {
  products: "mis-tapitas:products:v1",
  days: "mis-tapitas:days:v1",
  plans: "mis-tapitas:plans:v1",
  devDate: "mis-tapitas:dev-date:v1",
} as const;

const STARTER_PRODUCTS: Product[] = [
  {
    id: "blancas",
    name: "Blancas",
    description: "Tapitas transparentes Blancas",
    price: 1000,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "plateadas-52",
    name: "Plateadas 52",
    description: "Tapitas de aluminio Plateadas 52",
    price: 1200,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "plateadas-42",
    name: "Plateadas 42",
    description: "Tapitas de aluminio Plateadas 42",
    price: 1000,
    active: true,
    createdAt: "2026-09-01T00:00:00.000Z",
  },
];

const hasLocalStorage = () => typeof window !== "undefined" && !!window.localStorage;

function read<T>(key: string, fallback: T): T {
  if (!hasLocalStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!hasLocalStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function getProducts(): Product[] {
  const products = read<Product[]>(KEYS.products, []);
  if (products.length > 0) return products;
  write(KEYS.products, STARTER_PRODUCTS);
  return STARTER_PRODUCTS;
}

function saveProducts(products: Product[]): void {
  write(KEYS.products, products);
}

function addProduct(input: { name: string; description?: string; price: number }): Product {
  const product: Product = {
    id: createId("product"),
    name: input.name.trim(),
    description: input.description?.trim() || input.name.trim(),
    price: Math.max(0, Math.round(input.price)),
    active: true,
    createdAt: new Date().toISOString(),
  };
  saveProducts([...getProducts(), product]);
  return product;
}

function getDays(): DayRecord[] {
  return read<DayRecord[]>(KEYS.days, []);
}

function getDay(date: string): DayRecord | undefined {
  return getDays().find((day) => day.date === date);
}

function saveDay(day: DayRecord): void {
  const days = getDays();
  const index = days.findIndex((item) => item.date === day.date);
  if (index >= 0) days[index] = day;
  else days.push(day);
  write(KEYS.days, days.sort((a, b) => a.date.localeCompare(b.date)));
}

function getPlans(): DayPlan[] {
  return read<DayPlan[]>(KEYS.plans, []);
}

function getPlan(date: string): DayPlan | undefined {
  return getPlans().find((plan) => plan.date === date);
}

function savePlan(plan: DayPlan): void {
  const plans = getPlans();
  const index = plans.findIndex((item) => item.date === plan.date);
  if (index >= 0) plans[index] = plan;
  else plans.push(plan);
  write(KEYS.plans, plans.sort((a, b) => a.date.localeCompare(b.date)));
}

function getDevDate(): string | undefined {
  if (!hasLocalStorage()) return undefined;
  return window.localStorage.getItem(KEYS.devDate) || undefined;
}

function setDevDate(value?: string): void {
  if (!hasLocalStorage()) return;
  if (value) window.localStorage.setItem(KEYS.devDate, value);
  else window.localStorage.removeItem(KEYS.devDate);
}

export const storage = {
  getProducts,
  saveProducts,
  addProduct,
  getDays,
  getDay,
  saveDay,
  getPlans,
  getPlan,
  savePlan,
  getDevDate,
  setDevDate,
};
