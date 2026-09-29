'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResumenPage() {
  const [totalVentas, setTotalVentas] = useState(0)
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [cargando, setCargando] = useState(true)

  const cargarTotales = async () => {
    setCargando(true)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .gte('created_at', hoy.toISOString())

    if (!error && data) {
      setTotalPedidos(data.length)
      const suma = data.reduce((acc, p) => acc + (p.total || 0), 0)
      setTotalVentas(suma)
    }
    setCargando(false)
  }

  useEffect(() => {
    let activo = true

    async function obtenerDatos() {
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

    obtenerDatos()

    return () => {
      activo = false
    }
  }, [])

  const cerrarJornada = async () => {
    const confirmar = confirm("¿Deseas archivar los pedidos y limpiar la pantalla de cocina para el nuevo turno?")
    if (!confirmar) return

    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'archivado' })
      .neq('estado', 'archivado')

    if (error) {
      alert("Error al cerrar la jornada: " + error.message)
    } else {
      alert("¡Jornada cerrada con éxito! La cocina ha quedado limpia.")
      cargarTotales()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 max-w-md mx-auto font-sans">
      <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">📊 Cierre de Caja y Totales</h1>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">Total Pedidos de Hoy</p>
          <p className="text-3xl font-black text-slate-800">{cargando ? "..." : totalPedidos}</p>
        </div>
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-bold text-slate-400 uppercase">Monto Total Facturado</p>
          <p className="text-3xl font-black text-emerald-600">${cargando ? "..." : totalVentas.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={cargarTotales}
          className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm"
        >
          🔄 Actualizar Totales
        </button>

        <button
          onClick={cerrarJornada}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-sm shadow-md"
        >
          🧹 Cerrar Jornada y Limpiar Cocina
        </button>
      </div>
    </div>
  )
}