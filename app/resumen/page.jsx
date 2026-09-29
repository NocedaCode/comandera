'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import gsap from 'gsap'

export default function ResumenPage() {
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [totalVentas, setTotalVentas] = useState(0)
  const [cargando, setCargando] = useState(true)
  const cardRef = useRef(null)

  useEffect(() => {
    let activo = true

    async function cargarTotales() {
      setCargando(true)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .gte('created_at', hoy.toISOString())

      if (activo) {
        if (!error && data) {
          setTotalPedidos(data.length)
          const suma = data.reduce((acc, p) => acc + (p.total || 0), 0)
          setTotalVentas(suma)
        }
        setCargando(false)
      }
    }

    cargarTotales()

    return () => {
      activo = false
    }
  }, [])

  // Animación GSAP al cargar los datos
  useEffect(() => {
    if (!cargando && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
    }
  }, [cargando])

  const cerrarJornada = async () => {
    const confirmar = confirm('¿Deseas archivar todos los pedidos y limpiar la cocina para el nuevo turno?')
    if (!confirmar) return

    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'archivado' })
      .neq('estado', 'archivado')

    if (!error) {
      alert('Jornada cerrada correctamente. Los pedidos pasaron al historial.')
      setTotalPedidos(0)
      setTotalVentas(0)
    } else {
      alert('Error al cerrar la jornada')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                EL CORDÓN <span className="text-amber-400">| Resumen Diario</span>
              </h1>
              <p className="text-xs text-slate-400">Totales del día actual</p>
            </div>
          </div>
        </header>

        {/* Tarjetas de Métricas */}
        {cargando ? (
          <div className="text-center py-20 text-slate-400 animate-pulse text-sm">
            Calculando métricas del día...
          </div>
        ) : (
          <div ref={cardRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Pedidos del día */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Comandas Hoy</span>
                <h2 className="text-5xl font-black text-amber-400 mt-2">{totalPedidos}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-4">Pedidos registrados desde las 00:00 hs</p>
            </div>

            {/* Total ventas */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ventas Estimadas</span>
                <h2 className="text-5xl font-black text-emerald-400 mt-2">${totalVentas.toFixed(2)}</h2>
              </div>
              <p className="text-slate-500 text-xs mt-4">Suma acumulada del turno de hoy</p>
            </div>
          </div>
        )}
      </div>

      {/* Botón de Cierre de Jornada */}
      <div className="max-w-4xl mx-auto w-full mt-10">
        <button
          onClick={cerrarJornada}
          className="w-full bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white font-bold py-4 rounded-2xl transition-all shadow-lg text-sm uppercase tracking-wider"
        >
          🧹 Cerrar Turno / Archivar Comandas
        </button>
      </div>
    </div>
  )
}