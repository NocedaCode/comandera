'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function HomePage() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div ref={containerRef} className="max-w-md w-full space-y-6 text-center">
        {/* Identidad de Marca */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-400 rounded-3xl shadow-xl shadow-amber-500/20 text-slate-950 font-black text-4xl mb-2">
            🥖
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            EL CORDÓN
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Sistema de Comandas & Caja
          </p>
        </div>

        {/* Seleccionar Módulo */}
        <div className="space-y-3 pt-4">
          <Link
            href="/camarero"
            className="block w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 p-5 rounded-2xl transition-all shadow-lg text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  📝 Modo Camarero
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Tomar nuevos pedidos por mesa</p>
              </div>
              <span className="text-amber-400 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            href="/cocina"
            className="block w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 p-5 rounded-2xl transition-all shadow-lg text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  👨‍🍳 Modo Cocina
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Gestionar comanda en tiempo real</p>
              </div>
              <span className="text-amber-400 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link
            href="/resumen"
            className="block w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 p-5 rounded-2xl transition-all shadow-lg text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  📊 Resumen de Caja
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Ventas del día y cierre de turno</p>
              </div>
              <span className="text-amber-400 font-bold text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}