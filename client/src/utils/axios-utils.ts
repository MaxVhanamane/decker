import axios from "axios";
// the axios-fetch library provides an adapter that enables Axios to use the Fetch API as the underlying mechanism for making HTTP requests, allowing it to work effectively within a service worker or other environments where XHR is not available.
// @ts-ignore
import { axiosFetch } from "axios-fetch";

export const request = axios.create({
    withCredentials: true,
    baseURL: `${import.meta.env.VITE_API_URL}`,
    adapter: axiosFetch
});
