const pad = (value: number) => String(value).padStart(2, "0");

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function systemTodayISO(): string {
  return toISODate(new Date());
}

export function fromISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(value: string, amount: number): string {
  const date = fromISODate(value);
  date.setDate(date.getDate() + amount);
  return toISODate(date);
}

export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function firstOfMonth(value: string): string {
  const date = fromISODate(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}

export function moveMonth(value: string, amount: number): string {
  const date = fromISODate(firstOfMonth(value));
  date.setMonth(date.getMonth() + amount);
  return firstOfMonth(toISODate(date));
}

export function monthTitle(value: string): string {
  const label = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(fromISODate(firstOfMonth(value)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatLongDate(value: string): string {
  const label = new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fromISODate(value));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(fromISODate(value));
}

export type CalendarCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
};

export function calendarCells(monthValue: string): CalendarCell[] {
  const first = fromISODate(firstOfMonth(monthValue));
  const year = first.getFullYear();
  const month = first.getMonth();
  const jsWeekday = first.getDay();
  const mondayOffset = (jsWeekday + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset, 12, 0, 0, 0);
  const cells: CalendarCell[] = [];

  for (let index = 0; index < 42; index += 1) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    cells.push({
      date: toISODate(current),
      day: current.getDate(),
      inCurrentMonth: current.getMonth() === month,
    });
  }

  return cells;
}
