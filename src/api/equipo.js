import api from './client';

export const getEquipo = (visible) =>
  api.get(`/equipo${visible !== undefined ? `?visible=${visible}` : ''}`);

export const getMiembro = (id) =>
  api.get(`/equipo/${id}`);

export const createMiembro = (data) =>
  api.post('/equipo', data);

export const updateMiembro = (id, data) =>
  api.put(`/equipo/${id}`, data);

export const deleteMiembro = (id) =>
  api.delete(`/equipo/${id}`);

export const uploadMiembroFoto = (file) =>
  api.upload('/equipo/upload', file, 'foto');
