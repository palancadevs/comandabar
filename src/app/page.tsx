import Link from 'next/link'
import { ArrowRight, BadgeDollarSign, ChefHat, Clock3, QrCode, ReceiptText, Sparkles, TabletSmartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'

const pains = [
  {
    icon: Clock3,
    title: 'Menos idas y vueltas',
    description: 'El cliente escanea, mira la carta y hace el pedido desde su mesa sin esperar al mozo para arrancar.',
  },
  {
    icon: ReceiptText,
    title: 'Menos errores de comanda',
    description: 'La cocina recibe el pedido claro, en tiempo real y sin el ruido del papel, el WhatsApp o la memoria.',
  },
  {
    icon: TabletSmartphone,
    title: 'Más control del local',
    description: 'Tienes mesas, carta y operación ordenadas desde un panel simple que funciona en cualquier dispositivo.',
  },
]

const flow = [
  {
    step: '01',
    title: 'Tus clientes escanean el QR',
    description: 'Entran al menú del local sin descargar ninguna app ni pedir ayuda.',
  },
  {
    step: '02',
    title: 'El pedido llega a cocina al instante',
    description: 'Cada pedido entra ordenado al KDS para que el equipo prepare y entregue sin confusiones.',
  },
  {
    step: '03',
    title: 'Tú operas mejor y vendes con más orden',
    description: 'Menos fricción en la atención, menos caos operativo y una experiencia más profesional para el cliente.',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--brand-orange)] text-[var(--brand-black)]">
      <div className="brand-grid absolute inset-0 opacity-25" />
      <div className="absolute -left-16 top-24 h-52 w-52 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-yellow)]" />
      <div className="absolute right-[-4.5rem] top-36 h-40 w-40 rounded-[2rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-red)] rotate-12" />
      <div className="absolute bottom-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)]/30 backdrop-blur-sm" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-8 md:px-10 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="brand-chip px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em]">
            COMANDA
          </div>
          <Link
            href="/auth/login"
            className="rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-5 py-2 text-sm font-bold shadow-[4px_4px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5"
          >
            Ingresar al panel
          </Link>
        </header>

        <section className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-7">
            <div className="brand-chip inline-flex px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em]">
              SaaS para locales gastronómicos
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-6xl md:text-7xl lg:text-[6.3rem]">
                <span className="brand-display-shadow block">COMANDA</span>
                <span className="font-display mt-3 block text-4xl leading-none md:text-5xl lg:text-[3.4rem]">
                  pedidos QR y cocina en tiempo real para atender mejor y vender con menos caos
                </span>
              </h1>
              <p className="max-w-2xl text-base font-medium leading-7 text-[color:color-mix(in_srgb,var(--brand-black)_78%,white)] md:text-lg">
                Si hoy tu local depende del papel, del mozo y de la memoria para tomar pedidos, estás
                perdiendo tiempo, claridad y capacidad de atención. COMANDA ordena ese circuito desde la
                mesa hasta la cocina.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-8 text-base font-extrabold text-[var(--brand-black)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-cream)]"
              >
                <Link href="/auth/register">
                  Probar gratis 1 mes
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-2 border-[var(--brand-black)] bg-transparent px-8 text-base font-extrabold text-[var(--brand-black)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-black)] hover:text-[var(--brand-cream)]"
              >
                <Link href="/auth/login">Ya tengo cuenta</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="brand-panel-soft bg-[var(--brand-cream)] px-5 py-4">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                  Precio
                </p>
                <p className="mt-2 text-lg font-extrabold">$40.000/mes</p>
              </div>
              <div className="brand-panel-soft bg-[var(--brand-cream)] px-5 py-4">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                  Prueba
                </p>
                <p className="mt-2 text-lg font-extrabold">Primer mes gratis</p>
              </div>
              <div className="brand-panel-soft bg-[var(--brand-cream)] px-5 py-4">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                  Ideal para
                </p>
                <p className="mt-2 text-lg font-extrabold">Bares, pubs y restos</p>
              </div>
            </div>
          </div>

          <div className="brand-panel relative overflow-hidden bg-[var(--brand-cream)] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,191,75,0.45),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(221,72,56,0.24),transparent_32%)]" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-[1.6rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-black)] p-5 text-[var(--brand-cream)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
                    Qué resuelve
                  </p>
                  <h2 className="font-display mt-3 text-4xl leading-none">menos fricción en salón, más claridad en cocina</h2>
                </div>
                <div className="rounded-full border-2 border-[var(--brand-cream)] p-3">
                  <Sparkles className="size-5" />
                </div>
              </div>

              <div className="grid gap-4">
                {pains.map(({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="brand-panel-soft bg-[color:color-mix(in_srgb,var(--brand-orange)_12%,white)] p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)]">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-display text-3xl leading-none">{title}</h3>
                    </div>
                    <p className="mt-4 text-sm font-medium leading-6">{description}</p>
                  </div>
                ))}
              </div>

              <div className="brand-panel-soft bg-[var(--brand-yellow)] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)]">
                    <BadgeDollarSign className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[color:color-mix(in_srgb,var(--brand-black)_70%,white)]">
                      Oferta de lanzamiento
                    </p>
                    <p className="font-display text-3xl leading-none">$40.000 al mes después de la prueba</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium leading-6">
                  Entras sin riesgo: usas COMANDA gratis el primer mes y, cuando esté activo el cobro,
                  podrás continuar con un link de pago para mantener la suscripción.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-panel bg-[var(--brand-cream)] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                Cómo funciona
              </p>
              <h2 className="font-display mt-2 text-4xl leading-none md:text-5xl">
                del QR a la cocina sin pasos de más
              </h2>
            </div>
            <div className="brand-chip px-4 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.18em]">
              Sin app para el cliente
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {flow.map(({ step, title, description }) => (
              <div key={step} className="brand-panel-soft bg-[var(--brand-cream-strong)] p-5">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[var(--brand-orange-deep)]">
                  Paso {step}
                </p>
                <h3 className="font-display mt-3 text-3xl leading-none">{title}</h3>
                <p className="mt-4 text-sm font-medium leading-6">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="brand-panel bg-[var(--brand-black)] p-6 text-[var(--brand-cream)] md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
              Lo que obtiene el dueño
            </p>
            <h2 className="font-display mt-3 text-4xl leading-none md:text-5xl">
              una operación más prolija desde el día uno
            </h2>
            <div className="mt-6 space-y-4 text-sm font-medium leading-6 text-[rgba(246,237,217,0.82)]">
              <p>Menos tiempo tomando pedidos manualmente.</p>
              <p>Menos errores entre salón y cocina.</p>
              <p>Más capacidad para atender mesas sin sumar desorden.</p>
              <p>Un sistema más accesible que los softwares gastronómicos tradicionales.</p>
            </div>
          </div>

          <div className="brand-panel bg-[var(--brand-cream)] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                  Plan actual
                </p>
                <h2 className="font-display mt-2 text-4xl leading-none md:text-5xl">
                  primer mes gratis, luego $40.000 por mes
                </h2>
              </div>
              <div className="flex size-14 items-center justify-center rounded-[1.25rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-yellow)]">
                <QrCode className="size-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
                <div className="flex items-center gap-3">
                  <ChefHat className="size-5" />
                  <p className="font-semibold">Menú QR para clientes</p>
                </div>
              </div>
              <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
                <div className="flex items-center gap-3">
                  <ReceiptText className="size-5" />
                  <p className="font-semibold">Pantalla de cocina en tiempo real</p>
                </div>
              </div>
              <div className="brand-panel-soft bg-[var(--brand-cream-strong)] p-4">
                <div className="flex items-center gap-3">
                  <TabletSmartphone className="size-5" />
                  <p className="font-semibold">Panel para carta, mesas y configuración</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-orange)] px-8 text-base font-extrabold text-[var(--brand-cream)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-orange)]"
              >
                <Link href="/auth/register">
                  Quiero probar COMANDA
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
