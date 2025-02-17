import axios from 'axios';

const evolutionApi = axios.create({
  baseURL: process.env.EVOLUTION_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.EVOLUTION_API_KEY}`
  }
});

export default evolutionApi;
