import { useEffect, useMemo, useState } from "react";
import { addDays, compareDates, firstOfMonth, formatLongDate, moveMonth } from "../lib/dateUtils";
import { createId } from "../lib/id";
import { dayRevenue, dayUnitsSold, projectPlan, remainingForItem } from "../lib/planning";
import { storage } from "../lib/storage";
import type { DayPlan, DayRecord, Product } from "../lib/types";
import { Calendar } from "./Calendar";
import { NuevoProducto } from "./NuevoProducto";
import { Stepper } from "./Stepper";

type PlanificarProps = {
  today: string;
  products: Product[];
  days: DayRecord[];
  plans: DayPlan[];
  onChange: () => void;
};

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function Planificar({ today, products, days, plans, onChange }: PlanificarProps) {
  const [month, setMonth] = useState(firstOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(addDays(today, 1));
  const [additions, setAdditions] = useState<Record<string, number>>({});

  const selectedPlan = plans.find((plan) => plan.date === selectedDate);
  const selectedDay = days.find((day) => day.date === selectedDate);
  const projection = useMemo(
    () => projectPlan(products, days, selectedPlan, selectedDate),
    [products, days, selectedPlan, selectedDate],
  );

  useEffect(() => {
    setMonth(firstOfMonth(today));
    setSelectedDate(addDays(today, 1));
  }, [today]);

  useEffect(() => {
    const next: Record<string, number> = {};
    for (const product of products.filter((item) => item.active)) {
      next[product.id] = selectedPlan?.items.find((item) => item.productId === product.id)?.addedStock ?? 0;
    }
    setAdditions(next);
  }, [selectedDate, selectedPlan, products]);

  const savePlan = () => {
    if (compareDates(selectedDate, today) <= 0 || selectedDay?.status === "closed") return;
    const now = new Date().toISOString();
    const plan: DayPlan = {
      id: selectedPlan?.id ?? createId("plan"),
      date: selectedDate,
      status: selectedPlan?.status ?? "planned",
      items: products
        .filter((product) => product.active)
        .map((product) => ({
          productId: product.id,
          addedStock: Math.max(0, additions[product.id] ?? 0),
        })),
      createdAt: selectedPlan?.createdAt ?? now,
      updatedAt: now,
    };
    storage.savePlan(plan);
    onChange();
  };

  const planDates = new Set(plans.map((plan) => plan.date));
  const closedDates = new Set(days.filter((day) => day.status === "closed").map((day) => day.date));
  const selectedIsPast = compareDates(selectedDate, today) < 0;
  const selectedIsToday = selectedDate === today;

  const liveProjectionItems = projection.items.map((item) => {
    const addedStock = Math.max(0, additions[item.productId] ?? 0);
    return { ...item, addedStock, plannedStock: item.previousStock + addedStock };
  });

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">PLANIFICA TUS DÍAS</p>
        <h1>Prepara mañana hoy</h1>
        <p>El stock que te quede se hereda automáticamente y tú solo agregas lo nuevo.</p>
      </section>

      <Calendar
        month={month}
        today={today}
        selectedDate={selectedDate}
        planDates={planDates}
        closedDates={closedDates}
        onSelect={setSelectedDate}
        onPrevious={() => setMonth((value) => moveMonth(value, -1))}
        onNext={() => setMonth((value) => moveMonth(value, 1))}
      />

      <section className="planning-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">DÍA SELECCIONADO</p>
            <h2>{formatLongDate(selectedDate)}</h2>
          </div>
          {selectedPlan && <span className="status-pill status-pill--planned">Planificado</span>}
        </div>

        {selectedDay?.status === "closed" ? (
          <div className="closed-review">
            <div className="metrics-grid">
              <div className="metric-card"><span>Venta total</span><strong>{currency.format(dayRevenue(selectedDay))}</strong></div>
              <div className="metric-card"><span>Vendidas</span><strong>{dayUnitsSold(selectedDay)}</strong></div>
            </div>
            {selectedDay.items.map((item) => (
              <div className="stock-line" key={item.productId}>
                <div><strong>{item.productName}</strong><span>Vendidas: {item.sold}</span></div>
                <strong>{remainingForItem(item.initialStock, item.sold)} restantes</strong>
              </div>
            ))}
            <p className="notice">Esta jornada está cerrada. Puedes revisarla, pero no modificar su planificación.</p>
          </div>
        ) : selectedIsPast ? (
          <p className="notice">No hay una jornada cerrada para esta fecha.</p>
        ) : selectedIsToday ? (
          <p className="notice">La planificación se prepara para días futuros. Para hoy usa la sección Mi día.</p>
        ) : (
          <>
            <div className="inheritance-banner">
              <div>
                <span>Stock heredado</span>
                <strong>{projection.inheritance === "estimated" ? "Estimado" : "Confirmado"}</strong>
              </div>
              <p>
                {projection.sourceDay
                  ? projection.inheritance === "estimated"
                    ? "Se actualizará mientras sigas vendiendo en tu jornada actual."
                    : `Tomado del cierre del ${projection.sourceDay.date}.`
                  : "Aún no hay una jornada anterior; el stock heredado parte en 0."}
              </p>
            </div>

            <div className="product-list">
              {liveProjectionItems.map((item) => (
                <article className="plan-card" key={item.productId}>
                  <div className="product-card-head">
                    <div>
                      <p className="product-name">{item.productName}</p>
                      <span className="muted-text">{currency.format(item.price)} / unidad</span>
                    </div>
                    <span className={`status-pill ${projection.inheritance === "estimated" ? "status-pill--estimated" : "status-pill--confirmed"}`}>
                      {projection.inheritance === "estimated" ? "Estimado" : "Confirmado"}
                    </span>
                  </div>
                  <div className="plan-math">
                    <div><span>Stock anterior</span><strong>{item.previousStock}</strong></div>
                    <div className="plan-add-row">
                      <span>Agregar</span>
                      <Stepper
                        compact
                        value={additions[item.productId] ?? 0}
                        onChange={(value) => setAdditions((current) => ({ ...current, [item.productId]: value }))}
                      />
                    </div>
                    <div className="plan-total"><span>Stock planificado</span><strong>{item.plannedStock}</strong></div>
                  </div>
                </article>
              ))}
            </div>

            <NuevoProducto onCreated={onChange} />
            <button className="button button--primary button--full button--large" type="button" onClick={savePlan}>
              {selectedPlan ? "Actualizar planificación" : "Guardar planificación"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}
