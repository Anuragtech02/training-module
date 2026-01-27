import axios from 'axios';

export const axiosClient = axios.create();

axiosClient.defaults.baseURL = process.env.NEXT_PUBLIC_STRAPI_URL;

axiosClient.defaults.headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
};
