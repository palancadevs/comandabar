'use client'

import { useState } from 'react'

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
  weekCurrent: number
  weekPrevious: number
  weekChange: number
  monthCurrent: number
  monthPrevious: number
  monthChange: number
}

type AdminDashboardViewProps = {
  monthlySeries: SeriesItem[]
  comparison: Comparison
  topItems: RankedItem[]
  lowItems: RankedItem[]
}

function BarChart({ data }: { data: SeriesItem[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      <div className="grid h-64 grid-cols-[repeat(auto-fit,minmax(10px,1fr))] items-end gap-2">
        {data.map((item) => (
          <div key={item.label} className="flex h-full flex-col items-center justify-end gap-2">
            <div
              className="w-full rounded-t-full border-2 border-[var(--brand-black)] bg-[var(--brand-orange)]"
              style={{ height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0)}%` }}
              title={`${item.label}: ${item.value}`}
            />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[rgba(18,13,10,0.6)]">
              {item.label.split('/')[0]}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm font-medium text-[rgba(18,13,10,0.72)]">
        Vista diaria del mes actual. Cada barra representa el total cargado por día.
      </p>
    </div>
  )
}

function ComparisonView({ comparison }: { comparison: Comparison }) {
  const cards = [
    {
      label: 'Semana actual vs anterior',
      current: comparison.weekCurrent,
      previous: comparison.weekPrevious,
      delta: comparison.weekChange,
    },
    {
      label: 'Mes actual vs anterior',
      current: comparison.monthCurrent,
      previous: comparison.monthPrevious,
      delta: comparison.monthChange,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => (
        <div key={card.label} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
            {card.label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[rgba(18,13,10,0.68)]">Actual</p>
              <p className="font-display mt-1 text-4xl leading-none">${card.current.toLocaleString('es-AR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-[rgba(18,13,10,0.68)]">Anterior</p>
              <p className="font-display mt-1 text-4xl leading-none">${card.previous.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold">
            {card.delta >= 0 ? '+' : ''}
            {card.delta}% respecto al período anterior
          </p>
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
  monthlySeries,
  comparison,
  topItems,
  lowItems,
}: AdminDashboardViewProps) {
  const [tab, setTab] = useState<'monthly' | 'comparison' | 'products'>('monthly')

  return (
    <section className="brand-panel bg-[var(--brand-cream)] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
            Análisis
          </p>
          <h2 className="font-display mt-2 text-4xl leading-none md:text-5xl">ventas y productos</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTab('monthly')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              tab === 'monthly' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Mensual
          </button>
          <button
            type="button"
            onClick={() => setTab('comparison')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              tab === 'comparison' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Comparación
          </button>
          <button
            type="button"
            onClick={() => setTab('products')}
            className={`rounded-full border-2 border-[var(--brand-black)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] ${
              tab === 'products' ? 'bg-[var(--brand-black)] text-[var(--brand-cream)]' : 'bg-[var(--brand-cream)] text-[var(--brand-black)]'
            }`}
          >
            Productos
          </button>
        </div>
      </div>

      <div className="mt-6">
        {tab === 'monthly' && <BarChart data={monthlySeries} />}
        {tab === 'comparison' && <ComparisonView comparison={comparison} />}
        {tab === 'products' && <ProductsView topItems={topItems} lowItems={lowItems} />}
      </div>
    </section>
  )
}
