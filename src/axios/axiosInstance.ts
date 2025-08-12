import axios from 'axios';

// Storage handler
const TokenService = {
    getAccessToken: () => localStorage.getItem('access_token'),
    getRefreshToken: () => localStorage.getItem('refresh_token'),
    setTokens: (access:string, refresh:string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    },
    clear: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('email');
    }
};

// JWT utils
const parseJwt = (token:string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const isTokenExpired = (token:string) => {
    const decoded = parseJwt(token);
    if (!decoded) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now - 60; // 60 sec early buffer
};

// Refresh token API call
const refreshToken = async () => {
    const refresh = TokenService.getRefreshToken();
    if (!refresh) throw new Error("No refresh token found");

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', 'hope-health-client');
    params.append('refresh_token', refresh);

    const response = await axios.post(
        'http://localhost:8080/realms/hope-health-realm/protocol/openid-connect/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token: newRefresh } = response.data;
    TokenService.setTokens(access_token, newRefresh);
    return access_token;
};

// Axios instance
const axiosInstance = axios.create();

let isRedirecting = false;

axiosInstance.interceptors.request.use(async (config) => {
    let token = TokenService.getAccessToken();

    if (!token || isTokenExpired(token)) {
        try {
            token = await refreshToken();
        } catch (error) {
            if (!isRedirecting) {
                isRedirecting = true;
                alert("Session expired. Please log in again.");
                TokenService.clear();
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// Token refresh interval logic
let refreshIntervalId: number | null | undefined = null;

export const startTokenRefreshInterval = () => {
    if (refreshIntervalId) clearInterval(refreshIntervalId);

    const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    refreshIntervalId = setInterval(async () => {
        try {
            await refreshToken();
            console.log("[Token Refreshed]");
        } catch (e) {
            console.error("Failed to refresh token in interval", e);
        }
    }, INTERVAL_MS);
};

export const stopTokenRefreshInterval = () => {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    }
};

export default axiosInstance;
