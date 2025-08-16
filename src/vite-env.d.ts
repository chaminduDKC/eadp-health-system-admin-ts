/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_USER_API: string;
    readonly VITE_KC_API: string;
    readonly VITE_DOCTOR_API: string;
    readonly VITE_PATIENT_API: string;
    readonly VITE_BOOKING_API: string;
    readonly VITE_AVAILABILITY_API: string;
    readonly VITE_HOSPITAL_API: string;
    readonly VITE_SPECIALIZATION_API: string;
    readonly VITE_CLIENT_ID: string;
    readonly VITE_NEWS_API: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}