import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaRulerCombined, FaCalendarAlt } from 'react-icons/fa';
import { getObras } from '../../api/obras';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useAnimations';
import './Obras.css';

const CATEGORIA_ORDER = ['Retail / Comercial', 'Industrial', 'Oficinas', 'Proyecto', 'Bancos'];

const toSlug = str => str.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-');
const fromSlug = (slug, categorias) => categorias.find(c => toSlug(c) === slug) || 'Todas';

function Obras() {
  const { categoria: categoriaSlug } = useParams();
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [ordenar, setOrdenar] = useState('reciente');
  const [heroContentRef, heroContentClass] = useScrollReveal('up');
  const [statsRef, statsRevealed] = useStaggerReveal();
  const [controlsRef, controlsClass] = useScrollReveal('up', { threshold: 0.1 });
  const [gridRef, gridRevealed] = useStaggerReveal({ threshold: 0.05 });

  useEffect(() => {
    const cargarObras = async () => {
      try {
        const data = await getObras();
        const visible = data.filter(o => o.visible !== false);
        setObras(visible);
      } catch (err) {
        setError(true);
      } finally {
        setCargando(false);
      }
    };
    cargarObras();
  }, []);

  const categorias = [
    'Todas',
    ...[...new Set(obras.map(obra => obra.categoria).filter(Boolean))].sort((a, b) => {
      const aIdx = CATEGORIA_ORDER.indexOf(a);
      const bIdx = CATEGORIA_ORDER.indexOf(b);
      if (aIdx === -1 && bIdx === -1) return a.localeCompare(b);
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    })
  ];

  useEffect(() => {
    if (categoriaSlug && categorias.length > 1) {
      const match = fromSlug(categoriaSlug, categorias);
      setCategoriaActiva(match);
    } else if (!categoriaSlug) {
      setCategoriaActiva('Todas');
    }
  }, [categoriaSlug, obras]);

  const handleCategoriaClick = (categoria) => {
    setBusqueda('');
    if (categoria === 'Todas') {
      navigate('/obras');
    } else {
      navigate(`/obras/categoria/${toSlug(categoria)}`);
    }
  };

  // Filtrar por categoría y búsqueda
  let obrasFiltradas = categoriaActiva === 'Todas'
    ? obras
    : obras.filter(obra => obra.categoria === categoriaActiva);

  if (busqueda.trim()) {
    obrasFiltradas = obrasFiltradas.filter(obra =>
      obra.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      obra.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      obra.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  // Ordenar
  const obrasOrdenadas = [...obrasFiltradas].sort((a, b) => {
    if (ordenar === 'reciente') return (b.anno || 0) - (a.anno || 0);
    if (ordenar === 'antigua') return (a.anno || 0) - (b.anno || 0);
    if (ordenar === 'nombre') return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  return (
    <div className="obras-page">
      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-background" style={{ backgroundImage: `url(/IMG-20251226-WA0067.jpg)` }}>
          <div className="page-hero-overlay"></div>
        </div>
        <div className="container">
          <div className={`page-hero-content ${heroContentClass}`} ref={heroContentRef}>
            <span className="page-badge">Portfolio</span>
            <h1>Obras que transforman espacios</h1>
            <p>
              Más de 200 obras corporativas y comerciales entregadas con excelencia.
              Cada proyecto es un testimonio de nuestra dedicación a la calidad.
            </p>
            <div className={`hero-stats-mini stagger-children ${statsRevealed ? 'revealed' : ''}`} ref={statsRef}>
              <div className="stat-mini">
                <strong>200+</strong>
                <span>Obras</span>
              </div>
              <div className="stat-mini">
                <strong>50+</strong>
                <span>Clientes</span>
              </div>
              <div className="stat-mini">
                <strong>100%</strong>
                <span>Finalizadas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y Obras */}
      <section className="obras-section">
        <div className="container">
          {/* Barra de búsqueda y ordenamiento */}
          <div className={`obras-controls ${controlsClass}`} ref={controlsRef}>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {busqueda && (
                <button
                  className="clear-search"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="sort-control">
              <label htmlFor="ordenar">Ordenar:</label>
              <select
                id="ordenar"
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="sort-select"
              >
                <option value="reciente">Más recientes</option>
                <option value="antigua">Más antiguas</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Filtros de categoría */}
          <div className="obras-filters">
            <div className="filters-label">Categorías:</div>
            <div className="filters-buttons">
              {categorias.map(categoria => (
                <button
                  key={categoria}
                  className={`filter-btn ${categoriaActiva === categoria ? 'active' : ''}`}
                  onClick={() => handleCategoriaClick(categoria)}
                >
                  {categoria}
                  <span className="filter-count">
                    {categoria === 'Todas'
                      ? obras.length
                      : obras.filter(o => o.categoria === categoria).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="obras-count">
            {busqueda && (
              <span className="search-result-text">
                Resultados para "{busqueda}":
              </span>
            )}
            <span className="count-number">
              {obrasOrdenadas.length} {obrasOrdenadas.length === 1 ? 'Obra' : 'Obras'}
            </span>
          </div>

          {/* Loading */}
          {cargando ? (
            <div className="obras-loading">
              <div className="loading-spinner"></div>
              <p>Cargando obras...</p>
            </div>
          ) : error ? (
            <div className="no-results">
              <h3>Error al cargar las obras</h3>
              <p>Hubo un problema de conexión. Por favor intentá de nuevo.</p>
              <button className="btn-reset-filters" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </div>
          ) : obrasOrdenadas.length > 0 ? (
            <div className={`obras-grid stagger-scale ${gridRevealed ? 'revealed' : ''}`} ref={gridRef}>
              {obrasOrdenadas.map(obra => (
                <article key={obra.id} className="obra-card">
                  <Link to={`/obras/${obra.id}`} className="obra-link">
                    <div className="obra-image-wrapper">
                      <img src={obra.imagenes?.length > 0 ? (obra.imagenes[obra.imagen_portada || 0] || obra.imagenes[0]) : obra.imagen} alt={obra.nombre} className="obra-image" />
                      <div className="obra-overlay">
                        <span className="obra-view">Ver Obra →</span>
                      </div>
                      {obra.destacada && (
                        <span className="obra-badge-destacada">Destacada</span>
                      )}
                      <span className="obra-categoria-badge">{obra.categoria}</span>
                    </div>
                    <div className="obra-content">
                      <h3 className="obra-title">{obra.nombre}</h3>
                      <div className="obra-details">
                        {obra.ubicacion && (
                          <div className="obra-detail-item">
                            <FaMapMarkerAlt />
                            <span>{obra.ubicacion}</span>
                          </div>
                        )}
                        {obra.metros_cuadrados && (
                          <div className="obra-detail-item">
                            <FaRulerCombined />
                            <span>{obra.metros_cuadrados} m²</span>
                          </div>
                        )}
                        {obra.anno && (
                          <div className="obra-detail-item">
                            <FaCalendarAlt />
                            <span>{obra.anno}</span>
                          </div>
                        )}
                      </div>
                      {obra.descripcion && (
                        <p className="obra-description">{obra.descripcion}</p>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No se encontraron obras</h3>
              <p>Intenta con otros términos de búsqueda o cambia los filtros</p>
              <button
                className="btn-reset-filters"
                onClick={() => {
                  setBusqueda('');
                  navigate('/obras');
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Obras;
