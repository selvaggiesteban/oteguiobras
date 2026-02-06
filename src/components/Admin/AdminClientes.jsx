import { useState, useEffect } from 'react';
import { FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaImage } from 'react-icons/fa';
import { useToast } from '../Toast';
import { 
  getClientes, 
  loadClientes, 
  agregarCliente, 
  eliminarCliente, 
  reordenarClientes,
  subirLogoCliente,
  cargarDatosDemo 
} from '../../data/clientesData';
import './AdminClientes.css';

function AdminClientes() {
  const toast = useToast();
  const [clientes, setClientes] = useState(getClientes());
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', logoUrl: '' });
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const clientesCargados = await loadClientes();
      setClientes(clientesCargados);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('El archivo es muy grande. Máximo 2MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten imágenes.');
        return;
      }
      setArchivoSeleccionado(file);
    }
  };

  const handleAgregarCliente = async () => {
    if (!nuevoCliente.nombre.trim()) {
      toast.warning('Ingresa el nombre del cliente');
      return;
    }

    if (!archivoSeleccionado) {
      toast.warning('Selecciona una imagen del logo');
      return;
    }

    setSubiendo(true);
    try {
      // Subir imagen a Firebase Storage
      const logoUrl = await subirLogoCliente(archivoSeleccionado, nuevoCliente.nombre);
      
      // Agregar cliente con la URL del logo
      const clientesActualizados = await agregarCliente({
        nombre: nuevoCliente.nombre,
        logoUrl: logoUrl
      });
      
      setClientes(clientesActualizados);
      setNuevoCliente({ nombre: '', logoUrl: '' });
      setArchivoSeleccionado(null);
      
      // Limpiar input file
      document.getElementById('file-input').value = '';
      
      toast.success('Cliente agregado exitosamente!');
    } catch (error) {
      toast.error('Error al agregar cliente: ' + error.message);
    } finally {
      setSubiendo(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const clientesActualizados = await eliminarCliente(id);
        setClientes(clientesActualizados);
        toast.success('Cliente eliminado!');
      } catch (error) {
        toast.error('Error al eliminar: ' + error.message);
      }
    }
  };

  const handleMoverArriba = async (index) => {
    if (index === 0) return;
    
    const nuevosClientes = [...clientes];
    [nuevosClientes[index - 1], nuevosClientes[index]] = 
    [nuevosClientes[index], nuevosClientes[index - 1]];
    
    try {
      const clientesActualizados = await reordenarClientes(nuevosClientes);
      setClientes(clientesActualizados);
    } catch (error) {
      toast.error('Error al reordenar: ' + error.message);
    }
  };

  const handleMoverAbajo = async (index) => {
    if (index === clientes.length - 1) return;
    
    const nuevosClientes = [...clientes];
    [nuevosClientes[index], nuevosClientes[index + 1]] = 
    [nuevosClientes[index + 1], nuevosClientes[index]];
    
    try {
      const clientesActualizados = await reordenarClientes(nuevosClientes);
      setClientes(clientesActualizados);
    } catch (error) {
      toast.error('Error al reordenar: ' + error.message);
    }
  };

  const handleCargarDemo = async () => {
    if (window.confirm('⚠️ ¿Cargar clientes de ejemplo?\n\nEsto reemplazará todos los clientes actuales.')) {
      setCargandoDemo(true);
      try {
        const clientesDemo = await cargarDatosDemo();
        setClientes(clientesDemo);
        toast.success('Clientes demo cargados!');
      } catch (error) {
        toast.error('Error: ' + error.message);
      } finally {
        setCargandoDemo(false);
      }
    }
  };

  if (cargando) {
    return (
      <div className="admin-clientes">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>⏳ Cargando clientes desde Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-clientes">
      <div className="admin-header">
        <div>
          <h2>🏢 Gestión de Clientes</h2>
          <p>Administra los logos que aparecen en el carrusel del Home</p>
        </div>
        <button 
          className="btn-demo"
          onClick={handleCargarDemo}
          disabled={cargandoDemo}
        >
          {cargandoDemo ? '⏳ Cargando...' : '📦 Cargar Clientes Demo'}
        </button>
      </div>

      {/* Agregar nuevo cliente */}
      <div className="agregar-cliente-form">
        <h3><FaPlus /> Agregar Nuevo Cliente</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Nombre del Cliente</label>
            <input
              type="text"
              value={nuevoCliente.nombre}
              onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
              placeholder="Ej: Mostaza, UOM, etc."
            />
          </div>
          <div className="form-group">
            <label>Logo (imagen)</label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleArchivoChange}
            />
            <small className="recomendacion">
              📐 Tamaño recomendado: 400x250px (ratio 16:9) • Peso máximo: 2MB • Formatos: JPG, PNG, SVG
            </small>
          </div>
          <button 
            className="btn-agregar"
            onClick={handleAgregarCliente}
            disabled={subiendo}
          >
            {subiendo ? '⏳ Subiendo...' : <><FaPlus /> Agregar Cliente</>}
          </button>
        </div>
        
        {archivoSeleccionado && (
          <div className="preview-archivo">
            <FaImage /> {archivoSeleccionado.name} ({(archivoSeleccionado.size / 1024).toFixed(2)} KB)
          </div>
        )}
      </div>

      {/* Lista de clientes */}
      <div className="clientes-list">
        <h3>Clientes Actuales ({clientes.length})</h3>
        {clientes.length === 0 ? (
          <p className="no-clientes">No hay clientes. Agrega uno nuevo arriba.</p>
        ) : (
          <div className="clientes-grid">
            {clientes.map((cliente, index) => (
              <div key={cliente.id} className="cliente-card">
                <div className="cliente-logo">
                  <img src={cliente.logoUrl} alt={cliente.nombre} />
                </div>
                <div className="cliente-info">
                  <h4>{cliente.nombre}</h4>
                  <span className="cliente-orden">Orden: {index + 1}</span>
                </div>
                <div className="cliente-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleMoverArriba(index)}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => handleMoverAbajo(index)}
                    disabled={index === clientes.length - 1}
                    title="Mover abajo"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleEliminar(cliente.id)}
                    title="Eliminar"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-info">
        <h4>ℹ️ Información</h4>
        <ul>
          <li>Los logos se muestran en un carrusel infinito en el Home</li>
          <li>Las imágenes se suben a Firebase Storage</li>
          <li>Usa logos en formato PNG con fondo transparente para mejor resultado</li>
          <li>Tamaño recomendado: 200x100px</li>
          <li>Los logos aparecen en escala de grises y se colorean al hacer hover</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminClientes;
