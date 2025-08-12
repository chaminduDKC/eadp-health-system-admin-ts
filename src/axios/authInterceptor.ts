// authInterceptor.js
import axiosInstance from './axiosInstance.js';
import axios from 'axios';

const TOKEN_URL = "http://localhost:8080/realms/hope-health-realm/protocol/openid-connect/token";
const CLIENT_ID = "hope-health-client";

const CookieManagerService = {
    get: (key:string) => localStorage.getItem(key),
    set: (value:string, key:string) => localStorage.setItem(key, value),
    tokenIsExists: (key:string) => !!localStorage.getItem(key),
};

// Decode JWT payload
function parseJwt(token:string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e:any) {
        return null;
    }
}

// Check if token is expired
function isTokenExpired(token:string) {
    if (!token) return true;
    const decoded = parseJwt(token);
    if (!decoded) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now - 60; // expire 60 seconds early for safety
}

// Refresh Token Function
async function refreshToken() {
    const refreshToken = CookieManagerService.get('refresh_token');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', CLIENT_ID);
    if (refreshToken != null) {
        params.append('refresh_token', refreshToken);
    }

    const response = await axios.post(TOKEN_URL, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token } = response.data;

    CookieManagerService.set(access_token, 'access_token');
    CookieManagerService.set(refresh_token, 'refresh_token');
    console.log("token refreshed")

    return access_token;
}

// Axios Request Interceptor
axiosInstance.interceptors.request.use(async (config) => {
    let token = CookieManagerService.get('access_token');

    if (!token || isTokenExpired(token)) {
        try {
            token = await refreshToken();
        } catch (err) {
            console.error("Unable to refresh token", err);
            // Handle logout here if needed
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});
