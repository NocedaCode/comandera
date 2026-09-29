import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-extrabold mb-2 text-amber-400">El Cordón y La Rosa 🌹</h1>
      <p className="text-slate-400 mb-8 max-w-sm">Sistema de Comandera y Control de Cocina en Tiempo Real</p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Link 
          href="/camarero"
          className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-4 rounded-2xl shadow-lg transition text-center"
        >
          📝 Modo Camarero
        </Link>

        <Link 
          href="/cocina"
          className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-4 rounded-2xl shadow-lg transition text-center"
        >
          👨‍🍳 Modo Cocina
        </Link>
      </div>
    </div>
  );
}// Version 2