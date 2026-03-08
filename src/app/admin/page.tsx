import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  ChefHat,
  Clock3,
  CreditCard,
  LayoutGrid,
  Palette,
  QrCode,
  ReceiptText,
  Store,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function formatPrice(value: number) {
  return currency.format(value || 0)
}

function getTrialCopy(trialEndsAt: string | null, subscriptionStatus: string | null) {
  if (subscriptionStatus && subscriptionStatus !== 'trial') {
    return 'Tu suscripción está activa.'
  }

  if (!trialEndsAt) {
    return 'Tienes el primer mes gratis activo. Más adelante podrás continuar con un link de pago.'
  }

  const endDate = new Date(trialEndsAt)
  const today = new Date()
  const diffMs = endDate.getTime() - today.getTime()
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  if (daysLeft === 0) {
    return 'Tu período gratuito termina hoy.'
  }

  return `Te quedan ${daysLeft} días de prueba antes de pasar a $40.000/mes.`
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, role, name')
    .eq('id', user.id)
    .single()

  if (!userData?.tenant_id) redirect('/auth/login')

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [
    { data: tenant },
    { data: tables },
    { data: categories },
    { data: items },
    { data: activeOrders },
    { data: todaysOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from('tenants')
      .select('name, slug, logo_url, description, cover_url, trial_ends_at, subscription_status')
      .eq('id', userData.tenant_id)
      .single(),
    supabase.from('tables').select('id, status, active').eq('tenant_id', userData.tenant_id),
    supabase.from('menu_categories').select('id').eq('tenant_id', userData.tenant_id),
    supabase.from('menu_items').select('id, available').eq('tenant_id', userData.tenant_id),
    supabase
      .from('orders')
      .select('id, status')
      .eq('tenant_id', userData.tenant_id)
      .in('status', ['pendiente', 'en_preparacion']),
    supabase
      .from('orders')
      .select('id, status, created_at, order_items(quantity, unit_price)')
      .eq('tenant_id', userData.tenant_id)
      .gte('created_at', startOfDay.toISOString()),
    supabase
      .from('orders')
      .select('id, status, created_at, tables(name), order_items(quantity, menu_items(name))')
      .eq('tenant_id', userData.tenant_id)
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const availableItems = items?.filter((item) => item.available) || []
  const busyTables = tables?.filter((table) => table.status !== 'libre') || []
  const todayRevenue =
    todaysOrders?.reduce((sum, order) => {
      const orderTotal =
        order.order_items?.reduce((itemsSum: number, item: any) => {
          return itemsSum + Number(item.unit_price || 0) * Number(item.quantity || 0)
        }, 0) || 0

      return sum + orderTotal
    }, 0) || 0

  const todayItemsCount =
    todaysOrders?.reduce((sum, order) => {
      return (
        sum +
        (order.order_items?.reduce((itemsSum: number, item: any) => itemsSum + Number(item.quantity || 0), 0) || 0)
      )
    }, 0) || 0

  const setupChecklist = [
    {
      label: 'Crear al menos una mesa',
      done: (tables?.length || 0) > 0,
      href: '/admin/tables',
    },
    {
      label: 'Armar categorías del menú',
      done: (categories?.length || 0) > 0,
      href: '/admin/menu/categories',
    },
    {
      label: 'Cargar productos disponibles',
      done: availableItems.length > 0,
      href: '/admin/menu/items',
    },
    {
      label: 'Subir identidad del local',
      done: Boolean(tenant?.logo_url || tenant?.cover_url || tenant?.description),
      href: '/admin/settings',
    },
  ]

  const setupDoneCount = setupChecklist.filter((item) => item.done).length
  const setupPercent = Math.round((setupDoneCount / setupChecklist.length) * 100)

  const quickActions = [
    {
      href: '/admin/menu/items',
      icon: ReceiptText,
      title: 'Cargar carta',
      description: 'Agrega platos, bebidas y precios para empezar a tomar pedidos.',
    },
    {
      href: '/admin/tables',
      icon: QrCode,
      title: 'Preparar mesas QR',
      description: 'Crea mesas y abre sus enlaces QR para probar la experiencia del cliente.',
    },
    {
      href: '/admin/kds',
      icon: ChefHat,
      title: 'Revisar cocina',
      description: 'Controla pedidos pendientes y el flujo en tiempo real desde el KDS.',
    },
    {
      href: '/admin/settings',
      icon: Palette,
      title: 'Configurar local',
      description: 'Sube logo, portada y datos del negocio para que la experiencia tenga tu marca.',
    },
  ]

  const stats = [
    {
      label: 'Pedidos activos',
      value: activeOrders?.length || 0,
      helper: 'Pendientes o en preparación',
      icon: Clock3,
    },
    {
      label: 'Mesas ocupadas',
      value: busyTables.length,
      helper: `${tables?.length || 0} mesas configuradas`,
      icon: LayoutGrid,
    },
    {
      label: 'Pedidos de hoy',
      value: todaysOrders?.length || 0,
      helper: `${todayItemsCount} ítems pedidos hoy`,
      icon: ReceiptText,
    },
    {
      label: 'Movimiento de hoy',
      value: formatPrice(todayRevenue),
      helper: 'Total de pedidos cargados hoy',
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-8">
      <section className="brand-panel overflow-hidden bg-[var(--brand-cream)]">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-orange)] px-4 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-cream)] shadow-none">
                Panel del local
              </Badge>
              <Badge className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-4 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-black)] shadow-none">
                {tenant?.subscription_status || 'trial'}
              </Badge>
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="brand-panel-soft flex size-20 items-center justify-center overflow-hidden bg-white p-2">
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt={`Logo de ${tenant.name}`} className="h-full w-full object-contain" />
                ) : (
                  <Store className="size-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-orange-deep)]">
                  Centro de mando
                </p>
                <h1 className="font-display mt-2 text-5xl leading-none md:text-6xl">
                  {tenant?.name || 'Tu local'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-[rgba(18,13,10,0.75)] md:text-base">
                  Este dashboard existe para que un dueño vea, en menos de un minuto, si el local ya está
                  listo para operar, qué está pasando hoy y cuál es la próxima acción importante.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-[3px] border-[var(--brand-black)] bg-[var(--brand-black)] p-6 text-[var(--brand-cream)] lg:border-l-[3px] lg:border-t-0 md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-yellow)]">
              Prueba y plan
            </p>
            <p className="font-display mt-3 text-4xl leading-none">primer mes gratis</p>
            <p className="mt-4 text-sm font-medium leading-6 text-[rgba(246,237,217,0.8)]">
              {getTrialCopy(tenant?.trial_ends_at || null, tenant?.subscription_status || null)}
            </p>
            <div className="mt-5 brand-panel-soft bg-[var(--brand-cream)] p-4 text-[var(--brand-black)]">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                Valor del servicio
              </p>
              <p className="mt-2 text-2xl font-extrabold">$40.000 ARS / mes</p>
              <p className="mt-2 text-sm font-medium leading-6">
                Más adelante podrás activar continuidad con un link de pago de Mercado Pago.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="brand-panel-soft bg-[var(--brand-cream)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                {label}
              </p>
              <div className="flex size-11 items-center justify-center rounded-2xl border-2 border-[var(--brand-black)] bg-[var(--brand-yellow)]">
                <Icon className="size-5" />
              </div>
            </div>
            <p className="mt-4 font-display text-4xl leading-none">{value}</p>
            <p className="mt-3 text-sm font-medium leading-6 text-[rgba(18,13,10,0.72)]">{helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="brand-panel bg-[var(--brand-cream)] py-0">
          <CardHeader className="border-b-[3px] border-[var(--brand-black)] px-6 py-5">
            <CardTitle className="font-display text-4xl leading-none">Activación del local</CardTitle>
            <CardDescription className="text-sm font-medium text-[rgba(18,13,10,0.72)]">
              Lo mínimo que debería estar listo para empezar a operar bien.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 py-6">
            <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                    Progreso
                  </p>
                  <p className="mt-2 text-lg font-extrabold">{setupDoneCount} de 4 tareas completas</p>
                </div>
                <p className="font-display text-4xl leading-none">{setupPercent}%</p>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)]">
                <div
                  className="h-full bg-[var(--brand-orange)] transition-all"
                  style={{ width: `${setupPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {setupChecklist.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="brand-panel-soft flex items-center justify-between gap-4 bg-[var(--brand-cream-strong)] p-4 transition-transform hover:-translate-y-0.5"
                >
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-[rgba(18,13,10,0.7)]">
                      {item.done ? 'Listo para usar' : 'Todavía pendiente'}
                    </p>
                  </div>
                  <Badge
                    className={`rounded-full border-2 border-[var(--brand-black)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] shadow-none ${
                      item.done
                        ? 'bg-[var(--brand-yellow)] text-[var(--brand-black)]'
                        : 'bg-[var(--brand-black)] text-[var(--brand-cream)]'
                    }`}
                  >
                    {item.done ? 'OK' : 'Pendiente'}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="brand-panel bg-[var(--brand-cream)] py-0">
          <CardHeader className="border-b-[3px] border-[var(--brand-black)] px-6 py-5">
            <CardTitle className="font-display text-4xl leading-none">Acciones rápidas</CardTitle>
            <CardDescription className="text-sm font-medium text-[rgba(18,13,10,0.72)]">
              Atajos a las secciones que más vas a usar como dueño o admin del local.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 px-6 py-6 md:grid-cols-2">
            {quickActions.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={title}
                href={href}
                className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-[var(--brand-black)] bg-[var(--brand-yellow)]">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display mt-4 text-3xl leading-none">{title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-[rgba(18,13,10,0.72)]">{description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em]">
                  Ir ahora
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="brand-panel bg-[var(--brand-cream)] py-0">
          <CardHeader className="border-b-[3px] border-[var(--brand-black)] px-6 py-5">
            <CardTitle className="font-display text-4xl leading-none">Actividad reciente</CardTitle>
            <CardDescription className="text-sm font-medium text-[rgba(18,13,10,0.72)]">
              Últimos pedidos cargados en el sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 py-6">
            {recentOrders?.length ? (
              recentOrders.map((order: any) => {
                const itemsSummary =
                  order.order_items
                    ?.slice(0, 2)
                    .map((item: any) => `${item.quantity}x ${item.menu_items?.name || 'Producto'}`)
                    .join(' · ') || 'Sin detalle de ítems'

                return (
                  <div key={order.id} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">Mesa {order.tables?.name || 'sin mesa'}</p>
                        <p className="mt-1 text-sm text-[rgba(18,13,10,0.7)]">{itemsSummary}</p>
                      </div>
                      <Badge className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-black)] px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-cream)] shadow-none">
                        {String(order.status).replaceAll('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-orange-deep)]">
                      {new Date(order.created_at).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )
              })
            ) : (
              <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-6 text-center">
                <p className="font-display text-3xl leading-none">Todavía no hay pedidos</p>
                <p className="mt-3 text-sm font-medium text-[rgba(18,13,10,0.72)]">
                  Cuando entren comandas desde el QR, esta sección te va a mostrar la actividad reciente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="brand-panel bg-[var(--brand-black)] py-0 text-[var(--brand-cream)]">
          <CardHeader className="border-b-[3px] border-[var(--brand-cream)]/20 px-6 py-5">
            <CardTitle className="font-display text-4xl leading-none">Qué debería mostrar este dashboard</CardTitle>
            <CardDescription className="text-sm font-medium text-[rgba(246,237,217,0.72)]">
              La idea no es decorar: es darte visibilidad inmediata del negocio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 py-6 text-sm font-medium leading-6 text-[rgba(246,237,217,0.82)]">
            <p>Estado operativo de hoy: pedidos activos, mesas ocupadas y movimiento del día.</p>
            <p>Grado de activación del local: si ya tienes carta, mesas y branding listos para vender.</p>
            <p>Próximos pasos claros: a dónde entrar según lo que falte configurar.</p>
            <p>Estado comercial: prueba gratuita, valor mensual y futura continuidad por pago.</p>
            <Button
              asChild
              className="mt-2 h-12 rounded-full border-2 border-[var(--brand-cream)] bg-[var(--brand-yellow)] px-6 text-sm font-extrabold text-[var(--brand-black)] shadow-none hover:bg-[var(--brand-yellow)]"
            >
              <Link href="/admin/settings">Terminar configuración del local</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
