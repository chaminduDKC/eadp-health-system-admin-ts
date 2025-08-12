/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_USER_API: string;
    readonly VITE_KC_API: string;
    readonly VITE_DOCTOR_API: string;
    readonly VITE_PATIENT_API: string;
    readonly VITE_BOOKING_API: string;
    readonly VITE_CLIENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}