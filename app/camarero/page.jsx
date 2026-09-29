'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CamareroPage() {
  const [conexionOK, setConexionOK] = useState(null)
  const [mesa, setMesa] = useState('')
  const [tipoServicio, setTipoServicio] = useState('aqui')
  const [productoNombre, setProductoNombre] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [carrito, setCarrito] = useState([])
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function probarConexion() {
      try {
        const { error } = await supabase.from('pedidos').select('id').limit(1)
        if (error) {
          console.error('Error de conexión:', error)
          setConexionOK(false)
        } else {
          setConexionOK(true)
        }
      } catch (err) {
        console.error(err)
        setConexionOK(false)
      }
    }
    probarConexion()
  }, [])

  const agregarAlCarrito = () => {
    if (!productoNombre.trim()) return
    setCarrito([...carrito, { nombre: productoNombre, cantidad: Number(cantidad) }])
    setProductoNombre('')
    setCantidad(1)
  }

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index))
  }

  const enviarPedido = async () => {
    if (!mesa.trim()) return alert('Por favor ingresa el número de mesa o cliente')
    if (carrito.length === 0) return alert('Agrega al menos un producto')

    setEnviando(true)
    const { error } = await supabase.from('pedidos').insert([
      {
        mesa: mesa,
        tipo_servicio: tipoServicio,
        items: carrito,
        estado: 'pendiente'
      }
    ])

    setEnviando(false)

    if (error) {
      alert('Error al enviar el pedido: ' + error.message)
    } else {
      alert('¡Pedido enviado con éxito a la cocina!')
      setCarrito([])
      setMesa('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 max-w-md mx-auto">
      {/* Estado de Conexión */}
      <div className="mb-4 text-center">
        {conexionOK === null && (
          <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-semibold">
            Verificando conexión...
          </span>
        )}
        {conexionOK === true && (
          <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
            🟢 Base de Datos Conectada
          </span>
        )}
        {conexionOK === false && (
          <span className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
            🔴 Error de Conexión
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Toma de Pedidos</h1>

      {/* Tipo de Servicio */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTipoServicio('aqui')}
          className={`flex-1 py-3 font-bold rounded-xl text-sm border transition ${
            tipoServicio === 'aqui'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          🍽️ Comer Aquí
        </button>
        <button
          onClick={() => setTipoServicio('delivery')}
          className={`flex-1 py-3 font-bold rounded-xl text-sm border transition ${
            tipoServicio === 'delivery'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-slate-700 border-slate-300'
          }`}
        >
          🛵 Delivery / Llevar
        </button>
      </div>

      {/* Mesa / Cliente */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
          {tipoServicio === 'aqui' ? 'Número de Mesa' : 'Nombre del Cliente / Delivery'}
        </label>
        <input
          type="text"
          placeholder={tipoServicio === 'aqui' ? 'Ejemplo: Mesa 4' : 'Ejemplo: Carlos (Delivery)'}
          value={mesa}
          onChange={(e) => setMesa(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Inputs de Productos */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-700 mb-3">Agregar Item al Pedido</h2>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Ej: Hamburguesa Especial"
            value={productoNombre}
            onChange={(e) => setProductoNombre(e.target.value)}
            className="flex-1 p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white text-sm"
          />
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-16 p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white text-center text-sm font-bold"
          />
        </div>
        <button
          onClick={agregarAlCarrito}
          className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-bold active:scale-95 transition"
        >
          + Agregar al Carrito
        </button>
      </div>

      {/* Carrito */}
      {carrito.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-2">Resumen de la Comanda:</h2>
          <ul className="divide-y divide-slate-100">
            {carrito.map((item, idx) => (
              <li key={idx} className="py-2 flex justify-between items-center text-slate-800 text-sm">
                <span>
                  <strong>{item.cantidad}x</strong> {item.nombre}
                </span>
                <button
                  onClick={() => eliminarDelCarrito(idx)}
                  className="text-red-500 font-bold px-2 py-1 text-xs"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón de Enviar */}
      <button
        onClick={enviarPedido}
        disabled={enviando}
        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition disabled:opacity-50"
      >
        {enviando ? 'Enviando...' : '🚀 Enviar Pedido a Cocina'}
      </button>
    </div>
  )
}