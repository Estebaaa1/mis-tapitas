type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  compact?: boolean;
};

export function Stepper({ value, onChange, min = 0, step = 1, compact = false }: StepperProps) {
  const decrease = () => onChange(Math.max(min, value - step));
  const increase = () => onChange(value + step);

  return (
    <div className={`stepper ${compact ? "stepper--compact" : ""}`}>
      <button type="button" onClick={decrease} aria-label="Restar">
        −
      </button>
      <span>{value}</span>
      <button type="button" onClick={increase} aria-label="Sumar">
        +
      </button>
    </div>
  );
}
