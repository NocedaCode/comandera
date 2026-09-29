'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import gsap from 'gsap'

export default function CamareroPage() {
  const [mesa, setMesa] = useState('')
  const [cliente, setCliente] = useState('')
  const [detalle, setDetalle] = useState('')
  const [total, setTotal] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState(false)

  const cardRef = useRef(null)

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' })
    }
  }, [])

  const enviarPedido = async (e) => {
    e.preventDefault()
    if (!mesa || !detalle) {
      alert("Por favor ingresa la mesa y los detalles del pedido.")
      return
    }

    setEnviando(true)

    const { error } = await supabase.from('pedidos').insert([
      {
        mesa,
        cliente: cliente || `Mesa ${mesa}`,
        detalle,
        total: parseFloat(total) || 0,
        estado: 'pendiente'
      }
    ])

    setEnviando(false)

    if (error) {
      alert("Error al enviar el pedido: " + error.message)
    } else {
      setMesa('')
      setCliente('')
      setDetalle('')
      setTotal('')
      setMensajeExito(true)

      setTimeout(() => setMensajeExito(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 md:p-6 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2 rounded-xl text-slate-950 font-black shadow-md">
            🥖
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">EL CORDÓN</h1>
            <p className="text-xs font-semibold text-amber-600">Nuevo Pedido / Camarero</p>
          </div>
        </div>
      </header>

      {/* Formulario principal */}
      <div ref={cardRef} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        {mensajeExito && (
          <div className="bg-emerald-500 text-white p-3 rounded-2xl text-xs font-bold text-center animate-bounce">
            ✅ ¡Comanda enviada a cocina con éxito!
          </div>
        )}

        <form onSubmit={enviarPedido} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">N° de Mesa *</label>
              <input
                type="text"
                placeholder="Ej: 4"
                value={mesa}
                onChange={(e) => setMesa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cliente (Opcional)</label>
              <input
                type="text"
                placeholder="Nombre"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Detalle de Comanda *</label>
            <textarea
              rows={4}
              placeholder="Ej: 2x Hamburguesas sin cebolla&#10;1x Refresco de Cola"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Monto Total ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-lg font-black text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-400/30 active:scale-95 disabled:opacity-50 mt-2"
          >
            {enviando ? "Enviando..." : "🚀 Enviar Comanda a Cocina"}
          </button>
        </form>
      </div>
    </div>
  )
}