# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Proyecto: ComandaApp MVP
**Versión:** 1.0 | **Fecha:** Febrero 2026 | **Estado:** Listo para desarrollo

---

## 1. Contexto y Objetivo

**Problema:** Los locales gastronómicos pequeños (pubs, bares, restaurantes) en Argentina dependen de comandas en papel o sistemas costosos (+$50.000/mes) que no están adaptados a su escala.

**Solución:** SaaS web responsive (PWA) que permite tomar pedidos desde el celular del cliente vía QR, enviarlos en tiempo real a la cocina y controlar las cuentas por mesa. Todo desde un browser, sin descargas.

**Precio objetivo:** $15.000–$20.000 ARS/mes por local.

**Usuario primario:** Dueño/administrador de local pequeño (10–20 mesas, 2–5 empleados).

---

## 2. Arquitectura Multi-tenant

Cada local que contrata el servicio tiene:

- **Subdominio propio**: `barelpatio.comandaapp.com.ar` o dominio custom (roadmap).
- **Login independiente**: Admin del local accede solo a sus datos, nunca ve otros locales.
- **Customización de marca**: Logo, nombre, colores primarios (fondo/botón), descripción del local.
- **QR propios**: Cada mesa del local tiene QR único que apunta a su menú branded.
- **Datos 100% aislados**: Un local nunca puede ver pedidos, menús ni reportes de otro.

### Modelo Multi-tenant

```
Platform (Super Admin)
└── Tenant (Local/Negocio)
    ├── Users (Admin, Mozo, Cocina)
    ├── Tables (Mesas)
    ├── Menu (Categorías + Items)
    ├── Orders (Pedidos)
    └── Branding (Logo, colores, config)
```

---

## 3. Roles y Permisos

| Rol | Scope | Acceso |
|-----|-------|--------|
| **Super Admin** | Toda la plataforma | Panel SaaS, todos los tenants, métricas globales |
| **Admin Local** | Su tenant | Dashboard, menú, mesas, reportes, branding, suscripción |
| **Mozo** | Su tenant | Vista mesas, agregar pedidos, cerrar cuentas |
| **Cocina** | Su tenant | KDS (pantalla comandas), cambiar estados |
| **Cliente** | Solo su mesa | Menú QR, hacer pedidos, pedir cuenta (sin login) |

---

## 4. Arquitectura Técnica Recomendada

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router) + TailwindCSS, desplegado en Vercel |
| Backend/API | Next.js API Routes o Node.js (Express) separado |
| Base de Datos | PostgreSQL (Supabase) |
| Auth | Supabase Auth (email + Google OAuth) |
| Realtime | Supabase Realtime (WebSockets para comandas) |
| Pagos | MercadoPago SDK (QR dinámico + suscripciones) |
| Deploy | Vercel (frontend) + Supabase (backend/DB) |
| Multi-tenant | Cada local = 1 tenant (schema separado en DB) |

---

## 5. Flujo Principal — Autoservicio QR (Sin mozo en la mesa)

```
Cliente llega a la mesa
        ↓
Escanea QR (pegado en la mesa)
        ↓
Ve menú branded del local (sin login, sin descarga)
        ↓
Arma su pedido y lo envía
        ↓
Comanda aparece en pantalla cocina/barra EN TIEMPO REAL
        ↓
Cocina prepara y marca "Listo"
        ↓
Mozo lleva el pedido a la mesa (notificado por pantalla/push)
        ↓
Cliente puede hacer nuevos pedidos desde el mismo QR
        ↓
Al final solicita la cuenta (botón "Pedir cuenta" en el menú)
        ↓
Mozo cierra la mesa
```

> El mozo **nunca necesita ir a tomar el pedido** — solo entrega y cobra.

---

## 6. Épicas y User Stories

### 🟥 ÉPICA 1: Gestión de Menú (Admin)

**US-01 — Crear categorías de menú**
> Como admin, quiero crear categorías (ej: "Cervezas", "Platos", "Postres") para organizar el menú.

**Criterios de aceptación:**
- El admin puede crear, editar y eliminar categorías desde el dashboard.
- Cada categoría tiene: nombre, icono opcional, orden de visualización.
- No se puede eliminar una categoría con ítems activos (muestra error descriptivo).

---

**US-02 — Crear ítems de menú**
> Como admin, quiero agregar productos al menú con precio, descripción e imagen para que el cliente los vea.

**Criterios de aceptación:**
- Campos: nombre (requerido), descripción, precio (requerido), categoría (requerido), imagen (opcional, max 2MB), disponible (toggle on/off), sector (cocina/barra/ambos).
- Si un ítem está desactivado, no aparece en el menú del cliente.
- Los cambios se reflejan en tiempo real en el menú QR.

---

**US-03 — Reordenar ítems**
> Como admin, quiero reordenar los ítems dentro de cada categoría para destacar lo que más vendo.

**Criterios de aceptación:**
- Drag & drop en dashboard.
- El orden se guarda y se refleja en el menú del cliente.

---

### 🟧 ÉPICA 2: Gestión de Mesas

**US-04 — Configurar mesas**
> Como admin, quiero configurar cuántas mesas tiene mi local y asignarles un nombre/número.

**Criterios de aceptación:**
- Crear hasta 30 mesas con nombre personalizable (ej: "Mesa 5", "Barra 1", "Terraza 2").
- Cada mesa genera automáticamente un QR único descargable (PNG/PDF).
- El PDF incluye el nombre de la mesa debajo del QR.
- Si el local tiene logo, el QR lleva el logo al centro (QR con logo embedded).
- Se puede activar/desactivar una mesa.

---

**US-05 — Ver estado de mesas en tiempo real**
> Como mozo/admin, quiero ver el estado de cada mesa de un vistazo para saber cuáles están ocupadas.

**Criterios de aceptación:**
- Vista tipo grilla de mesas con colores: 🟢 Libre | 🟡 Con pedido pendiente | 🔴 Cuenta solicitada.
- Al tocar una mesa, muestra los pedidos activos y el total acumulado.
- El estado se actualiza automáticamente sin recargar (WebSocket).

---

**US-06 — Abrir y cerrar mesa**
> Como mozo, quiero abrir una mesa al sentarse el cliente y cerrarla al cobrar.

**Criterios de aceptación:**
- Abrir mesa: registra timestamp de inicio.
- Cerrar mesa: requiere confirmar total cobrado (efectivo/tarjeta/QR). Libera la mesa.
- Al cerrar, el historial de pedidos queda en el registro del día.
- No se puede cerrar una mesa con pedidos en estado "pendiente" sin confirmación manual.

---

**US-07 — Solicitar cuenta desde QR**
> Como cliente, quiero pedir la cuenta desde el menú QR sin tener que llamar al mozo.

**Criterios de aceptación:**
- Botón "Pedir la cuenta" visible en el menú QR cuando hay al menos un pedido entregado.
- Al presionarlo, el estado de la mesa cambia a `cuenta_solicitada`.
- El mozo recibe notificación push/web inmediata.
- Se muestra al cliente un resumen de lo consumido con el total.

---

### 🟨 ÉPICA 3: Pedidos desde el Cliente (QR Autoservicio)

**US-08 — Ver menú desde QR**
> Como cliente, quiero escanear el QR de la mesa y ver el menú del local sin instalar nada.

**Criterios de aceptación:**
- El QR redirige a `/{local-slug}/{mesa-id}`.
- Menú responsive, carga en < 3 segundos en 4G.
- Sin login ni registro requerido.
- Muestra categorías, ítems con foto/precio/descripción.
- Ítems desactivados ocultos automáticamente.
- Si la mesa está cerrada: muestra el menú pero bloquea envío de pedidos con mensaje claro.

---

**US-09 — Agregar pedido desde la mesa**
> Como cliente, quiero seleccionar platos y bebidas y enviar el pedido para que llegue a la cocina.

**Criterios de aceptación:**
- Carrito flotante con cantidad total y monto.
- Por ítem: cantidad +/-, nota opcional (ej: "sin cebolla").
- Botón "Enviar pedido" → confirmación con resumen antes de confirmar.
- Al confirmar: comanda creada en DB y aparece en cocina en tiempo real (< 2 segundos).
- El cliente ve pantalla de confirmación con estado: "Tu pedido fue recibido ✅".
- El cliente puede hacer múltiples pedidos durante la sesión de mesa.

---

**US-10 — Ver estado del pedido**
> Como cliente, quiero saber si mi pedido ya está siendo preparado o está listo.

**Criterios de aceptación:**
- Pantalla de estado accesible desde el QR mientras la mesa esté abierta.
- Estados visibles: Recibido → En preparación → Listo para entregar → Entregado.
- Si hay múltiples pedidos, muestra el estado de cada uno.

---

### 🟦 ÉPICA 4: Pantalla de Cocina (KDS — Kitchen Display System)

**US-11 — Ver comandas en tiempo real**
> Como cocinero, quiero ver en pantalla todos los pedidos nuevos en tiempo real para empezar a prepararlos.

**Criterios de aceptación:**
- Acceso vía PIN simple de 4 dígitos (sin email/contraseña).
- Vista de tarjetas por pedido: número de mesa, hora de recepción, ítems con cantidades y notas.
- Las tarjetas nuevas aparecen con sonido + highlight visual.
- Ordenadas por hora de llegada (más antiguas primero).
- Vista optimizada para tablets en horizontal.

---

**US-12 — Filtrar cocina por sector**
> Como admin, quiero que algunos ítems vayan a "Barra" y otros a "Cocina" para que cada sector vea solo lo suyo.

**Criterios de aceptación:**
- Al crear un ítem, se le asigna sector: Cocina | Barra | Ambos.
- La URL de cocina y barra son distintas: `/cocina` y `/barra`.
- Si un pedido tiene ítems de ambos sectores, aparece en ambas pantallas (solo los ítems correspondientes).

---

**US-13 — Cambiar estado de comanda**
> Como cocinero, quiero marcar un pedido como "En preparación" y luego "Listo" para avisar al mozo.

**Criterios de aceptación:**
- Botones en cada tarjeta: [En preparación] → [Listo ✅].
- Al marcar "Listo": la tarjeta cambia de color y el mozo recibe notificación web push.
- El mozo puede marcar "Entregado" desde su vista de mesa.
- El cliente ve el cambio de estado en su pantalla QR.

---

### 🟩 ÉPICA 5: Dashboard Admin y Reportes

**US-14 — Ver ventas del día**
> Como admin, quiero ver un resumen de ventas del día para saber cómo fue el servicio.

**Criterios de aceptación:**
- Total vendido del día (en ARS).
- Cantidad de mesas atendidas.
- Ítem más vendido del día.
- Top 5 productos por volumen.
- Filtro por rango de fechas (hoy, últimos 7 días, 30 días, personalizado).

---

**US-15 — Exportar reporte**
> Como admin, quiero exportar las ventas en CSV para llevarlas al contador.

**Criterios de aceptación:**
- Botón "Exportar CSV" en sección reportes.
- Columnas: Fecha, Mesa, Items, Total, Método de pago, Hora apertura, Hora cierre.
- El archivo se descarga directamente desde el browser.

---

### 🟪 ÉPICA 6: White-label y Customización por Tenant

**US-16 — Configurar identidad de marca**
> Como admin del local, quiero personalizar el menú con mi logo y colores para que mis clientes sientan que es mi app.

**Criterios de aceptación:**
- El admin puede subir: logo (PNG/JPG, max 2MB), imagen de portada del menú.
- Puede configurar: color primario (hex picker), nombre del local, descripción corta, dirección, horario.
- Preview en tiempo real de cómo se ve el menú QR con los cambios.
- Los cambios se aplican inmediatamente al menú público.

---

**US-17 — Subdominio único por local**
> Como admin, quiero tener una URL única para mi local para compartirla en redes sociales además del QR.

**Criterios de aceptación:**
- Al registrarse, el admin elige su slug: `mi-bar` → `mi-bar.comandaapp.com.ar`.
- El slug no puede repetirse (validación en tiempo real al escribir).
- La URL funciona tanto para escanear QR de mesa como para acceso directo.
- En roadmap: dominio custom tipo `menu.barelpatio.com`.

---

**US-18 — Generar y descargar QR por mesa**
> Como admin, quiero generar los QR de cada mesa para imprimirlos y pegarlos.

**Criterios de aceptación:**
- Cada mesa tiene su QR único generado automáticamente al crearla.
- Descarga QR individual (PNG) o todos juntos (ZIP o PDF multi-página).
- El PDF incluye nombre de la mesa debajo del QR.
- El QR lleva el logo del local al centro si fue configurado.
- Formato ideal para imprimir en tamaño tarjeta o carta.

---

### 🟫 ÉPICA 7: Onboarding y Suscripción

**US-19 — Registrar local (onboarding)**
> Como nuevo cliente, quiero registrar mi local y empezar a usarlo en menos de 10 minutos.

**Criterios de aceptación:**
- Registro: email + contraseña + nombre del local + slug único.
- Al registrar: se crea tenant, menú vacío, 5 mesas por defecto.
- Wizard de onboarding de 3 pasos: 1) Configurar marca, 2) Crear primer ítem, 3) Descargar QR.
- Trial gratuito 14 días sin tarjeta de crédito.

---

**US-20 — Gestionar suscripción**
> Como admin, quiero ver mi plan activo y poder pagar desde el dashboard.

**Criterios de aceptación:**
- Vista "Mi plan" con fecha de vencimiento, precio y botón de renovar.
- Integración MercadoPago para pago recurrente (suscripción mensual).
- Si vence sin pago: acceso solo lectura con banner de aviso prominente.
- Notificación por email 7 días y 1 día antes del vencimiento.

---

### ⬛ ÉPICA 8: Super Admin (Dueño del SaaS)

**US-21 — Panel de administración de la plataforma**
> Como dueño del SaaS, quiero ver todos los locales registrados y métricas clave.

**Criterios de aceptación:**
- Login separado en `/superadmin` con 2FA obligatorio.
- Lista de tenants: nombre, slug, fecha registro, estado (trial/activo/vencido), último acceso.
- Métricas globales: Total locales activos, pedidos del día, MRR estimado.
- Puede activar/desactivar manualmente cualquier local.
- Puede extender el trial de un local manualmente.

---

**US-22 — Gestión de planes y límites**
> Como dueño del SaaS, quiero definir los planes y sus límites para controlar el uso.

**Criterios de aceptación:**
- Plan Trial: 14 días gratis, máx 5 mesas, sin exportar reportes.
- Plan MVP ($15.000-$20.000/mes): hasta 20 mesas, reportes completos, customización de marca.
- Los límites se validan en backend (no solo frontend).
- Si un local supera el límite, recibe mensaje claro indicando que debe actualizar plan.

---

## 7. Esquema de Base de Datos

```sql
-- Tenants (cada local)
tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  logo_url VARCHAR,
  cover_url VARCHAR,
  primary_color VARCHAR DEFAULT '#000000',
  address VARCHAR,
  schedule VARCHAR,
  plan_id VARCHAR DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  subscription_status VARCHAR DEFAULT 'trial',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Users (staff del local)
users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  email VARCHAR,
  password_hash VARCHAR,
  role VARCHAR CHECK (role IN ('admin','mozo','cocina')),
  name VARCHAR,
  pin VARCHAR(4),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Tables (mesas)
tables (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  qr_code_url VARCHAR,
  status VARCHAR DEFAULT 'libre' CHECK (status IN ('libre','ocupada','cuenta_solicitada')),
  active BOOLEAN DEFAULT true
)

-- Table Sessions (mesa abierta)
table_sessions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  table_id UUID REFERENCES tables(id),
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  total_amount DECIMAL(10,2),
  payment_method VARCHAR
)

-- Menu Categories
menu_categories (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name VARCHAR NOT NULL,
  icon VARCHAR,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
)

-- Menu Items
menu_items (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  category_id UUID REFERENCES menu_categories(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  sector VARCHAR DEFAULT 'cocina' CHECK (sector IN ('cocina','barra','ambos')),
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
)

-- Orders (pedidos por sesión)
orders (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  table_session_id UUID REFERENCES table_sessions(id),
  table_id UUID REFERENCES tables(id),
  status VARCHAR DEFAULT 'pendiente' CHECK (status IN ('pendiente','en_preparacion','listo','entregado')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Order Items
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  sector VARCHAR
)
```

---

## 8. Reglas de Negocio

1. El slug de cada local es único e inmutable después del primer mes de uso.
2. El QR de mesa incluye `tenant_id` + `table_id` encriptados en la URL.
3. Un cliente sin sesión activa en la mesa puede ver el menú pero no puede hacer pedidos.
4. El botón "Pedir la cuenta" cambia el estado de la mesa a `cuenta_solicitada` y notifica al mozo.
5. Una mesa solo puede cerrarse si todos sus pedidos están en estado "entregado" o el mozo lo fuerza manualmente.
6. En Plan Trial: máximo 5 mesas activas. No se pueden crear más sin upgrade.
7. Todos los precios en la DB son sin IVA; el frontend muestra con IVA incluido.
8. Los datos de pedidos se conservan 90 días para locales activos.

---

## 9. MVP vs Roadmap

| Feature | MVP ✅ | Roadmap 🔜 |
|---------|--------|------------|
| QR Pedidos cliente autoservicio | ✅ | |
| Comanda cocina realtime | ✅ | |
| KDS por sector (cocina/barra) | ✅ | |
| Gestión mesas | ✅ | |
| CRUD Menú con imágenes | ✅ | |
| Branding/white-label básico | ✅ | |
| QR con logo embedded | ✅ | |
| Descarga QR individual/ZIP | ✅ | |
| Solicitar cuenta desde QR | ✅ | |
| Reportes básicos + CSV | ✅ | |
| Suscripción MercadoPago | ✅ | |
| Multi-tenant + Super Admin | ✅ | |
| Facturación AFIP | | 🔜 v2 |
| Delivery (PedidosYa/Rappi) | | 🔜 v2 |
| App nativa iOS/Android | | 🔜 v3 |
| Stock avanzado | | 🔜 v2 |
| Dominio custom por local | | 🔜 v2 |
| Fidelidad/puntos | | 🔜 v3 |
| Multi-sucursal | | 🔜 v2 |
| IA sugerencias de pedidos | | 🔜 v3 |

---

## 10. Plan de Sprints (4 semanas)

| Sprint | Semana | Objetivos |
|--------|--------|-----------|
| Sprint 1 | Sem 1 | Infra + Auth multi-tenant + DB schema + Super Admin básico |
| Sprint 2 | Sem 2 | CRUD Menú + Branding + Generación QR con logo + Onboarding |
| Sprint 3 | Sem 3 | Flujo QR cliente (menú + pedido autoservicio) + KDS cocina realtime |
| Sprint 4 | Sem 4 | Gestión mesas + Reportes + Suscripción MercadoPago + QA general |

---

## 11. Criterios de Calidad (Definition of Done)

- Cada US tiene tests del flujo principal (happy path).
- Mobile-first: testeado en viewport 375px mínimo.
- Tiempo de carga menú QR < 3s en 4G.
- Latencia realtime comanda < 2 segundos.
- Sin errores en consola en producción.
- Deploy automático en Vercel al merge a `main`.
- Variables de entorno documentadas en `.env.example`.

---

*Documento generado para ComandaApp MVP — Febrero 2026*
