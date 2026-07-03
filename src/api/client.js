const API_URL = import.meta.env.VITE_API_URL || 'api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const config = {
      credentials: 'include',
      headers: options.headers || {},
      ...options
    };

    // No set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
      if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
      }
    }

    const res = await fetch(url, config);

    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.error || `Error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  get(path) {
    return this.request(path, { method: 'GET' });
  }

  post(path, body) {
    return this.request(path, { method: 'POST', body });
  }

  put(path, body) {
    return this.request(path, { method: 'PUT', body });
  }

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  }

  upload(path, file, fieldName = 'imagen') {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.request(path, { method: 'POST', body: formData });
  }
}

const api = new ApiClient(API_URL);

export default api;
