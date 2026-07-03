import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isHome = location.pathname === '/';
  
  return (
    <header className={`header ${isHome && !scrolled ? 'header-transparent' : 'header-solid'} ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-wrapper">
            <img src="/logo-fondo-blanco.jpg" alt="Otegui Obras" className="logo-img" />
          </div>
        </Link>
        
        <button 
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        
        <nav className={`nav ${menuOpen ? 'active' : ''}`}>
          <Link 
            to="/obras" 
            className={`nav-link ${location.pathname.includes('/obras') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Obras
          </Link>
          <Link 
            to="/equipo" 
            className={`nav-link ${location.pathname === '/equipo' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Equipo
          </Link>
          <Link 
            to="/trabaja-con-nosotros" 
            className={`nav-link ${location.pathname === '/trabaja-con-nosotros' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Unite!
          </Link>
          <Link to="/contacto" className="btn-header" onClick={closeMenu}>
            Contacto
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
