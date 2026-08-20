import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaRulerCombined, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView, useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import { getHomeConfig as getHomeConfigAPI, updateHomeConfig, uploadConfigImage } from '../../api/config';
import { getDestacadasConfig } from '../../api/config';
import { getClientesConfig } from '../../api/config';
import FAQ from '../FAQ/FAQ';
import './Home.css';


function Home() {
  const [obrasRef, obrasInView] = useInView({ threshold: 0.2 });
  const [certificacionRef, certificacionInView] = useInView({ threshold: 0.2 });
  const [clientesRef, clientesInView] = useInView({ threshold: 0.2 });

  // Scroll reveal para secciones adicionales
  const [metricsRef, metricsRevealed] = useStaggerReveal();
  const [obrasHeaderRef, obrasHeaderClass] = useScrollReveal('up');
  const [ctaRef, ctaClass] = useScrollReveal('scale');
  const [certContentRef, certContentClass] = useScrollReveal('left');
  const [certImageRef, certImageClass] = useScrollReveal('right', { threshold: 0.2 });
  const [ctaFinalRef, ctaFinalClass] = useScrollReveal('up');

  const [config, setConfig] = useState(null);
  const [obrasDestacadas, setObrasDestacadas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const videoRef = useRef(null);

  const heroVideoUrl = config?.hero?.heroVideoUrl || '/hero-video.mp4';

  // Cargar datos al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configCargada, destacadasData, clientesCargados] = await Promise.all([
          getHomeConfigAPI(),
          getDestacadasConfig(),
          getClientesConfig()
        ]);
        setConfig(configCargada || null);
        setObrasDestacadas(destacadasData?.obras || destacadasData || []);
        setClientes(clientesCargados?.clientes || clientesCargados || []);
      } catch (error) {
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Recargar cuando cambien los datos
  useEffect(() => {
    const handleConfigChange = async () => {
      const configActualizada = await getHomeConfigAPI();
      setConfig(configActualizada);
    };

    const handleObrasChange = async () => {
      const obrasActualizadas = await getDestacadasConfig();
      setObrasDestacadas(obrasActualizadas?.obras || obrasActualizadas || []);
    };

    const handleClientesChange = async () => {
      const clientesActualizados = await getClientesConfig();
      setClientes(clientesActualizados?.clientes || clientesActualizados || []);
    };

    window.addEventListener('homeConfigUpdated', handleConfigChange);
    window.addEventListener('obrasDestacadasUpdated', handleObrasChange);
    window.addEventListener('clientesUpdated', handleClientesChange);

    return () => {
      window.removeEventListener('homeConfigUpdated', handleConfigChange);
      window.removeEventListener('obrasDestacadasUpdated', handleObrasChange);
      window.removeEventListener('clientesUpdated', handleClientesChange);
    };
  }, []);

  // Métricas con animación - ahora dinámicas
  const [yearsRef, years] = useCountUp(config?.metricas?.anos?.valor || 0, 2000);
  const [projectsRef, projects] = useCountUp(config?.metricas?.proyectos?.valor || 0, 2000);
  const [m2Ref, m2] = useCountUp(config?.metricas?.metrosConstructidos?.valor || 0, 2500);

  if (cargando || !config) {
    return <div className="home-loading">{null}</div>;
  }

  return (
    <div className="home">
      {/* Hero Video */}
      <section className="hero-video">
        <video
          ref={videoRef}
          className="hero-video-bg"
          src={heroVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-overlay-dark"></div>

        <div className={`hero-container-center hero-pos-${config.hero?.posicion || 'centro'}`}>
          <div className={`hero-content-center ${!cargando ? 'hero-text-ready' : ''}`}>
            <h1 className={`hero-main-title hero-fs-${config.hero?.fontSize || 'normal'}`} style={config.hero?.colorTexto ? { color: config.hero.colorTexto } : undefined}>
              {config.hero?.titulo || ''}{config.hero?.titulo ? <br /> : null}
              <span className="hero-highlight" style={config.hero?.colorDestacado ? { color: config.hero.colorDestacado } : undefined}>{config.hero?.tituloDestacado || ''}</span>
            </h1>
            <p className="hero-subtitle" style={config.hero?.colorTexto ? { color: config.hero.colorTexto } : undefined}>
              {config.hero?.subtitulo || ''}
            </p>
          </div>
        </div>

        <div className={`hero-scroll-indicator ${!cargando ? 'hero-text-ready' : ''}`}>
          <div className="scroll-line"></div>
        </div>
      </section>

      {error && (
        <div className="error-banner">
          <div className="container">
            <p>Hubo un problema al cargar los datos. <button onClick={() => window.location.reload()}>Reintentar</button></p>
          </div>
        </div>
      )}

      {/* Barra de Métricas Animadas */}
      <section className="metrics-bar">
        <div className="container">
          <div className={`metrics-grid stagger-children ${metricsRevealed ? 'revealed' : ''}`} ref={metricsRef}>
            <div className="metric-item" ref={yearsRef}>
              <div className="metric-value">+{years}{config?.metricas?.anos?.unidad && <span className="metric-unit">{config.metricas.anos.unidad}</span>}</div>
              <div className="metric-label">{config?.metricas?.anos?.label}</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" ref={m2Ref}>
              <div className="metric-value">+{m2.toLocaleString()}{config?.metricas?.metrosConstructidos?.unidad && <span className="metric-unit">{config.metricas.metrosConstructidos.unidad}</span>}</div>
              <div className="metric-label">{config?.metricas?.metrosConstructidos?.label}</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" ref={projectsRef}>
              <div className="metric-value">+{projects}{config?.metricas?.proyectos?.unidad && <span className="metric-unit">{config.metricas.proyectos.unidad}</span>}</div>
              <div className="metric-label">{config?.metricas?.proyectos?.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Obras Destacadas */}
      {obrasDestacadas.length > 0 && (
      <section className="featured-works-section" ref={obrasRef}>
        <div className="container">
          <div className={`section-header-center ${obrasHeaderClass}`} ref={obrasHeaderRef}>
            <h2 className="section-title">Obras destacadas</h2>
            <p className="section-subtitle">
              Construimos espacios, creamos experiencias. Nuestro compromiso: tu satisfacción.
            </p>
          </div>

          <div className={`featured-works-grid ${obrasInView ? 'animate-in' : ''}`}>
            {obrasDestacadas.map((obra, index) => (
              <article 
                key={obra.id} 
                className={`featured-work-card featured-work-${index + 1}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="featured-work-image">
                  <img src={obra.imagenes?.length > 0 ? (obra.imagenes?.[obra.imagen_portada || 0] || obra.imagenes?.[0]) : obra.imagen} alt={obra.titulo} loading="lazy" />
                  <div className="featured-work-overlay">
                    <span className="featured-work-categoria">{obra.categoria}</span>
                  </div>
                </div>
                
                <div className="featured-work-content">
                  <h3 className="featured-work-title">{obra.titulo}</h3>
                  <p className="featured-work-description">{obra.descripcion}</p>
                  
                  <div className="featured-work-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{obra.ubicacion}</span>
                    </div>
                    <div className="detail-item">
                      <FaRulerCombined className="detail-icon" />
                      <span>{obra.metros_cuadrados} m²</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{obra.anno}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="section-cta-center">
            <Link to="/obras" className="btn-primary-large">
              Ver todas las obras
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>
      )}
      {/* Frase corporativa */}
      <section className="frase-corporativa">
        <div className="container">
          <p className="frase-corporativa-texto">Excelencia en obras corporativas e industriales</p>
        </div>
      </section>
      {/* Clientes destacados */}
      {clientes.length > 0 && (
      <section className="clientes-destacados" ref={clientesRef}>
        <div className="container">
          <div className={`clientes-destacados-header ${clientesInView ? 'animate-in' : ''}`}>
            <p className="clientes-eyebrow">Quienes confían en nosotros</p>
            <h2>Trabajamos con las principales<br />empresas e instituciones del país</h2>
          </div>

          <div className={`clientes-logos-grid ${clientesInView ? 'animate-in' : ''}`}>
            {clientes.map((cliente, index) => (
              <div
                key={cliente.id}
                className="cliente-logo-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <img src={cliente.logoUrl} alt={cliente.nombre} />
              </div>
            ))}
          </div>

          {/* Carrusel infinito para mobile */}
          <div className="clientes-carrusel-mobile">
            <div className="carrusel-track">
              {[...clientes, ...clientes, ...clientes].map((cliente, index) => (
                <div key={`${cliente.id}-${index}`} className="carrusel-item">
                  <img src={cliente.logoUrl} alt={cliente.nombre} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Intermedio */}
      <section className="cta-intermedio">
        <div className="container">
          <div className={`cta-intermedio-content ${ctaClass}`} ref={ctaRef}>
            <p className="cta-eyebrow">¿Tenés un proyecto en mente?</p>
            <h2>Da el primer paso</h2>
            <p>Despejá tus dudas en una charla de 15 minutos. Evaluamos la viabilidad técnica y comercial de tu propuesta</p>
            <a href="mailto:oficina@oteguiobras.com?subject=Agendar%20Charla%20de%2015%20min&body=Hola!%20Quiero%20agendar%20una%20charla%20de%2015%20minutos" className="btn-cta-gold">
              AGENDAR CHARLA DE 15 MIN
              <FaArrowRight style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }} />
            </a>
          </div>
        </div>
      </section>

      {/* Certificación ISO 9001 */}
      <section className="certificacion-section" ref={certificacionRef}>
        <div className="container">
          <div className={`certificacion-grid ${certificacionInView ? 'animate-in' : ''}`}>
            <div className={`certificacion-content ${certContentClass}`} ref={certContentRef}>
              <p className="certificacion-intro">
                Nuestra dedicación a la excelencia y a la plena satisfacción del cliente está 
                respaldada por una sólida base de conocimientos y un experimentado equipo de 
                trabajo, lo que garantiza la calidad del proceso constructivo.
              </p>

              <div className="certificacion-features">
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Obras llave en mano</h4>
                    <p>Gestión integral de tu proyecto desde el inicio hasta la entrega</p>
                  </div>
                </div>
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Equipo de profesionales especializados</h4>
                    <p>Arquitectos e ingenieros con décadas de experiencia</p>
                  </div>
                </div>
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Espacios de trabajo versátiles</h4>
                    <p>Adaptados a las necesidades específicas de cada cliente</p>
                  </div>
                </div>
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Cumplimiento de plazos de obra</h4>
                    <p>Compromiso con los tiempos acordados</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`certificacion-image ${certImageClass}`} ref={certImageRef}>
              <img src="/IMG-20251226-WA0073.jpg" alt="Certificación ISO 9001" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* CTA Final */}
      <section className="cta-final">
        <div className="cta-background-image" style={{ backgroundImage: 'url(/IMG-20251226-WA0076.jpg)' }}>
          <div className="cta-overlay"></div>
        </div>
        <div className="container">
          <div className={`cta-content-final ${ctaFinalClass}`} ref={ctaFinalRef}>
            <h2>¿Listo para comenzar?</h2>
            <p>Contactanos hoy y descubrí cómo podemos transformar tu visión en realidad</p>
            <div className="cta-actions-final">
              <Link to="/contacto" className="btn-cta-primary">
                Solicitar Presupuesto
              </Link>
              <a href="tel:2080-1145" className="btn-cta-secondary">
                Llamar ahora
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;

// cache-bust marker 2026-06-30-1430
