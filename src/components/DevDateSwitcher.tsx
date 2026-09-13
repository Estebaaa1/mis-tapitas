import { useEffect, useState, type ChangeEvent } from "react";
import { storage } from "../lib/storage";
import { systemTodayISO } from "../lib/dateUtils";

type DevDateSwitcherProps = {
  today: string;
  onChange: () => void;
};

export function DevDateSwitcher({ today, onChange }: DevDateSwitcherProps) {
  const [value, setValue] = useState(today);

  useEffect(() => setValue(today), [today]);

  const apply = () => {
    if (!value) return;
    storage.setDevDate(value);
    onChange();
  };

  const reset = () => {
    storage.setDevDate(undefined);
    setValue(systemTodayISO());
    onChange();
  };

  return (
    <aside className="dev-switcher">
      <div>
        <strong>DEV · fecha de prueba</strong>
        <small>Simula el cambio de día sin esperar.</small>
      </div>
      <div className="dev-controls">
        <input type="date" value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)} />
        <button type="button" onClick={apply}>Usar</button>
        <button type="button" onClick={reset}>Hoy real</button>
      </div>
    </aside>
  );
}
