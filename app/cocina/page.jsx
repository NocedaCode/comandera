'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function CocinaPage() {
  const [pedidos, setPedidos] = useState([])
  const [audioHabilitado, setAudioHabilitado] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/notificacion.mp3')
  }, [])

  // Envolvemos reproducirSonido en useCallback para que ESLint no reclame dependencias
  const reproducirSonido = useCallback(() => {
    if (audioRef.current && audioHabilitado) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((err) => {
        console.warn('El navegador bloqueó el audio:', err)
      })
    }
  }, [audioHabilitado])

  const habilitarAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          setAudioHabilitado(true)
        })
        .catch(console.error)
    }
  }

 // Cambia la función obtenerPedidos y el useEffect para usar .neq('estado', 'entregado')
const obtenerPedidos = useCallback(async () => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .neq('estado', 'entregado')
    .neq('estado', 'archivado')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error al obtener pedidos:', error)
  } else {
    setPedidos(data || [])
  }
}, [])

  useEffect(() => {
    let active = true

    const cargarInicial = async () => {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: true })

      if (active) {
        if (error) {
          console.error('Error al obtener pedidos:', error)
        } else {
          setPedidos(data || [])
        }
      }
    }

    cargarInicial()

    const canal = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            reproducirSonido()
          }
          obtenerPedidos()
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(canal)
    }
  }, [obtenerPedidos, reproducirSonido])

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', id)

    if (error) {
      alert('Error al actualizar el estado')
    } else {
      obtenerPedidos()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {!audioHabilitado && (
        <div className="max-w-7xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/40 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <p className="text-sm text-amber-200">
              Activa las notificaciones de sonido para escuchar cuando ingresen nuevos pedidos a la cocina.
            </p>
          </div>
          <button
            onClick={habilitarAudio}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition"
          >
            Activar Sonido
          </button>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-8 border-b border-slate-700 pb-4">
        👨‍🍳 Pantalla de Cocina {audioHabilitado && <span className="text-sm font-normal text-emerald-400">🔊 (Sonido Activo)</span>}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className={`p-5 rounded-2xl border shadow-lg flex flex-col justify-between transition ${
              pedido.estado === 'pendiente'
                ? 'bg-slate-800 border-amber-500/50'
                : pedido.estado === 'listo'
                ? 'bg-slate-800/60 border-emerald-500/30'
                : 'bg-slate-800/30 border-slate-700 opacity-60'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-xl font-black text-amber-400">
                  {pedido.mesa}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    pedido.tipo_servicio === 'delivery'
                      ? 'bg-red-900/60 text-red-300 border border-red-700'
                      : 'bg-blue-900/60 text-blue-300 border border-blue-700'
                  }`}
                >
                  {pedido.tipo_servicio}
                </span>
              </div>

              <div className="border-t border-b border-slate-700/60 py-3 my-3">
                <ul className="space-y-1.5">
                  {pedido.items &&
                    pedido.items.map((item, idx) => (
                      <li key={idx} className="text-sm font-medium text-slate-200">
                        <span className="text-amber-400 font-bold">{item.cantidad}x</span>{' '}
                        {item.nombre}
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {pedido.estado === 'pendiente' && (
                <button
                  onClick={() => cambiarEstado(pedido.id, 'listo')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  ✓ Marcar Listo
                </button>
              )}
              {pedido.estado === 'listo' && (
                <button
                  onClick={() => cambiarEstado(pedido.id, 'entregado')}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2.5 rounded-xl transition"
                >
                  Entregar y Archivar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}