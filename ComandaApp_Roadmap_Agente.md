# ComandaApp - Roadmap de Producto y Plataforma

Este archivo resume decisiones y próximos pasos para futuras iteraciones del producto.
Está pensado como contexto rápido para cualquier agente o desarrollador que continúe el trabajo.

## 1. Objetivo comercial inmediato

- Vender COMANDA como SaaS para bares, pubs y restaurantes pequeños.
- Precio actual de referencia: `$40.000 ARS / mes`.
- Oferta comercial actual: `primer mes gratis`.
- El foco de venta no es "branding" sino resolver operación:
  - toma de pedidos más rápida,
  - menos errores entre salón y cocina,
  - mejor control del local,
  - experiencia QR sin app para el cliente.

## 2. Roadmap de pagos a la plataforma

Estado actual:
- Todavía no existe el flujo de cobro activo al cliente del SaaS.
- La prueba gratis debe convivir con una futura activación de suscripción.

Objetivo futuro:
- Generar un link de pago de Mercado Pago para cada tenant cuando termine o esté por terminar el período gratis.
- Si el pago se acredita, la suscripción del tenant queda activa.
- Si no paga, el tenant entra en estado vencido o restringido.

Implementación sugerida:
- Extender `tenants` con campos como:
  - `billing_plan`
  - `billing_amount_ars`
  - `trial_started_at`
  - `trial_ends_at`
  - `subscription_status`
  - `mercadopago_subscription_id`
  - `mercadopago_payment_link`
  - `last_payment_at`
  - `next_billing_at`
- Crear endpoint o server action para:
  - generar link de pago,
  - guardar referencia del link,
  - actualizar estado de suscripción.
- Procesar webhooks de Mercado Pago para:
  - pago aprobado,
  - pago rechazado,
  - expiración o cancelación.

Estados sugeridos:
- `trial`
- `active`
- `past_due`
- `paused`
- `cancelled`

## 3. Recordatorios de suscripción

Objetivo:
- Avisar antes del vencimiento de la prueba o del próximo pago.

Recordatorios sugeridos:
- 7 días antes del fin del trial.
- 3 días antes del fin del trial.
- el mismo día del vencimiento.
- si el pago falla, aviso inmediato.

Canales sugeridos:
- banner dentro del admin dashboard,
- email al dueño del local,
- aviso persistente en panel mientras exista deuda o vencimiento cercano.

UX sugerida:
- mostrar CTA claro:
  - `Activar suscripción`
  - `Pagar ahora`
  - `Actualizar estado de pago`

## 4. Dashboard del dueño del local

Propósito:
- no debe ser una pantalla vacía ni solo decorativa,
- debe resumir el estado operativo y comercial del local en segundos.

Debe mostrar:
- pedidos activos,
- mesas ocupadas,
- movimiento del día,
- actividad reciente,
- estado de activación del local,
- estado de la prueba o suscripción,
- accesos rápidos a carta, mesas, KDS y ajustes.

Evolución futura sugerida:
- ventas por rango de fechas,
- ticket promedio,
- producto más vendido,
- tiempos promedio de preparación,
- alertas operativas,
- recordatorios comerciales.

## 5. Superadmin

Estado actual:
- ya existe una base inicial en `/src/app/superadmin/page.tsx`,
- hoy es todavía simple y debe evolucionar a un verdadero panel de plataforma.

Objetivo futuro:
- que el superadmin vea toda la operación global del SaaS.

Debe mostrar:
- cantidad total de tenants,
- tenants activos vs trial vs vencidos,
- facturación mensual estimada,
- tenants nuevos por período,
- próximos vencimientos,
- pagos pendientes o fallidos,
- actividad reciente por tenant,
- acceso al detalle de cada tenant.

Detalle por tenant:
- nombre, slug y fecha de alta,
- estado de suscripción,
- fecha de fin de trial,
- fecha de último pago,
- cantidad de mesas,
- cantidad de ítems del menú,
- cantidad de pedidos recientes,
- health/status general del tenant.

## 6. Orden recomendado de desarrollo

1. Consolidar el admin dashboard del tenant.
2. Implementar estados de suscripción confiables en base de datos.
3. Crear integración de pago con Mercado Pago.
4. Agregar banners y recordatorios de vencimiento.
5. Expandir el panel `superadmin` con métricas globales.
6. Recién después, profundizar automatizaciones de billing y restricciones por mora.

## 7. Criterio de producto

Cada nueva pantalla debe responder una de estas preguntas:
- `¿Ayuda a vender el servicio?`
- `¿Ayuda al dueño a operar mejor?`
- `¿Ayuda a la plataforma a cobrar y escalar?`

Si no responde claramente alguna de esas tres, probablemente no es prioridad.
