import { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { getObrasDestacadas, actualizarObrasDestacadas, loadObrasDestacadas, cargarDatosDemo } from '../../data/obrasDestacadasData';
import './AdminObrasDestacadas.css';

function AdminObrasDestacadas() {
  const toast = useToast();
  const [obras, setObras] = useState(getObrasDestacadas());
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoDemo, setCargandoDemo] = useState(false);

  // Cargar obras desde Firebase al montar
  useEffect(() => {
    const cargarObras = async () => {
      setCargando(true);
      const obrasCargadas = await loadObrasDestacadas();
      setObras(obrasCargadas);
      setCargando(false);
    };
    cargarObras();
  }, []);

  const handleInputChange = (id, campo, valor) => {
    setObras(prev => prev.map(obra => 
      obra.id === id ? { ...obra, [campo]: valor } : obra
    ));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarObrasDestacadas(obras);
      toast.success('Obras destacadas guardadas exitosamente!');
    } catch (error) {
      toast.error('Error al guardar las obras: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCargarDemo = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de cargar las obras demo?\n\nEsto sobrescribirá las obras destacadas actuales con los ejemplos.')) {
      setCargandoDemo(true);
      try {
        const obrasDemo = await cargarDatosDemo();
        setObras(obrasDemo);
        toast.success('Obras demo cargadas exitosamente!');
      } catch (error) {
        toast.error('Error al cargar obras demo: ' + error.message);
      } finally {
        setCargandoDemo(false);
      }
    }
  };

  if (cargando) {
    return (
      <div className="admin-obras-destacadas">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>⏳ Cargando obras destacadas desde Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-obras-destacadas">
      <div className="admin-header">
        <div>
          <h2>🏗️ Gestión de Obras Destacadas</h2>
          <p>Administra las 4 obras destacadas que aparecen en el Home</p>
        </div>
        <button 
          className="btn-demo"
          onClick={handleCargarDemo}
          disabled={cargandoDemo}
        >
          {cargandoDemo ? '⏳ Cargando...' : '📦 Cargar Obras Demo'}
        </button>
      </div>

      <div className="obras-destacadas-list">
        {obras.map((obra, index) => (
          <div key={obra.id} className="obra-destacada-form">
            <h3>Obra Destacada #{index + 1}</h3>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Título de la obra</label>
                <input
                  type="text"
                  value={obra.titulo}
                  onChange={(e) => handleInputChange(obra.id, 'titulo', e.target.value)}
                  placeholder="Ej: Hicimos reformas en el Secretariado Nacional de la UOM"
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={obra.categoria}
                  onChange={(e) => handleInputChange(obra.id, 'categoria', e.target.value)}
                >
                  <option value="Retail / Comercial">Retail / Comercial</option>
                  <option value="Oficinas">Oficinas</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Bancos">Bancos</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  value={obra.ubicacion}
                  onChange={(e) => handleInputChange(obra.id, 'ubicacion', e.target.value)}
                  placeholder="Ej: Buenos Aires"
                />
              </div>

              <div className="form-group">
                <label>Metros Cuadrados</label>
                <input
                  type="text"
                  value={obra.metroCuadrados}
                  onChange={(e) => handleInputChange(obra.id, 'metroCuadrados', e.target.value)}
                  placeholder="Ej: 2,500"
                />
              </div>

              <div className="form-group">
                <label>Año</label>
                <input
                  type="number"
                  value={obra.año}
                  onChange={(e) => handleInputChange(obra.id, 'año', parseInt(e.target.value) || 2024)}
                  placeholder="2024"
                />
              </div>

              <div className="form-group full-width">
                <label>Descripción</label>
                <textarea
                  value={obra.descripcion}
                  onChange={(e) => handleInputChange(obra.id, 'descripcion', e.target.value)}
                  placeholder="Descripción breve de la obra..."
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label>URL de la Imagen</label>
                <input
                  type="text"
                  value={obra.imagen}
                  onChange={(e) => handleInputChange(obra.id, 'imagen', e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small className="recomendacion">
                  📐 Tamaño recomendado: 800x600px (ratio 4:3) • Peso óptimo: 200-500KB • Formatos: JPG, WebP
                </small>
                {obra.imagen && (
                  <div className="image-preview">
                    <img src={obra.imagen} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button onClick={handleGuardar} className="btn-guardar" disabled={guardando}>
          {guardando ? '⏳ Guardando en Firebase...' : '💾 Guardar Cambios'}
        </button>
      </div>

      <div className="admin-info">
        <h4>ℹ️ Información</h4>
        <ul>
          <li>Las 4 obras se muestran en un diseño especial en el Home</li>
          <li>La primera obra aparece más grande</li>
          <li>Las obras 2 y 3 aparecen juntas en una fila</li>
          <li>La cuarta obra aparece grande al final</li>
          <li>Los cambios se guardan en Firebase y persisten en la nube ☁️</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminObrasDestacadas;
