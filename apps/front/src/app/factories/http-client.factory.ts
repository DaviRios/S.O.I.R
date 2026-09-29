import { HttpClient, AuthService } from '../auth/auth';

const BASE_URL = import.meta.env.VITE_API_CMS_URL ?? '/v1';

export const httpClient = new HttpClient(BASE_URL, AuthService);
