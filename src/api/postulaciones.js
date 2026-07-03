import api from './client';

export const getPostulaciones = () =>
  api.get('/postulaciones');

export const enviarPostulacion = (formData) =>
  api.request('/postulaciones', { method: 'POST', body: formData });

export const updatePostulacion = (id, data) =>
  api.put(`/postulaciones/${id}`, data);

export const deletePostulacion = (id) =>
  api.delete(`/postulaciones/${id}`);
