'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import gsap from 'gsap'

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [verArchivados, setVerArchivados] = useState(false)
  const contenedorRef = useRef(null)

  const cargarPedidos = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setPedidos(data)
    }
    setCargando(false)
  }

  useEffect(() => {
    let activo = true

    async function obtenerIniciales() {
      setCargando(true)
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: true })

      if (activo) {
        if (!error && data) {
          setPedidos(data)
        }
        setCargando(false)
      }
    }

    obtenerIniciales()

    const canal = supabase
      .channel('pedidos-cocina')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        cargarPedidos()
      })
      .subscribe()

    return () => {
      activo = false
      supabase.removeChannel(canal)
    }
  }, [])

  // Animación GSAP al cargar tarjetas
  useEffect(() => {
    if (!cargando && contenedorRef.current && contenedorRef.current.children.length > 0) {
      gsap.fromTo(
        contenedorRef.current.children,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      )
    }
  }, [cargando, verArchivados])

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (!error) cargarPedidos()
  }

  const pedidosFiltrados = pedidos.filter(p => {
    if (verArchivados) return p.estado === 'archivado'
    return p.estado !== 'archivado'
  })

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6">
      {/* Header Estilizado */}
      <header className="flex flex-col sm:flex-row justify-between items-center pb-6 border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 p-2 rounded-xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
            🥖
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              EL CORDÓN <span className="text-amber-400">| Cocina</span>
            </h1>
            <p className="text-xs text-slate-400">Control de comandas en tiempo real</p>
          </div>
        </div>

        {/* Botón conmutador Archivados / Activos */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setVerArchivados(false)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              !verArchivados
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 Activos ({pedidos.filter(p => p.estado !== 'archivado').length})
          </button>
          <button
            onClick={() => setVerArchivados(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              verArchivados
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 Historial Archivados ({pedidos.filter(p => p.estado === 'archivado').length})
          </button>
        </div>
      </header>

      {/* Grid de Pedidos */}
      {cargando ? (
        <div className="flex justify-center items-center py-20 text-slate-400">
          <p className="animate-pulse text-sm font-semibold">Cargando comandas...</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500 font-medium text-sm">
            {verArchivados ? 'No hay pedidos en el historial de archivados.' : 'No hay comandas pendientes en cocina.'}
          </p>
        </div>
      ) : (
        <div ref={contenedorRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className={`bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xl ${
                pedido.estado === 'listo'
                  ? 'border-emerald-500/50 bg-slate-900/90'
                  : pedido.estado === 'archivado'
                  ? 'border-slate-800 opacity-75'
                  : 'border-amber-500/40'
              }`}
            >
              <div>
                {/* Cabecera Tarjeta */}
                <div className={`p-4 border-b flex justify-between items-center ${
                  pedido.estado === 'listo'
                    ? 'bg-emerald-950/40 border-emerald-500/20'
                    : 'bg-slate-800/50 border-slate-800'
                }`}>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Mesa / Cliente</span>
                    <h3 className="text-lg font-black text-white">{pedido.cliente || `Mesa ${pedido.mesa}`}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    pedido.estado === 'listo'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : pedido.estado === 'archivado'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {pedido.estado}
                  </span>
                </div>

                {/* Items del Pedido */}
                <div className="p-4 space-y-2">
                  {pedido.items && Array.isArray(pedido.items) ? (
                    pedido.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm border-b border-slate-800/50 pb-2 last:border-0">
                        <span className="font-bold text-amber-400 mr-2">{item.cantidad || 1}x</span>
                        <span className="flex-1 text-slate-200">{item.nombre}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-300 whitespace-pre-line">{pedido.detalle}</p>
                  )}
                  {pedido.notas && (
                    <p className="text-xs bg-amber-950/30 text-amber-200/80 p-2 rounded-lg border border-amber-500/20 mt-2">
                      📝 {pedido.notas}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              {pedido.estado !== 'archivado' && (
                <div className="p-3 bg-slate-950/50 border-t border-slate-800 flex gap-2">
                  {pedido.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'preparando')}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-amber-500/10"
                    >
                      👨‍🍳 Preparar
                    </button>
                  )}
                  {pedido.estado === 'preparando' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'listo')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/10"
                    >
                      ✅ Marcar Listo
                    </button>
                  )}
                  {pedido.estado === 'listo' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'archivado')}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                    >
                      📦 Archivar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}