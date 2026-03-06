import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Utensils, QrCode, Smartphone, ChefHat } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-zinc-950 -z-10"></div>

      <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-12 md:mt-0">
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(234,88,12,0.2)]">
            <Utensils className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Comanda<span className="text-primary">App</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed text-balance">
            El sistema inteligente para restaurantes, bares y pubs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto text-left">
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
            <QrCode className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Pedidos QR</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Tus clientes piden desde su celular escaneando el código de la mesa. Sin apps ni descargas.</p>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
            <ChefHat className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">KDS en Tiempo Real</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">La cocina recibe los pedidos al instante en su pantalla, eliminando el papel y confusiones.</p>
          </div>
          <div className="bg-zinc-900/40 p-6 rounded-3xl border border-zinc-800/50 backdrop-blur-md">
            <Smartphone className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">Gestión Total</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">Administrá tu menú, mesas y reportes de ventas desde cualquier dispositivo.</p>
          </div>
        </div>

        <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pb-12">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full w-full sm:w-auto active:scale-95 transition-transform">
              Crear mi local
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full w-full sm:w-auto bg-transparent border-zinc-700 hover:bg-zinc-800 text-white active:scale-95 transition-transform">
              Ingresar al panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
