import Link from 'next/link'
import { ArrowRight, ChefHat, QrCode, Sparkles, Store, TabletSmartphone } from 'lucide-react'

import { Button } from '@/components/ui/button'

const highlights = [
  {
    icon: QrCode,
    title: 'Menu QR con presencia',
    description: 'Tus clientes escanean, piden y sienten una marca con personalidad desde el primer toque.',
  },
  {
    icon: ChefHat,
    title: 'KDS en vivo',
    description: 'La cocina recibe pedidos al instante, ordenados y listos para servicio sin papel.',
  },
  {
    icon: TabletSmartphone,
    title: 'Panel simple',
    description: 'Gestiona carta, mesas y branding desde cualquier dispositivo sin depender de hardware caro.',
  },
]

const metrics = [
  { label: 'Experiencia', value: 'QR + KDS' },
  { label: 'Enfoque', value: 'Locales chicos' },
  { label: 'Estilo', value: 'Retro-pop' },
]

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--brand-orange)] text-[var(--brand-black)]">
      <div className="brand-grid absolute inset-0 opacity-25" />
      <div className="absolute -left-16 top-24 h-52 w-52 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-yellow)]" />
      <div className="absolute right-[-4.5rem] top-36 h-40 w-40 rounded-[2rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-red)] rotate-12" />
      <div className="absolute bottom-12 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)]/30 backdrop-blur-sm" />

      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-6 py-8 md:px-10 lg:py-12">
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
              Pedidos QR para bares, restos y pubs
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-6xl md:text-7xl lg:text-[6.4rem]">
                <span className="brand-display-shadow block">COMANDA</span>
                <span className="font-display mt-3 block text-4xl leading-none md:text-5xl lg:text-[3.6rem]">
                  operación eficiente con una estética que sí se recuerda
                </span>
              </h1>
              <p className="max-w-2xl text-base font-medium leading-7 text-[color:color-mix(in_srgb,var(--brand-black)_78%,white)] md:text-lg">
                Deja atrás la plantilla SaaS genérica. COMANDA está pensada para que el local funcione mejor
                y además tenga una presencia visual cálida, fuerte y propia.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full border-2 border-[var(--brand-black)] bg-[var(--brand-cream)] px-8 text-base font-extrabold text-[var(--brand-black)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-cream)]"
              >
                <Link href="/auth/register">
                  Crear mi local
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-2 border-[var(--brand-black)] bg-transparent px-8 text-base font-extrabold text-[var(--brand-black)] shadow-[6px_6px_0_var(--brand-black)] transition-transform hover:-translate-y-0.5 hover:bg-[var(--brand-black)] hover:text-[var(--brand-cream)]"
              >
                <Link href="/admin/settings">Ver branding</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="brand-panel-soft bg-[var(--brand-cream)] px-5 py-4"
                >
                  <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-extrabold">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="brand-panel relative overflow-hidden bg-[var(--brand-cream)] p-4 sm:p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,191,75,0.45),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(221,72,56,0.24),transparent_32%)]" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-[1.6rem] border-[3px] border-[var(--brand-black)] bg-[var(--brand-black)] p-5 text-[var(--brand-cream)]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-yellow)]">
                    Experiencia de marca
                  </p>
                  <h2 className="font-display mt-3 text-4xl leading-none">Tu carta ya no se ve común</h2>
                </div>
                <div className="rounded-full border-2 border-[var(--brand-cream)] p-3">
                  <Sparkles className="size-5" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[0.92fr_1.08fr]">
                <div className="brand-panel-soft bg-[var(--brand-yellow)] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl border-[3px] border-[var(--brand-black)] bg-[var(--brand-cream)]">
                      <Store className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[color:color-mix(in_srgb,var(--brand-black)_65%,white)]">
                        Para tu local
                      </p>
                      <p className="font-display text-3xl leading-none">más carácter</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium leading-6">
                    Bordes redondeados, block shadows y una paleta cálida que transmite sabor, energía y
                    orden.
                  </p>
                </div>

                <div className="brand-panel-soft bg-[var(--brand-cream)] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--brand-orange-deep)]">
                      Lo que resuelve
                    </p>
                    <div className="brand-chip px-3 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.14em]">
                      SaaS gastronómico
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {highlights.map(({ icon: Icon, title, description }) => (
                      <div
                        key={title}
                        className="rounded-[1.35rem] border-2 border-[var(--brand-black)] bg-[color:color-mix(in_srgb,var(--brand-orange)_12%,white)] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 items-center justify-center rounded-2xl border-2 border-[var(--brand-black)] bg-[var(--brand-cream)]">
                            <Icon className="size-5" />
                          </div>
                          <h3 className="font-display text-2xl leading-none">{title}</h3>
                        </div>
                        <p className="mt-3 text-sm font-medium leading-6">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
