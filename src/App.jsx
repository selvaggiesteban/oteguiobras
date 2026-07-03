import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Home from './components/Home/Home';
import Obras from './components/Obras/Obras';
import ObraDetalle from './components/ObraDetalle/ObraDetalle';
import Equipo from './components/Equipo/Equipo';
import Contacto from './components/Contacto/Contacto';
import TrabajaConNosotros from './components/TrabajaConNosotros/TrabajaConNosotros';
import Admin from './components/Admin/Admin';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';
import NotFound from './components/NotFound/NotFound';
import './App.css';

function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / totalHeight) * 100;
      setProgress(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="scroll-progress" 
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="app">
      {!isAdmin && <Header />}
      <main className={isAdmin ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/obras" element={<Obras />} />
          <Route path="/obras/categoria/:categoria" element={<Obras />} />
          <Route path="/obras/:id" element={<ObraDetalle />} />
          <Route path="/equipo" element={<Equipo />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/trabaja-con-nosotros" element={<TrabajaConNosotros />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ScrollProgress />
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
