export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  createdAt: string;
};

export type DayItem = {
  productId: string;
  productName: string;
  price: number;
  initialStock: number;
  sold: number;
};

export type DayRecord = {
  id: string;
  date: string;
  status: "open" | "closed";
  openedAt: string;
  closedAt?: string;
  items: DayItem[];
};

export type PlanItem = {
  productId: string;
  addedStock: number;
};

export type DayPlan = {
  id: string;
  date: string;
  status: "planned" | "started" | "completed";
  items: PlanItem[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectedPlanItem = {
  productId: string;
  productName: string;
  price: number;
  previousStock: number;
  addedStock: number;
  plannedStock: number;
};

export type PlanProjection = {
  date: string;
  inheritance: "estimated" | "confirmed";
  sourceDay?: DayRecord;
  items: ProjectedPlanItem[];
};
