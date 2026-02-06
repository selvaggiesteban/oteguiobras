import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaRulerCombined, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useAnimations';
import { getHomeConfig, loadConfig } from '../../data/homeData';
import { getObrasDestacadas, loadObrasDestacadas } from '../../data/obrasDestacadasData';
import { getClientes, loadClientes } from '../../data/clientesData';
import FAQ from '../FAQ/FAQ';
import './Home.css';

function Home() {
  const [whyRef, whyInView] = useInView({ threshold: 0.2 });
  const [obrasRef, obrasInView] = useInView({ threshold: 0.2 });
  const [certificacionRef, certificacionInView] = useInView({ threshold: 0.2 });
  const [clientesRef, clientesInView] = useInView({ threshold: 0.2 });
  
  const [config, setConfig] = useState(getHomeConfig());
  const [obrasDestacadas, setObrasDestacadas] = useState(getObrasDestacadas());
  const [clientes, setClientes] = useState(getClientes());

  // Cargar datos desde Firebase al montar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [configCargada, obrasCargadas, clientesCargados] = await Promise.all([
          loadConfig(),
          loadObrasDestacadas(),
          loadClientes()
        ]);
        console.log('Config cargada:', configCargada);
        console.log('Obras cargadas:', obrasCargadas);
        console.log('Clientes cargados:', clientesCargados);
        setConfig(configCargada);
        setObrasDestacadas(obrasCargadas);
        setClientes(clientesCargados);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    cargarDatos();
  }, []);

  // Recargar cuando cambien los datos
  useEffect(() => {
    const handleConfigChange = async () => {
      const configActualizada = await loadConfig();
      setConfig(configActualizada);
    };

    const handleObrasChange = async () => {
      const obrasActualizadas = await loadObrasDestacadas();
      setObrasDestacadas(obrasActualizadas);
    };

    const handleClientesChange = async () => {
      const clientesActualizados = await loadClientes();
      setClientes(clientesActualizados);
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

  return (
    <div className="home">
      {/* Hero con Video Background */}
      <section className="hero-video">
        <div className="hero-video-background">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="hero-video-element"
            key={config.hero.videoUrl}
          >
            <source src={config.hero.videoUrl} type="video/mp4" />
          </video>
          <div className="hero-overlay-dark"></div>
        </div>
        
        <div className="hero-container-center">
          <div className="hero-content-center">
            <h1 className="hero-main-title animate-fade-in-up">
              {config.hero.titulo}<br />
              <span className="hero-highlight">{config.hero.tituloDestacado}</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up delay-1">
              {config.hero.subtitulo}
            </p>
          </div>
        </div>
      </section>

      {/* Barra de Métricas Animadas */}
      <section className="metrics-bar">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-item" ref={yearsRef}>
              <div className="metric-value">+{years}</div>
              <div className="metric-label">{config.metricas.anos.label}</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" ref={m2Ref}>
              <div className="metric-value">+{m2.toLocaleString()}</div>
              <div className="metric-label">{config.metricas.metrosConstructidos.label}</div>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item" ref={projectsRef}>
              <div className="metric-value">+{projects}</div>
              <div className="metric-label">{config.metricas.proyectos.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enfoque Corporativo y Bancario */}
      <section className="enfoque-corporativo">
        <div className="container">
          <div className="enfoque-content">
            <h2>Expertos en proyectos corporativos y bancarios</h2>
            <p>
              Con más de dos décadas de experiencia, nos especializamos en el desarrollo 
              de espacios corporativos de alta complejidad, incluyendo entidades bancarias 
              y proyectos empresariales que exigen los más altos estándares de calidad y seguridad.
            </p>
          </div>
        </div>
      </section>

      {/* Obras Destacadas - Nueva sección */}
      <section className="featured-works-section" ref={obrasRef}>
        <div className="container">
          <div className="section-header-center">
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
              >
                <div className="featured-work-image">
                  <img src={obra.imagen} alt={obra.titulo} loading="lazy" />
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
                      <span>{obra.metroCuadrados} m²</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{obra.año}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="section-cta-center">
            <Link to="/obras" className="btn-primary-large">
              Ver todos los proyectos
              <FaArrowRight className="btn-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Intermedio */}
      <section className="cta-intermedio">
        <div className="container">
          <div className="cta-intermedio-content">
            <h2>Construí con nosotros</h2>
            <p>Transformamos tus ideas en realidad con la más alta calidad y profesionalismo</p>
            <Link to="/contacto" className="btn-cta-gold">
              Solicitar Presupuesto
            </Link>
          </div>
        </div>
      </section>

      {/* Certificación ISO 9001 */}
      <section className="certificacion-section" ref={certificacionRef}>
        <div className="container">
          <div className={`certificacion-grid ${certificacionInView ? 'animate-in' : ''}`}>
            <div className="certificacion-content">
              <p className="certificacion-intro">
                Nuestra dedicación a la excelencia y a la plena satisfacción del cliente está 
                respaldada por una sólida base de conocimientos y un experimentado equipo de 
                trabajo, lo que garantiza la calidad del proceso constructivo certificado bajo 
                norma ISO 9001.
              </p>

              <div className="certificacion-features">
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Proyectos llave en mano</h4>
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
                <div className="cert-feature">
                  <div className="cert-icon">✓</div>
                  <div>
                    <h4>Certificaciones IRAM e IQNET</h4>
                    <p>Máximos estándares de calidad internacional</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="certificacion-image">
              <img src="/IMG-20251226-WA0073.jpg" alt="Certificación ISO 9001" />
            </div>
          </div>
        </div>
      </section>

      {/* Empresas que confían - Carrusel */}
      <section className="empresas-section" ref={clientesRef}>
        <div className="container">
          <div className={`empresas-header ${clientesInView ? 'animate-in' : ''}`}>
            <h2>Empresas e instituciones que confían en nosotros</h2>
            <p>
              Somos la elección confiable de grandes marcas e instituciones, gracias a nuestra 
              especialización en proyectos para una amplia gama de sectores corporativos. 
              Desde el ámbito gastronómico, el sector hospitalario y el entorno industrial hasta 
              obras de proyectos educativos, institucionales e inmobiliarios.
            </p>
          </div>

          {/* Carrusel infinito */}
          <div className="carrusel-container">
            <div className="carrusel-track">
              {/* Duplicamos los logos para efecto infinito */}
              {[...clientes, ...clientes, ...clientes].map((cliente, index) => (
                <div key={`${cliente.id}-${index}`} className="carrusel-item">
                  <img src={cliente.logoUrl} alt={cliente.nombre} />
                </div>
              ))}
            </div>
          </div>

          <div className="section-cta">
            <Link to="/obras" className="btn-conoce-proyectos">
              CONOCÉ NUESTROS PROYECTOS
            </Link>
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
          <div className="cta-content-final">
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
