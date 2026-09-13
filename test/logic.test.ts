import { projectPlan, remainingForItem } from "../src/lib/planning";
import type { DayPlan, DayRecord, Product } from "../src/lib/types";

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

const products: Product[] = [
  { id: "blancas", name: "Blancas", description: "", price: 1000, active: true, createdAt: "" },
  { id: "p52", name: "Plateadas 52", description: "", price: 1200, active: true, createdAt: "" },
  { id: "p42", name: "Plateadas 42", description: "", price: 1000, active: true, createdAt: "" },
];

const openDay: DayRecord = {
  id: "day-1",
  date: "2026-09-12",
  status: "open",
  openedAt: "",
  items: [
    { productId: "blancas", productName: "Blancas", price: 1000, initialStock: 40, sold: 0 },
    { productId: "p52", productName: "Plateadas 52", price: 1200, initialStock: 20, sold: 0 },
    { productId: "p42", productName: "Plateadas 42", price: 1000, initialStock: 15, sold: 0 },
  ],
};

const plan: DayPlan = {
  id: "plan-1",
  date: "2026-09-13",
  status: "planned",
  createdAt: "",
  updatedAt: "",
  items: [
    { productId: "blancas", addedStock: 20 },
    { productId: "p52", addedStock: 10 },
    { productId: "p42", addedStock: 5 },
  ],
};

let projection = projectPlan(products, [openDay], plan, plan.date);
assertEqual(projection.inheritance, "estimated", "La jornada abierta debe producir stock estimado");
assertEqual(projection.items[0].plannedStock, 60, "40 + 20 Blancas");
assertEqual(projection.items[1].plannedStock, 30, "20 + 10 Plateadas 52");
assertEqual(projection.items[2].plannedStock, 20, "15 + 5 Plateadas 42");

const soldFive: DayRecord = {
  ...openDay,
  items: openDay.items.map((item) => item.productId === "blancas" ? { ...item, sold: 5 } : item),
};
projection = projectPlan(products, [soldFive], plan, plan.date);
assertEqual(projection.items[0].previousStock, 35, "El stock heredado debe reaccionar a las ventas");
assertEqual(projection.items[0].plannedStock, 55, "35 + 20 Blancas tras vender 5");

const closedDay: DayRecord = { ...soldFive, status: "closed", closedAt: "" };
projection = projectPlan(products, [closedDay], plan, plan.date);
assertEqual(projection.inheritance, "confirmed", "Al cerrar, el stock debe quedar confirmado");
assertEqual(projection.items[0].plannedStock, 55, "El stock confirmado conserva el cálculo correcto");
assertEqual(remainingForItem(10, 12), 0, "El stock nunca debe ser negativo");

console.log("✓ Todas las pruebas de lógica pasaron");
