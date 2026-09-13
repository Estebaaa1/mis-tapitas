import { useState } from "react";
import { DevDateSwitcher } from "./components/DevDateSwitcher";
import { MiDia } from "./components/MiDia";
import { MisCierres } from "./components/MisCierres";
import { Nav, type TabKey } from "./components/Nav";
import { Planificar } from "./components/Planificar";
import { systemTodayISO } from "./lib/dateUtils";
import { storage } from "./lib/storage";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dia");
  const [, setRevision] = useState(0);
  const refresh = () => setRevision((value) => value + 1);

  const today = storage.getDevDate() ?? systemTodayISO();
  const products = storage.getProducts();
  const days = storage.getDays();
  const plans = storage.getPlans();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="brand-kicker">MIS TAPITAS</span>
          <h1>Mi cuaderno de ventas</h1>
        </div>
        <div className="cloud-badge" title="Persistencia local en esta versión">
          <span className="cloud-dot" /> Guardado local
        </div>
      </header>

      <Nav active={activeTab} onChange={setActiveTab} />

      <main className="app-main">
        {activeTab === "dia" && (
          <MiDia today={today} products={products} days={days} plans={plans} onChange={refresh} />
        )}
        {activeTab === "planificar" && (
          <Planificar today={today} products={products} days={days} plans={plans} onChange={refresh} />
        )}
        {activeTab === "cierres" && <MisCierres days={days} />}
      </main>

      <DevDateSwitcher today={today} onChange={refresh} />
    </div>
  );
}
