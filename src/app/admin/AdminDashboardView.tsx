'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SeriesItem = {
  label: string
  dayLabel: string
  value: number
}

type RankedItem = {
  name: string
  quantity: number
  revenue: number
  revenueLabel: string
}

type Comparison = {
  label: string
  currentLabel: string
  previousLabel: string
  current: number
  previous: number
  change: number
}

type PeriodSummary = {
  revenue: number
  orders: number
  closedTables: number
  averageTicket: number
  topItem: string
}

type PeriodData = {
  label: string
  description: string
  summary: PeriodSummary
  series: SeriesItem[]
  comparison: Comparison
  topItems: RankedItem[]
  lowItems: RankedItem[]
}

type AdminDashboardViewProps = {
  periods: {
    day: PeriodData
    week: PeriodData
    month: PeriodData
  }
}

function BarChart({ data, period }: { data: SeriesItem[]; period: 'day' | 'week' | 'month' }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      <div className="grid h-64 grid-cols-[repeat(auto-fit,minmax(10px,1fr))] items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-full border-2 border-[var(--brand-black)] bg-[var(--brand-orange)]"
              style={{ height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` }}
              title={`${item.dayLabel}: ${item.value}`}
            />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[rgba(18,13,10,0.6)]">
              {period === 'month' ? item.label.split('/')[0] : item.label}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-[rgba(18,13,10,0.72)]">
        {period === 'day' && 'Cada barra representa la caja cerrada por hora de hoy.'}
        {period === 'week' && 'Cada barra representa la caja cerrada por día de la semana actual.'}
        {period === 'month' && 'Cada barra representa la caja cerrada por día del mes actual.'}
      </p>
    </div>
  )
}

function ComparisonView({ comparison }: { comparison: Comparison }) {
  return (
    <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
      <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
        {comparison.label}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-[rgba(18,13,10,0.68)]">{comparison.currentLabel}</p>
          <p className="font-display mt-1 text-4xl leading-none">${comparison.current.toLocaleString('es-AR')}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-[rgba(18,13,10,0.68)]">{comparison.previousLabel}</p>
          <p className="font-display mt-1 text-4xl leading-none">${comparison.previous.toLocaleString('es-AR')}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold">
        {comparison.change >= 0 ? '+' : ''}
        {comparison.change}% respecto al período anterior
      </p>
    </div>
  )
}

function SummaryCards({ summary }: { summary: PeriodSummary }) {
  const cards = [
    {
      label: 'Facturación',
      value: `$${summary.revenue.toLocaleString('es-AR')}`,
      detail: 'Solo mesas cerradas y cobradas',
    },
    {
      label: 'Mesas cobradas',
      value: summary.closedTables.toLocaleString('es-AR'),
      detail: `${summary.orders.toLocaleString('es-AR')} ítems vendidos`,
    },
    {
      label: 'Ticket promedio',
      value: `$${Math.round(summary.averageTicket).toLocaleString('es-AR')}`,
      detail: 'Promedio por mesa cerrada',
    },
    {
      label: 'Más vendido',
      value: summary.topItem,
      detail: 'Producto con más salida en el período',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
            {card.label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-3xl leading-none md:text-4xl">{card.value}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-[rgba(18,13,10,0.68)]">{card.detail}</p>
        </div>
      ))}
    </div>
  )
}

function ProductsView({ topItems, lowItems }: { topItems: RankedItem[]; lowItems: RankedItem[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
        <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
          Más vendidos
        </p>
        <div className="mt-4 space-y-3">
          {topItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[1rem] border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-4 py-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-[rgba(18,13,10,0.68)]">{item.revenueLabel}</p>
              </div>
              <p className="text-lg font-extrabold">{item.quantity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
        <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
          Menos vendidos
        </p>
        <div className="mt-4 space-y-3">
          {lowItems.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-[1rem] border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-4 py-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-[rgba(18,13,10,0.68)]">{item.revenueLabel}</p>
              </div>
              <p className="text-lg font-extrabold">{item.quantity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardView({
  periods,
}: AdminDashboardViewProps) {
  const router = useRouter()
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    const interval = window.setInterval(() => {
      router.refresh()
    }, 20000)

    return () => window.clearInterval(interval)
  }, [router])

  const currentPeriod = periods[period]

  return (
    <section className="brand-panel bg-[var(--brand-cream)] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
            Resumen de ventas
          </p>
          <h2 className="font-display mt-2 text-4xl leading-none md:text-5xl">ventas y movimiento</h2>
          <p className="mt-3 text-sm font-medium text-[rgba(18,13,10,0.72)]">
            {currentPeriod.description} Esta vista se actualiza sola cada 20 segundos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setPeriod('day')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              period === 'day' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Día
          </button>
          <button
            type="button"
            onClick={() => setPeriod('week')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              period === 'week' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Semana
          </button>
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              period === 'month' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <SummaryCards summary={currentPeriod.summary} />
        <BarChart data={currentPeriod.series} period={period} />
        <ComparisonView comparison={currentPeriod.comparison} />
        <ProductsView topItems={currentPeriod.topItems} lowItems={currentPeriod.lowItems} />
      </div>
    </section>
  )
}
