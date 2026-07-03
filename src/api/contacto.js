import api from './client';

export const getMensajes = () =>
  api.get('/contacto');

export const enviarMensaje = (data) =>
  api.post('/contacto', data);

export const updateMensaje = (id, data) =>
  api.put(`/contacto/${id}`, data);

export const deleteMensaje = (id) =>
  api.delete(`/contacto/${id}`);
