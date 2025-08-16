import axiosInstance from "../axios/axiosInstance.ts";

const bookingUrl:string = import.meta.env.VITE_BOOKING_API;

 interface BookingParam {
    pageNumber: number;
    size: number;
    search: string;
}
export const fetchBookings = async ({pageNumber, size, search}:BookingParam)=>{
    const response = await axiosInstance.get(`${bookingUrl}/find-all-bookings`,
        {params: {searchText:search, page:pageNumber, size: size}}
    );
    return response.data.data.bookingList;
}