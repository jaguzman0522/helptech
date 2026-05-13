import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8001/api/v1',
});

// We can't use useNotification here directly as it's not a hook, 
// but we can export the client and use it in components where we handle errors.
// Or we can set a callback from a component.

export default apiClient;
