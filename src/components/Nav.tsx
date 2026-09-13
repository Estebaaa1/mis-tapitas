export type TabKey = "dia" | "planificar" | "cierres";

type NavProps = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabs: { id: TabKey; label: string }[] = [
  { id: "dia", label: "Mi día" },
  { id: "planificar", label: "Planificar" },
  { id: "cierres", label: "Mis cierres" },
];

export function Nav({ active, onChange }: NavProps) {
  return (
    <nav className="nav-tabs" aria-label="Secciones principales">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={active === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
