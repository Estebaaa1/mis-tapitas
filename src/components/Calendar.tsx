import { calendarCells, monthTitle } from "../lib/dateUtils";

type CalendarProps = {
  month: string;
  today: string;
  selectedDate: string;
  planDates: Set<string>;
  closedDates: Set<string>;
  onSelect: (date: string) => void;
  onPrevious: () => void;
  onNext: () => void;
};

const weekdays = ["LU", "MA", "MI", "JU", "VI", "SÁ", "DO"];

export function Calendar({
  month,
  today,
  selectedDate,
  planDates,
  closedDates,
  onSelect,
  onPrevious,
  onNext,
}: CalendarProps) {
  return (
    <section className="calendar-card">
      <div className="calendar-header">
        <button className="icon-button" type="button" onClick={onPrevious} aria-label="Mes anterior">
          ‹
        </button>
        <h2>{monthTitle(month)}</h2>
        <button className="icon-button" type="button" onClick={onNext} aria-label="Mes siguiente">
          ›
        </button>
      </div>
      <div className="calendar-weekdays">
        {weekdays.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {calendarCells(month).map((cell) => {
          const isToday = cell.date === today;
          const isSelected = cell.date === selectedDate;
          const hasPlan = planDates.has(cell.date);
          const isClosed = closedDates.has(cell.date);
          return (
            <button
              type="button"
              key={cell.date}
              onClick={() => onSelect(cell.date)}
              className={[
                "calendar-day",
                !cell.inCurrentMonth ? "muted" : "",
                isToday ? "today" : "",
                isSelected ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={cell.date}
            >
              <span>{cell.day}</span>
              <span className="calendar-markers" aria-hidden="true">
                {isClosed ? <i className="calendar-check">✓</i> : hasPlan ? <i className="calendar-dot" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="calendar-legend">
        <span><i className="calendar-dot" /> Planificado</span>
        <span><i className="calendar-check">✓</i> Cerrado</span>
      </div>
    </section>
  );
}
