export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1';
export const WS_URL = API_URL.replace('http', 'ws');
