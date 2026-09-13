# Mis tapitas — versión standalone con Planificar

Reconstrucción funcional de **Mis tapitas** en React + TypeScript + Vite, basada en la interfaz y flujo que ya teníamos y en la especificación generada con Claude.

> Importante: este repositorio no contiene el código fuente original del ChatGPT Site publicado. Es una versión nueva, funcional y editable en GitHub, diseñada para reemplazar esa dependencia.

## Funciones incluidas

- **Mi día**
  - Iniciar jornada con stock.
  - Registrar ventas unidad por unidad.
  - Deshacer ventas.
  - Ver venta total, unidades vendidas y stock restante.
  - Cerrar jornada.

- **Planificar**
  - Calendario mensual.
  - Selección de días futuros.
  - Herencia automática del stock restante.
  - Stock heredado **Estimado** mientras la jornada anterior sigue abierta.
  - Recalculo automático si sigues vendiendo.
  - Stock heredado **Confirmado** al cerrar la jornada anterior.
  - Agregar mercadería nueva para el día siguiente.
  - Fórmula: `stock planificado = stock anterior + stock agregado`.
  - Al llegar el día planificado aparece **TU DÍA ESTÁ LISTO**.

- **Mis cierres**
  - Historial de jornadas cerradas.
  - Ventas, unidades y stock restante por producto.

- **Productos iniciales**
  - Blancas — $1.000
  - Plateadas 52 — $1.200
  - Plateadas 42 — $1.000
  - Se pueden agregar nuevos productos.

- **Persistencia**
  - Todo se guarda en `localStorage`.
  - La capa de persistencia está aislada en `src/lib/storage.ts` para poder reemplazarla después por una base de datos/API.

- **DEV: fecha de prueba**
  - Selector inferior para simular el día siguiente sin esperar 24 horas.

## Ejecutar

Requiere Node.js 18+.

```bash
npm install
npm run dev
```

Luego abre la URL que muestre Vite, normalmente:

```
http://localhost:5173
```

## Pruebas de lógica

```bash
npm run test:logic
```

Las pruebas validan el flujo principal:

1. Jornada con 40 Blancas, 20 Plateadas 52 y 15 Plateadas 42.
2. Planificación de mañana con +20, +10 y +5.
3. Resultado proyectado 60 / 30 / 20.
4. Venta posterior de 5 Blancas.
5. Recalculo automático a 55 / 30 / 20.
6. Cambio de stock heredado de **Estimado** a **Confirmado** al cerrar la jornada.

## Estructura

```
src/
  lib/
    types.ts
    storage.ts
    planning.ts
    dateUtils.ts
    id.ts
  components/
    Nav.tsx
    MiDia.tsx
    Planificar.tsx
    MisCierres.tsx
    Calendar.tsx
    Stepper.tsx
    NuevoProducto.tsx
    DevDateSwitcher.tsx
  App.tsx
  main.tsx
  styles.css

test/
  logic.test.ts
```

## Probar el flujo completo

1. En **Mi día**, inicia con:
   - 40 Blancas
   - 20 Plateadas 52
   - 15 Plateadas 42
2. Ve a **Planificar** y selecciona mañana.
3. Agrega:
   - +20 Blancas
   - +10 Plateadas 52
   - +5 Plateadas 42
4. Guarda. Debe mostrar 60 / 30 / 20.
5. Vuelve a **Mi día** y vende 5 Blancas.
6. Regresa a mañana: debe mostrar 35 heredadas + 20 agregadas = 55 Blancas, con estado **Estimado**.
7. Cierra la jornada.
8. Regresa a **Planificar**: el stock heredado debe quedar **Confirmado**.
9. Usa el selector **DEV** para cambiar a mañana.
10. Ve a **Mi día**: aparecerá **TU DÍA ESTÁ LISTO**.
11. Inicia la jornada y el stock planificado pasa a ser el stock inicial real.

## Migrar a backend

La UI no accede directamente a `localStorage`. Toda la persistencia pasa por:

```
src/lib/storage.ts
```

Para añadir cuentas y sincronización online, reemplaza esa implementación por llamadas a una API o base de datos y agrega un `userId` a productos, jornadas y planificaciones.
