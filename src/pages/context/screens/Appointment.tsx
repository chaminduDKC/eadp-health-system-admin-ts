import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Box from "@mui/material/Box";
import axiosInstance, {startTokenRefreshInterval} from "../../../axios/axiosInstance.ts";
import {useEffect, useState} from "react";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {Autocomplete, Card, CardContent, CircularProgress, TextField} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import CakeIcon from "@mui/icons-material/Cake";
import WcIcon from "@mui/icons-material/Wc";
import PhoneIcon from "@mui/icons-material/Phone"
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { motion } from "framer-motion";
import AlertHook from '../../../alert/Alert.ts'
import {Alert, Collapse} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import MenuItem from "@mui/material/MenuItem";
import type {Dayjs} from "dayjs";



const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            duration: 0.4,
            ease: "easeOut"
        }
    }),
};

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

interface Column {
    id: 'patientName' | 'date' | 'time' | 'reason' | 'status';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center' | 'left';
    format?: (value: number) => string;
}
type Patient = {
    patientId: string,
    name: string,
    userId?: string,
    email:string,
    address:string,
    age:number,
    gender:string,
    phone:string,
}

const columns: readonly Column[] = [
    { id: 'patientName', label: 'Patient', minWidth: 150 },
    { id: 'date', label: 'Date', minWidth: 100, align:"center" },
    {
        id: 'time',
        label: 'Time',
        minWidth: 60,
        align: 'center',
    },
    {
        id: 'reason',
        label: 'Reason',
        minWidth: 100,
        align: 'center',
    },
    {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        align: 'right',
    },
];


// type Patient = {
//     id:string,
//     name:string
// }
type Specialization = {
    specializationId:string,
    specialization:string
}
type Doctor = {
    doctorId:string,
    name:string,
    email:string,
    phoneNumber:string
}
type TimeSlot = {
    id:string,
    name:string
}

type Hospital = {
    hospitalName:string
}


export default function Appointment() {

    const [bookings, setBookings] = useState([]);


    const userUrl = import.meta.env.VITE_USER_API;
    const bookingUrl = import.meta.env.VITE_BOOKING_API;
    const patientUrl = import.meta.env.VITE_PATIENT_API;
    const doctorUrl = import.meta.env.VITE_DOCTOR_API;
    const specializationUrl = import.meta.env.VITE_SPECIALIZATION_API;
    const availabilityUrl = import.meta.env.VITE_AVAILABILITY_API;
    const hospitalUrl = import.meta.env.VITE_HOSPITAL_API;

    const {openAlert, showAlert, closeAlert, alertStatus } = AlertHook();

    const [patient, setPatient] = useState<Patient | null>();
    const [patId, setPatId] = useState<string>("")
    const [patName, setPatName] = useState<string>()
    const [patients, setPatients] = useState<Patient[]>([]);

    const [specName, setSpecName] = useState<string>("")
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [specialization, setSpecialization] = useState<string>();
    const [doctor, setDoctor] = useState<string>("");
    const [docName, setDocName] = useState<string>("")
    const [docId, setDocId] = useState<string>("")
    const [specId, setSpecId] = useState<string>("")
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchText, setSearchText] = useState<string>("");

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<string>("")
    const [reason, setReason] = useState<string>("Any Reason")
    const [loading, setLoading] = useState<boolean>(false);
    const [bookingsCount, setBookingsCount] = useState<number>(0);


    useEffect(() => {
        startTokenRefreshInterval();
        fetchPatients()
        fetchSpecializations()
        fetchBookings()
    }, []);




    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (_event, newPage: number) => {
        setPage(newPage);
        fetchBookings(newPage, rowsPerPage, searchText);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchBookings(0, newSize, searchText);
    };



    const [patientDetails, setPatientDetails] = React.useState<Patient | null>(null)


    const [openPatientDetailModal, setOpenPatientDetailModal] = React.useState(false);

    const handleOpenPatientDetails = (data:Patient) => {

        if(!data){
            console.error("Patient details are not available.");
            return;
        }

        setPatientDetails(data);
        setOpenPatientDetailModal(true);
    };
    const handleClosePatientDetailModal = () => {
        setOpenPatientDetailModal(false);
        setPatientDetails(null);
    };


    const fetchPatients = async () => {
        try {
            const response = await axiosInstance.get(`${patientUrl}/find-all-patients`,
                {params: {searchText:"", page: 0, size: 1000}}
            );
            if(response.data.data.patientList.length === 0){
                showAlert("No patients available now. Please try again")
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
            } else{
                const patientNames:Patient[] = response.data.data.patientList.map((p: { patientId: string; name: string; }) => ({
                    id: p.patientId,
                    name: p.name,
                }));
                setPatients(patientNames);
            }

        } catch (error:unknown) {
            showAlert("Failed to load patients. "+error.message);
            setTimeout(()=>{
                closeAlert()
            }, 2000)

            console.log(error)

        }
    };

    const fetchSpecializations = async ()=>{
        try {
            const response = await axiosInstance.get(`${specializationUrl}/find-all-specializations`,{params: {searchText:""}});
            if(response.data.data.length === 0){
                showAlert("No specialization available now. Try again")
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
            } else {
                setSpecializations(response.data.data);
            }

        } catch (error) {
            console.error("Error fetching specializations:", error);
            showAlert("Failed to load specializations. "+error.message)
            setTimeout(()=>{
                closeAlert()
            }, 2000)
        }
    }

    const fetchDoctorsBySpecialization = async (specialization = specName)=>{
        try {
            const response = await axiosInstance.get(`${doctorUrl}/find-doctors-by-specialization`,{params: {specialization}}
            );
            if(response.data.data.length === 0){
                showAlert("No doctors available for this specialization")
                setDoctors([])
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
            } else {
                setDoctors(response.data.data);
            }

        } catch (error) {
            showAlert("Failed load doctors. "+error.message)
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            console.error("Error fetching doctors by specialization:", error);
        }

    }

    const [availableDatesByDoctor, setAvailableDatesByDoctor] = useState([]);
    const getAvailableDatesByDoctor = async (docId:string)=>{
        try {
            const response = await axiosInstance.get(`${bookingUrl}/get-available-dates-by-doctor/${docId}`)
            if(response.data.data?.length === 0){
                setAvailableSlots([])
                showAlert("No dates available for selected doctor. Try another doctor")
                setAvailableDatesByDoctor([])
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
            } else {
                setAvailableDatesByDoctor(response.data.data)
            }
        } catch (e) {
            console.log(e)
            showAlert("Failed to load dates. Try again")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
        }

    }

    const fetchTimeSlots = async (docId:string, date:string) => {
        try {
            const response = await axiosInstance.get(`${availabilityUrl}/get-availabilities-by-date-and-doctor/${docId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
                params: {date: date}
            });
            if (response.data.data.length === 0) {
                showAlert("failed-not-selected-or-available")
                setAvailableSlots([]);
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
                return[];
            } else {
                const slots:TimeSlot = response.data.data.map((slot:TimeSlot, idx:number) => ({id:idx, name: slot}));
                // @ts-ignore
                setAvailableSlots(slots);
                return slots;
            }

        } catch (err) {
            showAlert("Failed to load time slots. Try again later");
            console.log(err)
            setAvailableSlots([]);
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            return [];
        }
    }

    const clearAppointmentData = ()=>{
        setSelectedDate(null);
        setPatName("")
        setDocName("")
        setTime("")
        setSpecName("")
    }

    const handleCreateAppointment = async ()=>{
        if(!patName || !docName || !specName || !selectedDate || !time || !reason){
            showAlert("Please fill all fields")
            setTimeout(()=>{
                closeAlert()
            },2000)

        } else {
            const date = selectedDate.format("YYYY-MM-DD")
            const bookingRequest = {
                patientId:patId,
                patientName:patName,
                doctorId:docId,
                doctorName:docName,
                date:date,
                time:time,
                reason:reason,
                status:"PENDING",
                paymentStatus:"COMPLETED"
            }

            try {
                await axiosInstance.post(`${bookingUrl}/create-booking`, bookingRequest).then(()=>{
                    setLoading(false);
                    clearAppointmentData();
                    showAlert("Appointment created successfully")
                });

            } catch (e) {
                setLoading(false);
                showAlert("Failed to create Appointment")
                console.log(e)
                setTimeout(()=>{
                    closeAlert()
                },2000)
            }

        }

    }

    const fetchBookings = async (pageNumber=page, size = rowsPerPage, search:string = searchText)=>{
        try {
            const response = await axiosInstance.get(`${bookingUrl}/find-all-bookings`,

                {params: {searchText:search, page: pageNumber, size: size}}
            );
            console.log(response)
            setBookings(response.data.data.bookingList);
            setBookingsCount(response.data.data.bookingCount);
        } catch (error) {
            showAlert("failed-fetch")
            console.error("Error fetching bookings:", error);
            return [];
        }
    }

    const fetchPatientDetails = async (id:string)=>{
        try {
            const response = await axiosInstance.get(`${patientUrl}/find-patient/${id}`)
            return response.data.data;
        } catch (error) {
            console.error("Error fetching patient details:", error);
            return null;
        }
    };

    return (
        <Box sx={{width:"100%",mx:"auto", marginTop:"100px", marginBottom:{
                xl:"50px",
                lg:"460px",
                md:"50px",
                sm:"50px",
                xs:"50px",
            }, padding:{
                xl:"20px 200px",
                lg:"20px 15px",
                md:"20px 200px",
                sm:"20px 50px",
                xs:"20px 5px",
            },}}>
            <Box sx={{
                display:{xl:"flex", lg:"flex", md:"column", sm:"column", xs:"column"},
                gap:{xl:5, lg:4, md:10, sm:50, xs:10}
            }}>
                <Box sx={{
                    flex:1,
                    backgroundColor:"background.paper",
                    padding:"10px",
                    height:"600px",
                    borderRadius:2,
                    marginBottom:{md:"40px", sm:"40px", xs:"30px"}
                }}>
                    <Typography variant="h5" gutterBottom sx={{color:"primary.main"}}>
                        Book an Appointment
                    </Typography>
                    <Autocomplete
                        sx={{
                            color: 'var(--text-primary)',
                            input: { color: 'var(--text-primary)' },
                            label: { color: 'var(--text-secondary)' },
                            marginTop: "15px"
                        }}
                        value={patients?.find(p => p.name === patName) || null}
                        onChange={(_event, newValue) => {
                            if (newValue) {
                                setPatient(newValue);     // full object
                                setPatId(newValue.id);    // patient ID
                                setPatName(newValue.name); // just the name string
                            } else {
                                setPatient(null);
                                setPatId("");
                                setPatName("");
                            }
                        }}
                        options={patients}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Patients" />}
                    />

                    <Autocomplete
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: { color: 'var(--text-primary)' },
                            label: { color: 'var(--text-secondary)' },
                            marginTop: "15px"
                        }}
                        disabled={!patName}
                        value={specializations?.find(p => p.specialization === specName) || null}
                        onChange={(_event, newValue) => {
                            if (newValue) {
                                setSpecialization(newValue.specialization);     // full object
                                setSpecId(newValue.specializationId);    // patient ID
                                setSpecName(newValue.specialization); // just the name string
                                fetchDoctorsBySpecialization(newValue.specialization);
                            } else {
                                setDoctor("");
                                setDocId("");
                                setDocName("");
                            }
                        }}
                        options={specializations}
                        getOptionLabel={(option) => option.specialization || ""}
                        isOptionEqualToValue={(option, value) => option.specializationId === value.specializationId}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Specializations" />}
                    />
                    <Autocomplete
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: { color: 'var(--text-primary)' },
                            label: { color: 'var(--text-secondary)' },
                            marginTop: "15px",
                            marginBottom:"15px"
                        }}
                        disabled={!specName}
                        value={doctors?.find(p => p.name === docName) || null}
                        onChange={(_event, newValue) => {
                            if (newValue) {
                                setDoctor(newValue.name);     // full object
                                setDocId(newValue.doctorId);    // patient ID
                                setDocName(newValue.name); // just the name string
                                console.log( (newValue.doctorId)); // just the name string
                                getAvailableDatesByDoctor(newValue.doctorId);
                            } else {
                                getAvailableDatesByDoctor(docId);
                                console.log("New value")
                            }
                        }}
                        options={doctors}
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) => option.doctorId === value.doctorId}
                        fullWidth
                        renderInput={(params) => <TextField {...params} label="Doctors" />}
                    />

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker

                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => {
                                console.log(newValue)
                                console.log(" doc iid is "+docId)
                                setSelectedDate(newValue);
                                if (docId && newValue) {
                                    const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : newValue;
                                    fetchTimeSlots(docId, formattedDate);
                                }
                            }}
                            disabled={!docName}
                            disablePast
                            shouldDisableDate={d => {
                                if (!doctor || !availableDatesByDoctor || !Array.isArray(availableDatesByDoctor)) return true;
                                const iso:string = d.format('YYYY-MM-DD');
                                // @ts-ignore
                                return !availableDatesByDoctor.includes(iso);
                            }}
                            format="YYYY-MM-DD"

                            slotProps={{
                                textField:{fullWidth:true}
                            }}
                        />
                    </LocalizationProvider>

                    <TextField
                        sx={{
                            marginTop:"15px",
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        id="outlined-select-experience"
                        select
                        disabled={!selectedDate}
                        variant="filled"
                        fullWidth
                        label="Time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    >
                        {availableSlots.map((option) => (
                            <MenuItem key={option.id} value={option.name}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        sx={{
                            marginTop:"15px",
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        id="outlined-select-experience"
                        variant="filled"
                        fullWidth
                        disabled={!time}
                        label="Reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button type="submit" onClick={(e) => {
                            handleCreateAppointment(e);
                        }} variant="text"

                                sx={{
                                    color: "primary.main",
                                    height: 40,
                                    minWidth: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                            {loading ?
                                <CircularProgress size={24} />
                                : "Schedule"}
                        </Button>

                        <Button
                            sx={{
                                color:"var(--color-green-dark)",

                                fontWeight:"bold"
                            }}

                            onClick={() => {
                                setLoading(false)
                                clearAppointmentData();
                            }}>Cancel</Button>

                    </Box>
                </Box>

                <Box sx={{
                    flex:1.6,
                    backgroundColor:"background.paper",
                    padding:"10px",
                    borderRadius:2,
                    height:"600px",
                    display:"flex",
                    flexDirection:"column",
                }}>
                    <Typography variant="h5" gutterBottom color="primary.main" component="div">
                        Appointments
                    </Typography>
                    <Box sx={{
                        marginTop:"12px",
                        display:"flex",
                        gap:{xl:10, lg:10, md:5, sm:4, xs:1},

                    }}>
                        <TextField
                            sx={{

                                "& .MuiFilledInput-root": {
                                    borderRadius: "25px", // fully rounded
                                    backgroundColor: "background.default", // light gray background (change if needed)
                                    border: "none",
                                    outline: "none",
                                    "&:before, &:after": {
                                        display: "none", // removes underline in filled variant
                                    },
                                    "&:hover": {
                                        backgroundColor: "background.default",
                                    }
                                },
                                "& .MuiFilledInput-input": {
                                    paddingLeft:"30px" , // space inside
                                }
                            }}
                            value={searchText}
                            fullWidth
                            id="filled-search"
                            label="Search by name or specialization or email"
                            type="search"
                            variant="filled"
                            onChange={(e) => {
                                const value = e.target.value;
                                setSearchText(value);
                                console.log("search text is " + value);
                                fetchBookings(page, rowsPerPage, value);
                            }}
                        />

                        <Button sx={{
                            width:"200px",
                            height:"60px",
                            fontSize:"20px"
                        }} variant="text" onClick={()=>{
                            fetchBookings(page, rowsPerPage, searchText)
                        }} >See List</Button>
                    </Box>
                    <Paper sx={{width: '100%', overflow: 'hidden'}}>

                        <TableContainer sx={{
                            maxHeight: 420,
                            height:"fit-content",
                            overflowY: "auto", // allow vertical scrolling
                            scrollbarWidth: "none", // Firefox
                            "&::-webkit-scrollbar": {
                                display: "none", // Chrome, Safari
                            }
                        }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell sx={{color:"primary.main"}}
                                                       key={column.id}
                                                       align={column.align}
                                                       style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookings.map((row, index) => (
                                        <motion.tr
                                            key={index}
                                            custom={index}
                                            initial="hidden"
                                            animate="visible"
                                            variants={rowVariants}
                                            onClick={() => fetchPatientDetails(row.patientId)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {columns.map((column, colIndex) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={colIndex} align={column.align}>
                                                        {value}
                                                    </TableCell>
                                                );
                                            })}
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={bookingsCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>

                </Box>




            </Box>

            {/*alert*/}
            <Collapse  sx={{
                width: { xs: '96%', sm: '80%', md: '60%' },
                margin: "0 auto",
                position: "fixed",
                top: "85px",
                right: 0,
                left: 0,
                zIndex: 14,
                px: { xs: 1, sm: 0 }
            }} in={openAlert}>
                <Alert
                    severity={alertStatus.includes("success") ? "success" : "error"}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            onClick={closeAlert}
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                    sx={{
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                        alignItems: "center"
                    }}
                >
                    {alertStatus === "failed-fetch-pat" && "Failed to load patient details. Please refresh the page and try again."}
                    {alertStatus === "no-pat" && "Something went wrong. This patient is not available"}
                    {alertStatus === "failed-fetch-apps" && "Failed to load your booked appointments. Please refresh the page and try again."}
                </Alert>
            </Collapse>
            {/*alert*/}
        </Box>
    );
}
