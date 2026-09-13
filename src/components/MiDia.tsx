import { useEffect, useMemo, useState } from "react";
import { formatLongDate } from "../lib/dateUtils";
import { createId } from "../lib/id";
import { dayRevenue, dayUnitsSold, projectPlan, remainingForItem } from "../lib/planning";
import { storage } from "../lib/storage";
import type { DayPlan, DayRecord, Product } from "../lib/types";
import { NuevoProducto } from "./NuevoProducto";
import { Stepper } from "./Stepper";

type MiDiaProps = {
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

export function MiDia({ today, products, days, plans, onChange }: MiDiaProps) {
  const day = days.find((item) => item.date === today);
  const plan = plans.find((item) => item.date === today);
  const activeProducts = products.filter((product) => product.active);
  const [draftStock, setDraftStock] = useState<Record<string, number>>({});

  useEffect(() => {
    setDraftStock((current) => {
      const next = { ...current };
      for (const product of activeProducts) {
        if (!(product.id in next)) next[product.id] = 0;
      }
      return next;
    });
  }, [products]);

  const readyProjection = useMemo(
    () => (plan ? projectPlan(products, days, plan, today) : undefined),
    [products, days, plan, today],
  );

  const startManualDay = () => {
    const now = new Date().toISOString();
    const record: DayRecord = {
      id: createId("day"),
      date: today,
      status: "open",
      openedAt: now,
      items: activeProducts.map((product) => ({
        productId: product.id,
        productName: product.name,
        price: product.price,
        initialStock: Math.max(0, draftStock[product.id] ?? 0),
        sold: 0,
      })),
    };
    storage.saveDay(record);
    onChange();
  };

  const startPlannedDay = () => {
    if (!plan || !readyProjection) return;
    const now = new Date().toISOString();
    const record: DayRecord = {
      id: createId("day"),
      date: today,
      status: "open",
      openedAt: now,
      items: readyProjection.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        initialStock: item.plannedStock,
        sold: 0,
      })),
    };
    storage.saveDay(record);
    storage.savePlan({ ...plan, status: "started", updatedAt: now });
    onChange();
  };

  const changeSale = (productId: string, delta: number) => {
    if (!day || day.status !== "open") return;
    const updated: DayRecord = {
      ...day,
      items: day.items.map((item) => {
        if (item.productId !== productId) return item;
        const nextSold = Math.min(item.initialStock, Math.max(0, item.sold + delta));
        return { ...item, sold: nextSold };
      }),
    };
    storage.saveDay(updated);
    onChange();
  };

  const closeDay = () => {
    if (!day || day.status !== "open") return;
    const now = new Date().toISOString();
    storage.saveDay({ ...day, status: "closed", closedAt: now });
    if (plan) storage.savePlan({ ...plan, status: "completed", updatedAt: now });
    onChange();
  };

  if (!day && plan && readyProjection) {
    const total = readyProjection.items.reduce((sum, item) => sum + item.plannedStock, 0);
    return (
      <div className="page-stack">
        <section className="hero-card hero-card--ready">
          <p className="eyebrow">TU DÍA ESTÁ LISTO</p>
          <h1>{formatLongDate(today)}</h1>
          <p>Ya tienes una planificación guardada. No necesitas volver a escribir tu stock.</p>
        </section>

        <section className="summary-card">
          <div className="summary-big-number">{total}</div>
          <span>unidades para comenzar</span>
        </section>

        <div className="product-list">
          {readyProjection.items.map((item) => (
            <article className="product-card" key={item.productId}>
              <div>
                <p className="product-name">{item.productName}</p>
                <span className="muted-text">{currency.format(item.price)} / unidad</span>
              </div>
              <strong className="stock-number">{item.plannedStock}</strong>
            </article>
          ))}
        </div>

        <button className="button button--primary button--full button--large" type="button" onClick={startPlannedDay}>
          Iniciar mi día
        </button>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="page-stack">
        <section className="hero-card">
          <p className="eyebrow">UN NUEVO DÍA</p>
          <h1>Todo listo para vender</h1>
          <p>¿Cuántas tapitas llevas hoy?</p>
          <span className="date-pill">{formatLongDate(today)}</span>
        </section>

        <div className="product-list">
          {activeProducts.map((product) => (
            <article className="product-card product-card--stacked" key={product.id}>
              <div className="product-card-head">
                <div>
                  <p className="product-name">{product.name}</p>
                  <span className="muted-text">{product.description}</span>
                </div>
                <strong>{currency.format(product.price)}</strong>
              </div>
              <div className="stock-control-row">
                <span>Cantidad inicial</span>
                <Stepper
                  value={draftStock[product.id] ?? 0}
                  onChange={(value) => setDraftStock((current) => ({ ...current, [product.id]: value }))}
                />
              </div>
            </article>
          ))}
        </div>

        <NuevoProducto onCreated={onChange} />
        <button className="button button--primary button--full button--large" type="button" onClick={startManualDay}>
          Iniciar mi día
        </button>
      </div>
    );
  }

  if (day.status === "closed") {
    return (
      <div className="page-stack">
        <section className="hero-card hero-card--closed">
          <p className="eyebrow">JORNADA CERRADA</p>
          <h1>{formatLongDate(today)}</h1>
          <p>Este día ya quedó guardado en Mis cierres.</p>
        </section>
        <div className="metrics-grid">
          <div className="metric-card"><span>Venta total</span><strong>{currency.format(dayRevenue(day))}</strong></div>
          <div className="metric-card"><span>Unidades vendidas</span><strong>{dayUnitsSold(day)}</strong></div>
        </div>
        <div className="product-list">
          {day.items.map((item) => (
            <article className="product-card" key={item.productId}>
              <div>
                <p className="product-name">{item.productName}</p>
                <span className="muted-text">Vendidas: {item.sold}</span>
              </div>
              <div className="align-right">
                <strong className="stock-number">{remainingForItem(item.initialStock, item.sold)}</strong>
                <span className="muted-text">restantes</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="hero-card hero-card--active">
        <p className="eyebrow">MI DÍA</p>
        <h1>Jornada en curso</h1>
        <p>{formatLongDate(today)}</p>
      </section>

      <div className="metrics-grid">
        <div className="metric-card"><span>Venta de hoy</span><strong>{currency.format(dayRevenue(day))}</strong></div>
        <div className="metric-card"><span>Vendidas</span><strong>{dayUnitsSold(day)}</strong></div>
      </div>

      <div className="product-list">
        {day.items.map((item) => {
          const remaining = remainingForItem(item.initialStock, item.sold);
          return (
            <article className="sale-card" key={item.productId}>
              <div className="sale-card-head">
                <div>
                  <p className="product-name">{item.productName}</p>
                  <span className="muted-text">{currency.format(item.price)} / unidad</span>
                </div>
                <div className="align-right">
                  <strong className="stock-number">{remaining}</strong>
                  <span className="muted-text">en stock</span>
                </div>
              </div>
              <div className="sale-card-footer">
                <span>Vendidas hoy: <strong>{item.sold}</strong></span>
                <div className="sale-actions">
                  <button type="button" className="button button--ghost" onClick={() => changeSale(item.productId, -1)} disabled={item.sold === 0}>
                    Deshacer
                  </button>
                  <button type="button" className="button button--primary" onClick={() => changeSale(item.productId, 1)} disabled={remaining === 0}>
                    Vender 1
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <button className="button button--danger button--full" type="button" onClick={closeDay}>
        Cerrar jornada
      </button>
    </div>
  );
}
