import { useState, useEffect, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getHomeConfig, actualizarHomeConfig, loadConfig, cargarDatosDemo } from '../../data/homeData';
import { storage } from '../../firebase/config';
import { useToast } from '../Toast';
import './AdminHome.css';

function AdminHome() {
  const toast = useToast();
  const [config, setConfig] = useState(getHomeConfig());
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cargandoDemo, setCargandoDemo] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoImagen(true);
    try {
      const storageRef = ref(storage, 'hero/background');
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setConfig(prev => ({ ...prev, hero: { ...prev.hero, heroImageUrl: url } }));
      toast.success('Imagen subida. Guardá los cambios para aplicarla.');
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      toast.error('Error al subir la imagen. Intentá de nuevo.');
    } finally {
      setSubiendoImagen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarHomeConfig(config);
      toast.success('Cambios guardados en Firebase.');
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCargarDemo = async () => {
    if (window.confirm('¿Cargar datos demo? Esto sobrescribirá la configuración actual.')) {
      setCargandoDemo(true);
      try {
        const datosDemo = await cargarDatosDemo();
        setConfig(datosDemo);
        toast.success('Datos demo cargados exitosamente.');
      } catch (error) {
        toast.error('Error al cargar datos demo: ' + error.message);
      } finally {
        setCargandoDemo(false);
      }
    }
  };

  if (cargando) {
    return (
      <div className="admin-home">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Cargando configuración desde Firebase...</p>
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
            {cargandoDemo ? 'Cargando...' : 'Cargar Datos Demo'}
          </button>
          <button
            className="btn-guardar"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="admin-section">
        <h3>Hero Principal</h3>

        {/* Imagen de Fondo */}
        <div className="form-group">
          <label>Imagen de Fondo del Hero</label>
          <div className="hero-image-upload">
            {config.hero?.heroImageUrl ? (
              <div className="hero-image-preview">
                <img src={config.hero.heroImageUrl} alt="Vista previa del hero" />
                <button
                  type="button"
                  className="btn-change-image"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={subiendoImagen}
                >
                  {subiendoImagen ? 'Subiendo...' : 'Cambiar imagen'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-upload-hero"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoImagen}
              >
                {subiendoImagen ? (
                  <>
                    <span className="upload-spinner"></span>
                    Subiendo imagen...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/>
                      <line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                    Subir imagen de fondo
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              style={{ display: 'none' }}
            />
          </div>
          <small>JPG o PNG. Recomendado: 1920×1080px o mayor. Se reemplaza la imagen anterior.</small>
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
          className="btn-guardar-grande"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando en Firebase...' : 'Guardar Todos los Cambios'}
        </button>
        <p className="info-guardar">
          Los cambios se guardan en Firebase y se aplican instantáneamente
        </p>
      </div>
    </div>
  );
}

export default AdminHome;
