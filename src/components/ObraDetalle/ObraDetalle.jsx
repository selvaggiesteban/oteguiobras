import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useScrollReveal } from '../../hooks/useAnimations';
import { obrasData } from '../../data/obrasData';
import './ObraDetalle.css';

function ObraDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const obra = obrasData.find(o => o.id === parseInt(id));
  const [imagenActual, setImagenActual] = useState(0);

  // Scroll reveal hooks
  const [heroRef, heroClass] = useScrollReveal('up');
  const [galeriaRef, galeriaClass] = useScrollReveal('up', { threshold: 0.05 });
  const [infoRef, infoClass] = useScrollReveal('up', { threshold: 0.1 });
  const [ctaRef, ctaClass] = useScrollReveal('scale');

  if (!obra) {
    return (
      <div className="obra-detalle-error">
        <div className="container">
          <h2>Proyecto no encontrado</h2>
          <Link to="/obras" className="btn-volver">Volver a Obras</Link>
        </div>
      </div>
    );
  }

  const imagenes = obra.imagenes || [obra.imagen];

  const siguiente = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length);
  };

  const anterior = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length);
  };

  return (
    <div className="obra-detalle">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/obras">Obras</Link>
          <span>/</span>
          <span>{obra.nombre}</span>
        </div>
      </div>

      {/* Hero de la obra */}
      <section className="obra-hero">
        <div className="container">
          <button 
            className="btn-back" 
            onClick={() => navigate('/obras')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 16l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver a Obras
          </button>
          
          <div className={`obra-hero-content ${heroClass}`} ref={heroRef}>
            <span className="obra-tag-detalle">{obra.categoria}</span>
            <h1>{obra.nombre}</h1>
            <div className="obra-meta">
              <div className="meta-item">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                {obra.ubicacion}
              </div>
              {obra.año && (
                <div className="meta-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {obra.año}
                </div>
              )}
              {obra.metrosCuadrados && (
                <div className="meta-item">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 17V7l7-4 7 4v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {obra.metrosCuadrados} m²
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Galería */}
      <section className="obra-galeria">
        <div className="container">
          <div className={`galeria-principal ${galeriaClass}`} ref={galeriaRef}>
            <img 
              src={imagenes[imagenActual]} 
              alt={`${obra.nombre} - imagen ${imagenActual + 1}`} 
              className="imagen-principal"
            />
            {imagenes.length > 1 && (
              <>
                <button 
                  className="galeria-nav prev" 
                  onClick={anterior}
                  aria-label="Imagen anterior"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button 
                  className="galeria-nav next" 
                  onClick={siguiente}
                  aria-label="Siguiente imagen"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="galeria-contador">
                  {imagenActual + 1} / {imagenes.length}
                </div>
              </>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="galeria-thumbnails">
              {imagenes.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === imagenActual ? 'active' : ''}`}
                  onClick={() => setImagenActual(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Información del proyecto */}
      <section className="obra-info">
        <div className="container">
          <div className={`info-grid ${infoClass}`} ref={infoRef}>
            <div className="info-principal">
              <h2>Sobre el proyecto</h2>
              <p className="obra-descripcion">{obra.descripcion}</p>
              
              {obra.cliente && (
                <div className="info-extra">
                  <h3>Cliente</h3>
                  <p>{obra.cliente}</p>
                </div>
              )}
            </div>

            <div className="info-datos">
              <h3>Datos clave</h3>
              <div className="datos-lista">
                <div className="dato-item">
                  <span className="dato-label">Categoría</span>
                  <span className="dato-value">{obra.categoria}</span>
                </div>
                <div className="dato-item">
                  <span className="dato-label">Ubicación</span>
                  <span className="dato-value">{obra.ubicacion}</span>
                </div>
                {obra.año && (
                  <div className="dato-item">
                    <span className="dato-label">Año</span>
                    <span className="dato-value">{obra.año}</span>
                  </div>
                )}
                {obra.metrosCuadrados && (
                  <div className="dato-item">
                    <span className="dato-label">Superficie</span>
                    <span className="dato-value">{obra.metrosCuadrados} m²</span>
                  </div>
                )}
                {obra.destacada && (
                  <div className="dato-item">
                    <span className="dato-label">Estado</span>
                    <span className="dato-value badge-destacada">Destacada</span>
                  </div>
                )}
              </div>

              <Link to="/contacto" className="btn-contacto-obra">
                Consultar proyecto similar
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="obra-cta">
        <div className="container">
          <div className={`cta-box ${ctaClass}`} ref={ctaRef}>
            <h3>¿Tenés un proyecto en mente?</h3>
            <p>Hablemos de cómo podemos hacerlo realidad</p>
            <Link to="/contacto" className="btn-cta-obra">Solicitar Presupuesto</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ObraDetalle;
