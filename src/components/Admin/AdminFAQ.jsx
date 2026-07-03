import { useState, useEffect } from 'react';
import { getFaqConfig, updateFaqConfig } from '../../api/config';
import { FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import './AdminFAQ.css';

const AdminFAQ = () => {
  const [preguntas, setPreguntas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [nuevaRespuesta, setNuevaRespuesta] = useState('');
  const [preguntaEdit, setPreguntaEdit] = useState('');
  const [respuestaEdit, setRespuestaEdit] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      setCargando(true);
      const data = await getFaqConfig();
      setPreguntas(data.preguntas || []);
    } catch (error) {
      mostrarMensaje('Error cargando preguntas', 'error');
    } finally {
      setCargando(false);
    }
  };

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleAgregarPregunta = async (e) => {
    e.preventDefault();

    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) {
      mostrarMensaje('Por favor completa la pregunta y respuesta', 'error');
      return;
    }

    try {
      setGuardando(true);
      const updatedList = [...preguntas, { id: Date.now().toString(), pregunta: nuevaPregunta.trim(), respuesta: nuevaRespuesta.trim() }];
      await updateFaqConfig({ preguntas: updatedList });
      setPreguntas(updatedList);
      setNuevaPregunta('');
      setNuevaRespuesta('');
      mostrarMensaje('Pregunta agregada correctamente');
    } catch (error) {
      mostrarMensaje('Error al agregar pregunta', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta pregunta?')) return;

    try {
      setGuardando(true);
      const updatedList = preguntas.filter(p => p.id !== id);
      await updateFaqConfig({ preguntas: updatedList });
      setPreguntas(updatedList);
      mostrarMensaje('Pregunta eliminada correctamente');
    } catch (error) {
      mostrarMensaje('Error al eliminar pregunta', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (pregunta) => {
    setEditando(pregunta.id);
    setPreguntaEdit(pregunta.pregunta);
    setRespuestaEdit(pregunta.respuesta);
  };

  const handleCancelarEdicion = () => {
    setEditando(null);
    setPreguntaEdit('');
    setRespuestaEdit('');
  };

  const handleGuardarEdicion = async (id) => {
    if (!preguntaEdit.trim() || !respuestaEdit.trim()) {
      mostrarMensaje('Por favor completa la pregunta y respuesta', 'error');
      return;
    }

    try {
      setGuardando(true);
      const updatedList = preguntas.map(p =>
        p.id === id ? { ...p, pregunta: preguntaEdit.trim(), respuesta: respuestaEdit.trim() } : p
      );
      await updateFaqConfig({ preguntas: updatedList });
      setPreguntas(updatedList);
      setEditando(null);
      setPreguntaEdit('');
      setRespuestaEdit('');
      mostrarMensaje('Pregunta actualizada correctamente');
    } catch (error) {
      mostrarMensaje('Error al actualizar pregunta', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleMoverArriba = async (id) => {
    try {
      setGuardando(true);
      const index = preguntas.findIndex(p => p.id === id);
      if (index <= 0) return;
      const swappedList = [...preguntas];
      [swappedList[index - 1], swappedList[index]] = [swappedList[index], swappedList[index - 1]];
      await updateFaqConfig({ preguntas: swappedList });
      setPreguntas(swappedList);
    } catch (error) {
      mostrarMensaje('Error al reordenar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const handleMoverAbajo = async (id) => {
    try {
      setGuardando(true);
      const index = preguntas.findIndex(p => p.id === id);
      if (index < 0 || index >= preguntas.length - 1) return;
      const swappedList = [...preguntas];
      [swappedList[index], swappedList[index + 1]] = [swappedList[index + 1], swappedList[index]];
      await updateFaqConfig({ preguntas: swappedList });
      setPreguntas(swappedList);
    } catch (error) {
      mostrarMensaje('Error al reordenar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="admin-faq-loading">Cargando preguntas...</div>;
  }

  return (
    <div className="admin-faq">
      <div className="admin-faq-header">
        <h2>Preguntas Frecuentes</h2>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario agregar nueva pregunta */}
      <div className="agregar-pregunta-form">
        <h3><FaPlus /> Agregar Nueva Pregunta</h3>
        <form onSubmit={handleAgregarPregunta}>
          <div className="form-group">
            <label>Pregunta</label>
            <input
              type="text"
              placeholder="¿Puedo fraccionar la obra por etapas?"
              value={nuevaPregunta}
              onChange={(e) => setNuevaPregunta(e.target.value)}
              disabled={guardando}
            />
          </div>
          <div className="form-group">
            <label>Respuesta</label>
            <textarea
              placeholder="Sí, ofrecemos la posibilidad de fraccionar..."
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              rows={4}
              disabled={guardando}
            />
          </div>
          <button 
            type="submit" 
            className="btn-agregar"
            disabled={guardando}
          >
            <FaPlus /> Agregar Pregunta
          </button>
        </form>
      </div>

      {/* Lista de preguntas */}
      <div className="preguntas-lista">
        <h3>Preguntas Actuales ({preguntas.length})</h3>
        {preguntas.length === 0 ? (
          <p className="no-preguntas">No hay preguntas frecuentes. Agrega la primera.</p>
        ) : (
          <div className="preguntas-grid">
            {preguntas.map((p, index) => (
              <div key={p.id} className="pregunta-card">
                {editando === p.id ? (
                  // Modo edición
                  <div className="pregunta-edit">
                    <input
                      type="text"
                      value={preguntaEdit}
                      onChange={(e) => setPreguntaEdit(e.target.value)}
                      disabled={guardando}
                    />
                    <textarea
                      value={respuestaEdit}
                      onChange={(e) => setRespuestaEdit(e.target.value)}
                      rows={4}
                      disabled={guardando}
                    />
                    <div className="pregunta-actions">
                      <button
                        className="btn-icon btn-save"
                        onClick={() => handleGuardarEdicion(p.id)}
                        disabled={guardando}
                        title="Guardar"
                      >
                        <FaSave />
                      </button>
                      <button
                        className="btn-icon btn-cancel"
                        onClick={handleCancelarEdicion}
                        disabled={guardando}
                        title="Cancelar"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <>
                    <div className="pregunta-header">
                      <span className="pregunta-numero">#{index + 1}</span>
                      <h4>{p.pregunta}</h4>
                    </div>
                    <p className="pregunta-respuesta">{p.respuesta}</p>
                    <div className="pregunta-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleMoverArriba(p.id)}
                        disabled={guardando || index === 0}
                        title="Mover arriba"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleMoverAbajo(p.id)}
                        disabled={guardando || index === preguntas.length - 1}
                        title="Mover abajo"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleIniciarEdicion(p)}
                        disabled={guardando}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleEliminar(p.id)}
                        disabled={guardando}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQ;
