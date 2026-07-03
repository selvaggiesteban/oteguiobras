import api from './client';

export const getObras = (visible) =>
  api.get(`/obras${visible !== undefined ? `?visible=${visible}` : ''}`);

export const getObra = (id) =>
  api.get(`/obras/${id}`);

export const createObra = (data) =>
  api.post('/obras', data);

export const updateObra = (id, data) =>
  api.put(`/obras/${id}`, data);

export const deleteObra = (id) =>
  api.delete(`/obras/${id}`);

export const uploadObraImage = (file) =>
  api.upload('/obras/upload', file);
