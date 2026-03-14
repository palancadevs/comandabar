import Link from 'next/link'
import { ChefHat, CreditCard, ReceiptText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getAdminContext } from '@/lib/auth/admin'

import { AdminDashboardView } from './AdminDashboardView'

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
    return 'Suscripción activa.'
  }

  if (!trialEndsAt) {
    return 'Primer mes gratis activo.'
  }

  const endDate = new Date(trialEndsAt)
  const today = new Date()
  const diffMs = endDate.getTime() - today.getTime()
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  if (daysLeft === 0) {
    return 'La prueba termina hoy.'
  }

  return `${daysLeft} días de prueba restantes.`
}

function getSessionTotal(session: any) {
  return Number(session.total_amount || 0)
}

function getRangeSessions(sessions: any[], start: Date, end?: Date) {
  return sessions.filter((session) => {
    if (!session.closed_at) return false
    const closedAt = new Date(session.closed_at)
    return closedAt >= start && (!end || closedAt < end)
  })
}

function sumSessions(sessions: any[]) {
  return sessions.reduce((sum, session) => sum + getSessionTotal(session), 0)
}

function getItemsSold(orders: any[]) {
  return orders.reduce((sum, order) => {
    return (
      sum +
      (order.order_items?.reduce((itemsSum: number, item: any) => itemsSum + Number(item.quantity || 0), 0) || 0)
    )
  }, 0)
}

function getPercentageChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function buildHourlySeries(sessions: any[]) {
  const totals = Array.from({ length: 24 }, () => 0)

  sessions.forEach((session) => {
    if (!session.closed_at) return
    const hour = new Date(session.closed_at).getHours()
    totals[hour] += getSessionTotal(session)
  })

  return totals.map((value, hour) => ({
    label: `${hour}h`,
    dayLabel: `${hour}:00`,
    value: Math.round(value),
  }))
}

function buildWeeklySeries(startOfWeek: Date, sessions: any[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = addDays(startOfWeek, index)
    const nextDate = addDays(currentDate, 1)
    const daySessions = getRangeSessions(sessions, currentDate, nextDate)

    return {
      label: currentDate.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', ''),
      dayLabel: currentDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
      value: Math.round(sumSessions(daySessions)),
    }
  })
}

function buildMonthlySeries(now: Date, sessions: any[]) {
  return Array.from({ length: now.getDate() }, (_, index) => {
    const currentDate = new Date(now.getFullYear(), now.getMonth(), index + 1)
    const nextDate = addDays(currentDate, 1)
    const daySessions = getRangeSessions(sessions, currentDate, nextDate)

    return {
      label: `${index + 1}/${now.getMonth() + 1}`,
      dayLabel: currentDate.toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', ''),
      value: Math.round(sumSessions(daySessions)),
    }
  })
}

function buildRankedItems(items: any[], orders: any[]) {
  const itemStats = new Map<string, { name: string; quantity: number; revenue: number }>()

  items?.forEach((item) => {
    if (!item.available) return
    itemStats.set(item.id, {
      name: item.name,
      quantity: 0,
      revenue: 0,
    })
  })

  orders.forEach((order: any) => {
    order.order_items?.forEach((item: any) => {
      const itemId = item.menu_item_id
      const current = itemStats.get(itemId) || {
        name: item.menu_items?.name || 'Producto',
        quantity: 0,
        revenue: 0,
      }

      itemStats.set(itemId, {
        name: current.name,
        quantity: current.quantity + Number(item.quantity || 0),
        revenue: current.revenue + Number(item.quantity || 0) * Number(item.unit_price || 0),
      })
    })
  })

  const rankedItems = Array.from(itemStats.values())

  return {
    top: [...rankedItems].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    low: [...rankedItems].sort((a, b) => a.quantity - b.quantity).slice(0, 5),
    topName: [...rankedItems].sort((a, b) => b.quantity - a.quantity)[0]?.name || 'Sin datos todavía',
  }
}

export default async function AdminDashboardPage() {
  const { supabase, tenantId } = await getAdminContext()

  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const startOfWeek = new Date(now)
  const mondayOffset = (startOfWeek.getDay() + 6) % 7
  startOfWeek.setDate(startOfWeek.getDate() - mondayOffset)
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfPrevWeek = new Date(startOfWeek)
  startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const startOfTomorrow = addDays(startOfDay, 1)
  const startOfYesterday = addDays(startOfDay, -1)

  const [
    { data: tenant },
    { data: tables },
    { data: items },
    { data: activeOrders },
    { data: analyticsOrders },
    { data: closedSessions },
  ] =
    await Promise.all([
      supabase
        .from('tenants')
        .select('name, trial_ends_at, subscription_status')
        .eq('id', tenantId)
        .single(),
      supabase.from('tables').select('id, status').eq('tenant_id', tenantId),
      supabase.from('menu_items').select('id, name, available').eq('tenant_id', tenantId),
      supabase
        .from('orders')
        .select('id')
        .eq('tenant_id', tenantId)
        .in('status', ['pendiente', 'en_preparacion']),
      supabase
        .from('orders')
        .select('id, created_at, table_session_id, order_items(quantity, unit_price, menu_item_id, menu_items(name))')
        .eq('tenant_id', tenantId)
        .gte('created_at', startOfPrevMonth.toISOString()),
      supabase
        .from('table_sessions')
        .select('id, closed_at, total_amount, payment_method')
        .eq('tenant_id', tenantId)
        .not('closed_at', 'is', null)
        .gte('closed_at', startOfPrevMonth.toISOString()),
    ])

  const closedTodaySessions = getRangeSessions(closedSessions || [], startOfDay, startOfTomorrow)
  const closedYesterdaySessions = getRangeSessions(closedSessions || [], startOfYesterday, startOfDay)
  const currentWeekSessions = getRangeSessions(closedSessions || [], startOfWeek)
  const previousWeekSessions = getRangeSessions(closedSessions || [], startOfPrevWeek, startOfWeek)
  const currentMonthSessions = getRangeSessions(closedSessions || [], startOfMonth)
  const previousMonthSessions = getRangeSessions(closedSessions || [], startOfPrevMonth, startOfMonth)
  const daySessionIds = new Set((closedTodaySessions || []).map((session: any) => session.id))
  const weekSessionIds = new Set((currentWeekSessions || []).map((session: any) => session.id))
  const monthSessionIds = new Set((currentMonthSessions || []).map((session: any) => session.id))
  const soldOrdersToday = (analyticsOrders || []).filter((order: any) => order.table_session_id && daySessionIds.has(order.table_session_id))
  const soldOrdersThisWeek = (analyticsOrders || []).filter((order: any) => order.table_session_id && weekSessionIds.has(order.table_session_id))
  const soldOrdersThisMonth = (analyticsOrders || []).filter((order: any) => order.table_session_id && monthSessionIds.has(order.table_session_id))

  const todayRevenue = sumSessions(closedTodaySessions)
  const averageTicket = closedTodaySessions.length > 0 ? todayRevenue / closedTodaySessions.length : 0
  const busyTables = tables?.filter((table) => table.status !== 'libre').length || 0
  const todayItemsCount = getItemsSold(soldOrdersToday)
  const dayRankings = buildRankedItems(items || [], soldOrdersToday)
  const weekRankings = buildRankedItems(items || [], soldOrdersThisWeek)
  const monthRankings = buildRankedItems(items || [], soldOrdersThisMonth)
  const topTodayItem = dayRankings.topName

  const comparison = {
    weekCurrent: Math.round(sumSessions(currentWeekSessions)),
    weekPrevious: Math.round(sumSessions(previousWeekSessions)),
    weekChange: getPercentageChange(sumSessions(currentWeekSessions), sumSessions(previousWeekSessions)),
    monthCurrent: Math.round(sumSessions(currentMonthSessions)),
    monthPrevious: Math.round(sumSessions(previousMonthSessions)),
    monthChange: getPercentageChange(sumSessions(currentMonthSessions), sumSessions(previousMonthSessions)),
  }

  const analysisPeriods = {
    day: {
      label: 'Hoy',
      description: 'Lectura rápida del día actual.',
      summary: {
        revenue: Math.round(sumSessions(closedTodaySessions)),
        orders: getItemsSold(soldOrdersToday),
        closedTables: closedTodaySessions.length,
        averageTicket: closedTodaySessions.length > 0 ? sumSessions(closedTodaySessions) / closedTodaySessions.length : 0,
        topItem: dayRankings.topName,
      },
      series: buildHourlySeries(closedTodaySessions),
      comparison: {
        label: 'Hoy vs ayer',
        currentLabel: 'Hoy',
        previousLabel: 'Ayer',
        current: Math.round(sumSessions(closedTodaySessions)),
        previous: Math.round(sumSessions(closedYesterdaySessions)),
        change: getPercentageChange(sumSessions(closedTodaySessions), sumSessions(closedYesterdaySessions)),
      },
      topItems: dayRankings.top,
      lowItems: dayRankings.low,
    },
    week: {
      label: 'Semana',
      description: 'Seguimiento de la semana en curso.',
      summary: {
        revenue: Math.round(sumSessions(currentWeekSessions)),
        orders: getItemsSold(soldOrdersThisWeek),
        closedTables: currentWeekSessions.length,
        averageTicket: currentWeekSessions.length > 0 ? sumSessions(currentWeekSessions) / currentWeekSessions.length : 0,
        topItem: weekRankings.topName,
      },
      series: buildWeeklySeries(startOfWeek, closedSessions || []),
      comparison: {
        label: 'Semana actual vs anterior',
        currentLabel: 'Actual',
        previousLabel: 'Anterior',
        current: Math.round(sumSessions(currentWeekSessions)),
        previous: Math.round(sumSessions(previousWeekSessions)),
        change: getPercentageChange(sumSessions(currentWeekSessions), sumSessions(previousWeekSessions)),
      },
      topItems: weekRankings.top,
      lowItems: weekRankings.low,
    },
    month: {
      label: 'Mes',
      description: 'Vista acumulada del mes actual.',
      summary: {
        revenue: Math.round(sumSessions(currentMonthSessions)),
        orders: getItemsSold(soldOrdersThisMonth),
        closedTables: currentMonthSessions.length,
        averageTicket: currentMonthSessions.length > 0 ? sumSessions(currentMonthSessions) / currentMonthSessions.length : 0,
        topItem: monthRankings.topName,
      },
      series: buildMonthlySeries(now, closedSessions || []),
      comparison: {
        label: 'Mes actual vs anterior',
        currentLabel: 'Actual',
        previousLabel: 'Anterior',
        current: Math.round(sumSessions(currentMonthSessions)),
        previous: Math.round(sumSessions(previousMonthSessions)),
        change: getPercentageChange(sumSessions(currentMonthSessions), sumSessions(previousMonthSessions)),
      },
      topItems: monthRankings.top,
      lowItems: monthRankings.low,
    },
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="brand-panel bg-[var(--brand-cream)] p-6 md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
            Caja de hoy
          </p>
          <h1 className="font-display mt-3 text-5xl leading-none md:text-6xl">{formatPrice(todayRevenue)}</h1>
          <p className="mt-3 text-sm font-medium text-[rgba(18,13,10,0.72)]">
            Caja cerrada del día para {tenant?.name || 'tu local'}.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
              <div className="flex items-center gap-3">
                <ReceiptText className="size-5" />
                <p className="text-sm font-semibold">Mesas cobradas</p>
              </div>
              <p className="mt-4 text-3xl font-extrabold">{closedTodaySessions.length}</p>
              <p className="mt-2 text-sm text-[rgba(18,13,10,0.7)]">{todayItemsCount} ítems en ventas cerradas hoy</p>
            </div>

            <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="size-5" />
                <p className="text-sm font-semibold">Ticket promedio</p>
              </div>
              <p className="mt-4 text-3xl font-extrabold">{formatPrice(averageTicket)}</p>
              <p className="mt-2 text-sm text-[rgba(18,13,10,0.7)]">Valor medio por mesa cobrada</p>
            </div>

            <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
              <div className="flex items-center gap-3">
                <ChefHat className="size-5" />
                <p className="text-sm font-semibold">Más vendido</p>
              </div>
              <p className="mt-4 text-2xl font-extrabold leading-tight">{topTodayItem}</p>
              <p className="mt-2 text-sm text-[rgba(18,13,10,0.7)]">Producto con más salida en ventas cerradas hoy</p>
            </div>
          </div>
        </div>

        <div className="brand-panel bg-[var(--brand-black)] p-6 text-[var(--brand-cream)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
            Operación actual
          </p>
          <div className="mt-6 grid gap-4">
            <div className="brand-panel-soft bg-[var(--brand-cream)] p-4 text-[var(--brand-black)]">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-orange-deep)]">
                Pedidos activos
              </p>
              <p className="mt-3 text-4xl font-extrabold">{activeOrders?.length || 0}</p>
            </div>
            <div className="brand-panel-soft bg-[var(--brand-cream)] p-4 text-[var(--brand-black)]">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-[var(--brand-orange-deep)]">
                Mesas ocupadas
              </p>
              <p className="mt-3 text-4xl font-extrabold">
                {busyTables} / {tables?.length || 0}
              </p>
            </div>
            <div className="brand-panel-soft bg-[var(--brand-yellow)] p-4 text-[var(--brand-black)]">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em]">
                Estado comercial
              </p>
              <p className="mt-3 text-xl font-extrabold">{getTrialCopy(tenant?.trial_ends_at || null, tenant?.subscription_status || null)}</p>
              <p className="mt-2 text-sm font-medium">$40.000 ARS por mes luego del trial.</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-[rgba(246,237,217,0.76)]">
            La caja y las comparaciones ahora toman solo mesas cerradas y cobradas. Si una mesa no se cierra,
            no entra en la caja.
          </p>
        </div>
      </section>

      <AdminDashboardView
        periods={{
          day: {
            ...analysisPeriods.day,
            topItems: analysisPeriods.day.topItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
            lowItems: analysisPeriods.day.lowItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
          },
          week: {
            ...analysisPeriods.week,
            topItems: analysisPeriods.week.topItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
            lowItems: analysisPeriods.week.lowItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
          },
          month: {
            ...analysisPeriods.month,
            topItems: analysisPeriods.month.topItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
            lowItems: analysisPeriods.month.lowItems.map((item) => ({
              ...item,
              revenueLabel: formatPrice(item.revenue),
            })),
          },
        }}
      />

      <section className="flex flex-wrap gap-3">
        <Button asChild className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] text-[var(--brand-black)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-cream)]">
          <Link href="/admin/menu/items">Editar carta</Link>
        </Button>
        <Button asChild className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] text-[var(--brand-black)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-cream)]">
          <Link href="/admin/tables">Ver mesas</Link>
        </Button>
        <Button asChild className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] text-[var(--brand-black)] shadow-[4px_4px_0_var(--brand-black)] hover:bg-[var(--brand-cream)]">
          <Link href="/admin/kds">Abrir cocina</Link>
        </Button>
      </section>
    </div>
  )
}
