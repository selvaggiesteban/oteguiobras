import { useState, useEffect } from 'react';
import { getHomeConfig, actualizarHomeConfig, loadConfig, cargarDatosDemo } from '../../data/homeData';
import { useToast } from '../Toast';
import './AdminHome.css';

function AdminHome() {
  const toast = useToast();
  const [config, setConfig] = useState(getHomeConfig());
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoDemo, setCargandoDemo] = useState(false);

  // Cargar config desde Firebase al montar
  useEffect(() => {
    const cargarConfig = async () => {
      setCargando(true);
      const configCargada = await loadConfig();
      setConfig(configCargada);
      setCargando(false);
    };
    cargarConfig();
  }, []);

  const handleInputChange = (seccion, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const handleMetricaChange = (metrica, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      metricas: {
        ...prev.metricas,
        [metrica]: {
          ...prev.metricas[metrica],
          [campo]: campo === 'valor' ? Number(valor) : valor
        }
      }
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // Guardar en Firebase
      await actualizarHomeConfig(config);
      
      // Mostrar mensaje de éxito
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
      
      alert('✓ Cambios guardados exitosamente en Firebase!\n\nLos cambios se verán reflejados en el Home.');
    } catch (error) {
      alert('❌ Error al guardar los cambios:\n' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCargarDemo = async () => {
    if (window.confirm('⚠️ ¿Estás seguro de cargar los datos demo?\n\nEsto sobrescribirá la configuración actual con los valores de ejemplo.')) {
      setCargandoDemo(true);
      try {
        const datosDemo = await cargarDatosDemo();
        setConfig(datosDemo);
        alert('✓ Datos demo cargados exitosamente en Firebase!\n\nLos valores de ejemplo están ahora activos.');
      } catch (error) {
        alert('❌ Error al cargar datos demo:\n' + error.message);
      } finally {
        setCargandoDemo(false);
      }
    }
  };

  if (cargando) {
    return (
      <div className="admin-home">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>⏳ Cargando configuración desde Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-home-header">
        <div>
          <h2>Configuración del Home</h2>
          <p className="admin-subtitle">Gestiona el contenido del hero y las métricas</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-demo"
            onClick={handleCargarDemo}
            disabled={cargandoDemo}
          >
            {cargandoDemo ? '⏳ Cargando...' : '📦 Cargar Datos Demo'}
          </button>
          <button 
            className={`btn-guardar ${guardado ? 'guardado' : ''}`}
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? '⏳ Guardando...' : guardado ? '✓ Guardado' : '💾 Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="admin-section">
        <h3>Hero Principal</h3>
        
        <div className="form-group">
          <label>URL del Video</label>
          <input 
            type="url"
            value={config.hero.videoUrl}
            onChange={(e) => handleInputChange('hero', 'videoUrl', e.target.value)}
            placeholder="https://..."
          />
          <small>URL del video para el fondo del hero (MP4 directo o link de Vimeo)</small>
        </div>

        <div className="form-group">
          <label>Título Principal</label>
          <input 
            type="text"
            value={config.hero.titulo}
            onChange={(e) => handleInputChange('hero', 'titulo', e.target.value)}
            placeholder="Construimos"
          />
        </div>

        <div className="form-group">
          <label>Título Destacado (dorado)</label>
          <input 
            type="text"
            value={config.hero.tituloDestacado}
            onChange={(e) => handleInputChange('hero', 'tituloDestacado', e.target.value)}
            placeholder="Espacios"
          />
        </div>

        <div className="form-group">
          <label>Subtítulo</label>
          <input 
            type="text"
            value={config.hero.subtitulo}
            onChange={(e) => handleInputChange('hero', 'subtitulo', e.target.value)}
            placeholder="Excelencia en construcción"
          />
        </div>

        {/* Preview del Hero */}
        <div className="preview-hero">
          <div className="preview-title">
            {config.hero.titulo}<br />
            <span className="preview-highlight">{config.hero.tituloDestacado}</span>
          </div>
          <div className="preview-subtitle">{config.hero.subtitulo}</div>
        </div>
      </section>

      {/* Métricas Section */}
      <section className="admin-section">
        <h3>Métricas (Contadores Animados)</h3>

        {/* Años */}
        <div className="metrica-group">
          <h4>Años de Experiencia</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input 
                type="number"
                value={config.metricas.anos.valor}
                onChange={(e) => handleMetricaChange('anos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Etiqueta</label>
              <input 
                type="text"
                value={config.metricas.anos.label}
                onChange={(e) => handleMetricaChange('anos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Metros */}
        <div className="metrica-group">
          <h4>Metros Construidos</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input 
                type="number"
                value={config.metricas.metrosConstructidos.valor}
                onChange={(e) => handleMetricaChange('metrosConstructidos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Etiqueta</label>
              <input 
                type="text"
                value={config.metricas.metrosConstructidos.label}
                onChange={(e) => handleMetricaChange('metrosConstructidos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Proyectos */}
        <div className="metrica-group">
          <h4>Proyectos Realizados</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Valor</label>
              <input 
                type="number"
                value={config.metricas.proyectos.valor}
                onChange={(e) => handleMetricaChange('proyectos', 'valor', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Etiqueta</label>
              <input 
                type="text"
                value={config.metricas.proyectos.label}
                onChange={(e) => handleMetricaChange('proyectos', 'label', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Preview de Métricas */}
        <div className="preview-metricas">
          <div className="preview-metric">
            <div className="preview-metric-value">+{config.metricas.anos.valor}</div>
            <div className="preview-metric-label">{config.metricas.anos.label}</div>
          </div>
          <div className="preview-metric">
            <div className="preview-metric-value">+{config.metricas.metrosConstructidos.valor.toLocaleString()}</div>
            <div className="preview-metric-label">{config.metricas.metrosConstructidos.label}</div>
          </div>
          <div className="preview-metric">
            <div className="preview-metric-value">+{config.metricas.proyectos.valor}</div>
            <div className="preview-metric-label">{config.metricas.proyectos.label}</div>
          </div>
        </div>
      </section>

      <div className="admin-footer-actions">
        <button 
          className={`btn-guardar-grande ${guardado ? 'guardado' : ''}`}
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? '⏳ Guardando en Firebase...' : guardado ? '✓ Guardado Exitosamente' : '💾 Guardar Todos los Cambios'}
        </button>
        <p className="info-guardar">
          Los cambios se guardan en Firebase y se aplican instantáneamente
        </p>
      </div>
    </div>
  );
}

export default AdminHome;
