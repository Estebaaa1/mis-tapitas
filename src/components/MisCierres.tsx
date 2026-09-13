import { formatLongDate } from "../lib/dateUtils";
import { dayRevenue, dayUnitsSold, remainingForItem } from "../lib/planning";
import type { DayRecord } from "../lib/types";

type MisCierresProps = {
  days: DayRecord[];
};

const currency = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function MisCierres({ days }: MisCierresProps) {
  const closedDays = days
    .filter((day) => day.status === "closed")
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page-stack">
      <section className="hero-card">
        <p className="eyebrow">MIS CIERRES</p>
        <h1>Tu historial</h1>
        <p>Revisa cuánto vendiste y cuánto stock quedó al terminar cada jornada.</p>
      </section>

      {closedDays.length === 0 ? (
        <section className="empty-state">
          <strong>Aún no tienes cierres</strong>
          <p>Cuando cierres tu primera jornada aparecerá aquí.</p>
        </section>
      ) : (
        closedDays.map((day) => (
          <details className="closure-card" key={day.id}>
            <summary>
              <div>
                <span>{formatLongDate(day.date)}</span>
                <small>{dayUnitsSold(day)} unidades vendidas</small>
              </div>
              <strong>{currency.format(dayRevenue(day))}</strong>
            </summary>
            <div className="closure-details">
              {day.items.map((item) => (
                <div className="stock-line" key={item.productId}>
                  <div>
                    <strong>{item.productName}</strong>
                    <span>Inicial {item.initialStock} · Vendidas {item.sold}</span>
                  </div>
                  <strong>{remainingForItem(item.initialStock, item.sold)} restantes</strong>
                </div>
              ))}
            </div>
          </details>
        ))
      )}
    </div>
  );
}
