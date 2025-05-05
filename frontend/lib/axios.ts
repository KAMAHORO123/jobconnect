import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:6060/api';
axios.defaults.withCredentials = true;

export default axios; 