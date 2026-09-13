import type { DayPlan, DayRecord, PlanProjection, Product } from "./types";

export function remainingForItem(initialStock: number, sold: number): number {
  return Math.max(0, initialStock - sold);
}

export function dayRevenue(day: DayRecord): number {
  return day.items.reduce((sum, item) => sum + item.sold * item.price, 0);
}

export function dayUnitsSold(day: DayRecord): number {
  return day.items.reduce((sum, item) => sum + item.sold, 0);
}

export function latestDayBefore(days: DayRecord[], targetDate: string): DayRecord | undefined {
  return days
    .filter((day) => day.date < targetDate)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function projectPlan(
  products: Product[],
  days: DayRecord[],
  plan: DayPlan | undefined,
  targetDate: string,
): PlanProjection {
  const sourceDay = latestDayBefore(days, targetDate);
  const sourceByProduct = new Map(
    sourceDay?.items.map((item) => [item.productId, item]) ?? [],
  );
  const additions = new Map(plan?.items.map((item) => [item.productId, item.addedStock]) ?? []);

  return {
    date: targetDate,
    inheritance: sourceDay?.status === "open" ? "estimated" : "confirmed",
    sourceDay,
    items: products
      .filter((product) => product.active)
      .map((product) => {
        const source = sourceByProduct.get(product.id);
        const previousStock = source
          ? remainingForItem(source.initialStock, source.sold)
          : 0;
        const addedStock = Math.max(0, additions.get(product.id) ?? 0);
        return {
          productId: product.id,
          productName: product.name,
          price: product.price,
          previousStock,
          addedStock,
          plannedStock: previousStock + addedStock,
        };
      }),
  };
}

export function plannedInitialStock(
  products: Product[],
  days: DayRecord[],
  plan: DayPlan,
): Record<string, number> {
  const projection = projectPlan(products, days, plan, plan.date);
  return Object.fromEntries(
    projection.items.map((item) => [item.productId, item.plannedStock]),
  );
}
