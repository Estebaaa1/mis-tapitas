import { useState, type ChangeEvent, type FormEvent } from "react";
import { storage } from "../lib/storage";

type NuevoProductoProps = {
  onCreated: () => void;
};

export function NuevoProducto({ onCreated }: NuevoProductoProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const numericPrice = Number(price);
    if (!name.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) return;
    storage.addProduct({ name, description, price: numericPrice });
    setName("");
    setDescription("");
    setPrice("");
    setOpen(false);
    onCreated();
  };

  if (!open) {
    return (
      <button className="button button--secondary button--full" type="button" onClick={() => setOpen(true)}>
        + Nuevo producto
      </button>
    );
  }

  return (
    <form className="new-product-card" onSubmit={submit}>
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">NUEVO PRODUCTO</p>
          <h3>Agregar a mi cuaderno</h3>
        </div>
        <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
          ×
        </button>
      </div>
      <label>
        Nombre
        <input value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} placeholder="Ej. Doradas" required />
      </label>
      <label>
        Descripción
        <input value={description} onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)} placeholder="Opcional" />
      </label>
      <label>
        Precio por unidad
        <input
          value={price}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPrice(event.target.value)}
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          placeholder="1000"
          required
        />
      </label>
      <button className="button button--primary button--full" type="submit">
        Guardar producto
      </button>
    </form>
  );
}
