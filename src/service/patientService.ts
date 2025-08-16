import axiosInstance from "../axios/axiosInstance.ts";

const patientUrl:string = import.meta.env.VITE_PATIENT_API;

export interface Patient {
    patientId: string,
    name: string,
    userId?: string,
    email:string,
    address:string,
    age:number,
    gender:string,
    phone:string,
}

interface FetchPatientParams {
    searchText?: string;
    page?: number;
    size?: number;
}

export const FetchPatients = async ({searchText, page, size}:FetchPatientParams):Promise<Patient[]> =>{
    const response = await axiosInstance.get(`${patientUrl}/find-all-patients`,{
        params: {
            searchText:searchText,
            page: page,
            size: size
        }
    });
    return response.data.data.patientList;
}

