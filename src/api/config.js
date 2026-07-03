import api from './client';

// Unwrap API wrappers (PHP devuelve {key:[...]} en algunos endpoints).
const unwrap = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return data;
};

export const getHomeConfig = () =>
  api.get('/config/home');

export const updateHomeConfig = (data) =>
  api.put('/config/home', data);

export const getClientesConfig = async () => {
  const data = await api.get('/config/clientes');
  return unwrap(data, 'clientes');
};

export const updateClientesConfig = (data) =>
  api.put('/config/clientes', { clientes: Array.isArray(data) ? data : data.clientes || [] });

export const getFaqConfig = async () => {
  const data = await api.get('/config/faq');
  return unwrap(data, 'faq');
};

export const updateFaqConfig = (data) =>
  api.put('/config/faq', { faq: Array.isArray(data) ? data : data.faq || [] });

export const getDestacadasConfig = async () => {
  const data = await api.get('/config/destacadas');
  console.log('[UNWRAP-FIX v2] data type=', Array.isArray(data) ? 'array' : typeof data, 'keys=', Object.keys(data || {}));
  // destacadas devuelve {obras:[...], imagenes:[...]} o array
  return Array.isArray(data) ? data : (data.obras || []);
};

export const updateDestacadasConfig = (data) =>
  api.put('/config/destacadas', Array.isArray(data) ? { obras: data, imagenes: [] } : data);

// Upload genérico para config (hero video, logos, etc.)
export const uploadConfigImage = (file, fieldName = 'imagen') =>
  api.upload('/obras/upload', file, fieldName);
