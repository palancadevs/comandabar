'use client'

import type { CSSProperties } from 'react'
import { useState, useTransition } from 'react'
import { ChevronRight, Minus, Plus, ShoppingBag, Sparkles, Utensils } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

import { createOrder } from './actions'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function formatPrice(value: number) {
  return currency.format(value || 0)
}

export default function MenuContent({ tenant, categories, tableId, tableName }: any) {
  const [cart, setCart] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const brandColor = tenant.primary_color || '#ea6a17'
  const menuTheme = { '--tenant-primary': brandColor } as CSSProperties & {
    '--tenant-primary': string
  }

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id)
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }

      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleSendOrder = async () => {
    startTransition(async () => {
      try {
        await createOrder({
          tenantId: tenant.id,
          tableId,
          items: cart.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            sector: item.sector || 'cocina',
          })),
        })
        setCart([])
        setIsCartOpen(false)
        alert('Pedido enviado. La cocina ya lo está viendo.')
      } catch (error: any) {
        alert(`Error al enviar pedido: ${error.message}`)
      }
    })
  }

  return (
    <div className="min-h-screen w-full max-w-full touch-pan-y overflow-x-hidden bg-[var(--tenant-primary)] pb-32 text-[var(--brand-black)]" style={menuTheme}>
      <div className="brand-grid absolute inset-0 opacity-20" />
      <div className="absolute -left-20 top-32 h-56 w-56 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-yellow)]/40" />
      <div className="absolute right-[-5rem] top-24 h-44 w-44 rounded-[2rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-red)]/25 rotate-12" />

      <div className="relative mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-4 md:px-6 md:py-6">
        <section className="brand-panel overflow-hidden bg-[var(--brand-cream)]">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative overflow-hidden p-6 md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(248,191,75,0.35),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(221,72,56,0.16),transparent_35%)]" />
              <div className="relative flex h-full flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="brand-chip px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em]">
                    Menu QR
                  </div>
                  {tableName && (
                    <div className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-black)] px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-cream)]">
                      {tableName}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div className="brand-panel-soft flex h-24 w-24 items-center justify-center overflow-hidden bg-white p-3">
                    {tenant.logo_url ? (
                      <img src={tenant.logo_url} alt={`Logo de ${tenant.name}`} className="h-full w-full object-contain" />
                    ) : (
                      <Utensils className="size-10" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[rgba(18,13,10,0.7)]">
                      Gastronomía con carácter
                    </p>
                    <h1 className="font-display mt-2 text-5xl leading-none md:text-6xl">{tenant.name}</h1>
                    {tenant.description && (
                      <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-[rgba(18,13,10,0.75)] md:text-base">
                        {tenant.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {tableName ? (
                    <div className="brand-panel-soft bg-[color:color-mix(in_srgb,var(--tenant-primary)_14%,white)] px-4 py-4">
                      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[rgba(18,13,10,0.65)]">
                        Mesa actual
                      </p>
                      <p className="mt-2 font-display text-2xl leading-none">{tableName}</p>
                    </div>
                  ) : (
                    <div className="brand-panel-soft bg-[color:color-mix(in_srgb,var(--tenant-primary)_14%,white)] px-4 py-4">
                      <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[rgba(18,13,10,0.65)]">
                        Canal
                      </p>
                      <p className="mt-2 font-display text-2xl leading-none">Menu QR</p>
                    </div>
                  )}
                  <div className="brand-panel-soft bg-[var(--brand-cream-strong)] px-4 py-4">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[rgba(18,13,10,0.65)]">
                      Pedido
                    </p>
                    <p className="mt-2 text-lg font-extrabold">{itemCount} ítems en carrito</p>
                  </div>
                  <div className="brand-panel-soft bg-[var(--brand-black)] px-4 py-4 text-[var(--brand-cream)]">
                    <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
                      Total actual
                    </p>
                    <p className="mt-2 text-lg font-extrabold">{formatPrice(total)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative min-h-[280px] border-t-[3px] border-[var(--brand-black)] lg:min-h-full lg:border-l-[3px] lg:border-t-0">
              {tenant.cover_url ? (
                <img src={tenant.cover_url} alt={tenant.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center bg-[var(--brand-black)] p-8 text-[var(--brand-cream)]">
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-[2rem] border-[3px] border-[var(--brand-cream)] bg-[var(--brand-orange)]">
                      <Sparkles className="size-8" />
                    </div>
                    <p className="font-display text-4xl leading-none">Sabor, ritmo y orden</p>
                    <p className="max-w-sm text-sm font-medium leading-6 text-[rgba(246,237,217,0.78)]">
                      Tu portada todavía no está cargada. Cuando la subas, esta zona puede convertirse en el
                      golpe visual principal del menú.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-8">
          {categories?.map((category: any) => {
            const availableItems = category.menu_items?.filter((item: any) => item.available) || []

            return (
              <div key={category.id} className="brand-panel bg-[var(--brand-cream)] p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-[rgba(18,13,10,0.65)]">
                      Categoría
                    </p>
                    <h2 className="font-display mt-1 text-4xl leading-none md:text-5xl">{category.name}</h2>
                  </div>
                  <div className="brand-chip px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em]">
                    {availableItems.length} opciones
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {availableItems.map((item: any) => {
                    const quantity = cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="brand-panel-soft flex w-full flex-col gap-4 bg-[var(--brand-cream-strong)] p-4 text-left transition-transform hover:-translate-y-1"
                      >
                        <div className="flex gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-display text-3xl leading-none">{item.name}</h3>
                                {item.description && (
                                  <p className="mt-3 text-sm font-medium leading-6 text-[rgba(18,13,10,0.72)]">
                                    {item.description}
                                  </p>
                                )}
                              </div>

                              {quantity > 0 && (
                                <div className="flex min-w-10 items-center justify-center rounded-full border-2 border-[var(--brand-black)] bg-[var(--tenant-primary)] px-3 py-1 text-sm font-extrabold text-[var(--brand-cream)]">
                                  {quantity}
                                </div>
                              )}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xl font-extrabold">{formatPrice(item.price)}</p>
                              <span className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--tenant-primary)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-cream)]">
                                Agregar
                              </span>
                            </div>
                          </div>

                          <div className="brand-panel-soft h-28 w-28 shrink-0 overflow-hidden rounded-[1.4rem] border-[2px] bg-[color:color-mix(in_srgb,var(--tenant-primary)_14%,white)] shadow-[4px_4px_0_var(--brand-black)]">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Utensils className="size-8" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {availableItems.length === 0 && (
                    <div className="brand-panel-soft flex min-h-44 items-center justify-center bg-[var(--brand-cream-strong)] p-6 text-center">
                      <div>
                        <Utensils className="mx-auto size-10" />
                        <p className="font-display mt-4 text-3xl leading-none">Pronto habrá algo acá</p>
                        <p className="mt-3 text-sm font-medium text-[rgba(18,13,10,0.72)]">
                          Esta categoría todavía no tiene productos disponibles.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button
                className="h-16 w-full max-w-xl rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)] px-6 text-[var(--brand-black)] shadow-[8px_8px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-cream)]"
              >
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border-2 border-[var(--brand-black)] bg-[var(--tenant-primary)] text-sm font-extrabold text-[var(--brand-cream)]">
                      {itemCount}
                    </div>
                    <div className="text-left">
                      <p className="font-display text-2xl leading-none">Tu pedido</p>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,13,10,0.65)]">
                        Ver carrito
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold">{formatPrice(total)}</span>
                    <ChevronRight className="size-5" />
                  </div>
                </div>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="bottom"
              className="mx-auto h-[84vh] max-w-3xl rounded-t-[2rem] border-x-[3px] border-t-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)] p-0 shadow-[0_-8px_0_var(--brand-black)]"
            >
              <SheetHeader className="border-b-[3px] border-[var(--brand-black)] bg-[var(--tenant-primary)] px-6 py-5">
                <SheetTitle className="font-display text-4xl leading-none text-[var(--brand-cream)]">
                  Tu pedido
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {cart.map((item) => (
                  <div key={item.id} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
                    <div className="flex items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-3xl leading-none">{item.name}</h4>
                        <p className="mt-3 text-sm font-semibold text-[rgba(18,13,10,0.72)]">
                          {formatPrice(item.price)} por unidad
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--tenant-primary)] px-2 py-1 text-[var(--brand-cream)]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] text-[var(--brand-black)] hover:bg-[var(--brand-cream)]"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-8 text-center text-base font-extrabold">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] text-[var(--brand-black)] hover:bg-[var(--brand-cream)]"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <SheetFooter className="border-t-[3px] border-[var(--brand-black)] bg-[var(--brand-cream-strong)] px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[rgba(18,13,10,0.65)]">
                        Total
                      </p>
                      <p className="font-display mt-1 text-4xl leading-none">{formatPrice(total)}</p>
                    </div>
                    <Button
                      className="h-14 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--tenant-primary)] px-8 text-base font-extrabold text-[var(--brand-cream)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--tenant-primary)]"
                      disabled={isPending || cart.length === 0}
                      onClick={handleSendOrder}
                    >
                      <ShoppingBag className="size-4" />
                      {isPending ? 'Enviando...' : 'Enviar pedido'}
                    </Button>
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}
