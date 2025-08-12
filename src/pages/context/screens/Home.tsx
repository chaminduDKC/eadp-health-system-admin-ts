import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Button, Card, CardContent,  Avatar, Divider, Autocomplete, TextField, InputAdornment} from "@mui/material";
import { Alert, Collapse, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import DoctorImage from "../../../../public/doctor.png";
import AlertHook from "../../../alert/Alert.ts";
import { motion } from "framer-motion";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { LineChart } from "@mui/x-charts";
import ReusableModal from "./ReusableModal/ReusableModal.tsx";
import {useEffect, useState} from "react";
import axiosInstance, {startTokenRefreshInterval} from "../../../axios/axiosInstance.ts";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import type {Dayjs} from "dayjs";
import MenuItem from "@mui/material/MenuItem";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {string} from "prop-types";


const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};



type Patient = {
    id:string,
    name:string
}
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
type MonthlyPatientData = {
    month:string,
    patients:number
}
const Home = () => {

    const userurl = import.meta.env.VITE_USER_API;
    const bookingUrl = import.meta.env.VITE_BOOKING_API;
    const patientUrl = import.meta.env.VITE_PATIENT_API;
    const doctorUrl = import.meta.env.VITE_DOCTOR_API;

    const theme = useTheme();
    const { openAlert, alertStatus, showAlert, closeAlert } = AlertHook();

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

    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [time, setTime] = useState<string>("")
    const [reason, setReason] = useState<string>("Any Reason")
    const [loading, setLoading] = useState<boolean>(false);
    const [numberOfMonths, setNumberOfMonths] = useState<number>(6);
    const [patientsData, setPatientsData] = useState<MonthlyPatientData[]>([]);



    useEffect(() => {
        startTokenRefreshInterval();
        fetchMonthlyPatientOverview(numberOfMonths);
        fetchPatients()
        fetchSpecializations()
        fetchHospitals()
    }, []);


    const fetchPatients = async () => {
        try {
            const response = await axiosInstance.get("http://localhost:9092/api/patients/find-all-patients",
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

        } catch (error) {
            showAlert("Failed to load patients. Try again later");
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            console.log(error)

        }
    };

    const fetchSpecializations = async ()=>{
        try {
            const response = await axiosInstance.get("http://localhost:9091/api/specializations/find-all-specializations",{params: {searchText:""}}
            );
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
            showAlert("Failed to load specializations. Try again")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
        }
    }

    const fetchDoctorsBySpecialization = async (specialization = specName)=>{
        try {
            const response = await axiosInstance.get(`http://localhost:9091/api/doctors/find-doctors-by-specialization`,{params: {specialization}}
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
            showAlert("Failed load doctors. Try again later")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            console.error("Error fetching doctors by specialization:", error);
        }

    }

    const [availableDatesByDoctor, setAvailableDatesByDoctor] = useState([]);
    const getAvailableDatesByDoctor = async (docId:string)=>{
        try {
            const response = await axiosInstance.get(`http://localhost:9093/api/bookings/get-available-dates-by-doctor/${docId}`)
            console.log(response.data.data)
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
            showAlert("Failed to load dates. Try again")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
        }

    }

    const fetchTimeSlots = async (docId:string, date:string) => {
        console.log("doc id id in method "+docId)
        console.log("date in method "+date)
        try {
            const response = await axiosInstance.get(`http://localhost:9093/api/availabilities/get-availabilities-by-date-and-doctor/${docId}`, {
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
                setAvailableSlots(slots);
                return slots;
            }

        } catch (error) {
            showAlert("Failed to load time slots. Try again later");
            setAvailableSlots([]);
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            return [];
        }
    }

    const fetchMonthlyPatientOverview = async (numberOfMonths:number) =>{
        if(numberOfMonths > 12){
            showAlert("You can see data upto 12 months only")
            return
        }
        axiosInstance.get(`${patientUrl}/find-patients-by-month`, {params:{NumberOfMonth:numberOfMonths}}).then(res=>{
            console.log(res.data.data)
            setPatientsData(res.data.data);
        }).catch(res=>{
            showAlert("Failed to load patient overview data. Try again")
            console.log("error")
            console.log(res)
        })
    }
    const statsData = [
        {
            label: "Appointments",
            value: "24",
            icon: <EventIcon />,
            iconColor: "#42a5f5", // Blue
            chartData: [3, 5, 7, 6, 8, 9, 11],
        },
        {
            label: "Patients Today",
            value: "18",
            icon: <GroupIcon />,
            iconColor: "#66bb6a", // Green
            chartData: [3, 5, 7, 6, 8, 9, 11],
        },
        {
            label: "New Messages",
            value: "5",
            icon: <NotificationsActiveIcon />,
            iconColor: "#ffa726", // Orange
            chartData: [1, 3, 2, 4, 3, 5, 6],
        },
        {
            label: "Doctors Online",
            value: "3",
            icon: <LocalHospitalIcon />,
            iconColor: "#ef5350", // Red
            chartData: [2, 3, 2, 5, 4, 6, 7],
        },
    ];
    const clearAppointmentData = ()=>{
        setSelectedDate(null);
        setPatName("")
        setDocName("")
        setTime("")
        setSpecName("")
    }


    // ---------------------------------------------
    const [openAppointmentModal, setOpenAppointmentModal] = useState<boolean>(false);
    const handleCloseAppointmentModal = ()=>{
        setOpenAppointmentModal(false);
        clearAppointmentData();


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
                await axiosInstance.post("http://localhost:9093/api/bookings/create-booking", bookingRequest).then((res)=>{
                    setLoading(false);
                    setOpenAppointmentModal(false);
                    clearAppointmentData();
                    showAlert("Appointment created successfully")
                });

            } catch (e) {
                setLoading(false);
                showAlert("Failed to create Appointment")
                setTimeout(()=>{
                    closeAlert()
                },2000)
            }

        }

    }

    // ----------------------------------------------


    // ---------------------------------------------------------------
    // ---------------------------------------------------------------

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [phone, setPhone] = useState<string>("")
    const [age, setAge] = useState<string>("")
    const [gender, setGender] = useState<string>("")

    const genders:string[] = [
        "Male","Female","Other"
    ]

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const isValidName:boolean =/^[A-Za-z\s]+$/.test(fullName);
    const isValidEmail:boolean = /\S+@\S+\.\S+/.test(email);
    const isValidPassword:boolean = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);

    const clearPatientDoctorData = ()=>{
        setFullName("");
        setEmail("")
        setAddress("")
        setPassword("")
        setPhone("")
        setAge("")
        setGender("")
        setSpecName("")
        setExperience("")
        setHospital("")
        setCity("")
        setLicenceNo("")
        setNewsTitle("")
        setNewsContent("")
        setNewsImageUrl("")
    }


    const [openCreatePatientModal, setOpenCreatePatientModal] = useState<boolean>(false);
    const handleCloseCreatePatientModal = ()=>{
        setOpenCreatePatientModal(false);
        clearPatientDoctorData();
    }
    const handleCreatePatient = async ()=>{
        if(!fullName || !email || !address || !phone || !gender || !age || !password){
            showAlert("Fill all fields")
            setTimeout(()=>{
                closeAlert();
            }, 2000)
            setLoading(false);
        } else {
            const date = new Date().toLocaleDateString('en-CA')
            console.log(date)
            const request = {
                name:fullName,
                email:email,
                password:password,
                address:address,
                phone:phone,
                gender:gender,
                age:age,
                createdDate:date
            };
            try {
                await axiosInstance.post("http://localhost:9090/api/users/register-patient",
                    request);
                showAlert("Patient created successfully")
                setLoading(false);
                setOpenCreatePatientModal(false);
                clearPatientDoctorData();
                fetchMonthlyPatientOverview(numberOfMonths);
            } catch (e) {
                showAlert("Failed to create patient. Try again")
                setLoading(false);
                setTimeout(()=>{
                    closeAlert();
                }, 2000)

            }
        }
    }

    // ----------------------------------------------------------------------

    const [licenceNo, setLicenceNo] = useState<string>("")
    const [experience, setExperience] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [hospital, setHospital] = useState<Hospital | string | null | undefined>("")
    const [hospitals, setHospitals] = useState<Hospital[]>([]);


    const fetchHospitals =  async ()=>{

        await axiosInstance.get("http://localhost:9091/api/hospitals/find-all-hospitals", {params:{
                searchText:""
            }}).then(res=>{
            setHospitals(res.data.data)
        }).catch(err=>{
            console.log(err)
            showAlert("Failed to load hospitals")
        })

    }

    const [openCreateDoctorModal, setOpenCreateDoctorModal] = useState<boolean>(false);
    const handleCloseCreateDoctorModal = ()=>{
        setOpenCreateDoctorModal(false);
        clearPatientDoctorData();
        // clearDoctorData();
    }
    const handleCreateDoctor = async (e)=>{
        setLoading(true)
        e.preventDefault();
        if(!fullName ||  !address || !phone || !specialization  || !hospital || !city || !experience || !licenceNo) {
            showAlert("Please fill all fields")
            setLoading(false)
        } else {
            const request = {
                email:email,
                name:fullName,
                password:password,
                phone:phone,
                specialization:specName,
                experience: experience,
                hospital: hospital,
                address: address,
                licenceNo: licenceNo,
                city: city
            }
            console.log(request);
            await axiosInstance.post(`${userurl}/register-doctor`, request).then(res=>{
                console.log(res)
                showAlert("Doctor created successfully")
                setOpenCreateDoctorModal(false);
                setLoading(false);
                clearPatientDoctorData();
            }).catch((err)=>{
                if(err.status === 409){
                    showAlert("This email is already exist. Try another one")
                    setTimeout(()=>{
                        closeAlert()
                    },3000)
                    setLoading(false)
                } else {
                    showAlert("Failed to create the doctor. Try again")
                    setTimeout(()=>{
                        closeAlert()
                    },2000)
                    console.log(err)
                    setLoading(false)
                }
            })
        }
    }
    // ----------------------------------------------------------------------

    const [openHospitalModal, setOpenHospitalModal] = useState<boolean>(false);
    const [hospitalName, setHospitalName] = useState<string>("");
    const handleCloseHospitalModal = ()=>{
        setOpenHospitalModal(false);
    }
    const handleCreateHospital = async ()=>{
        if(!hospitalName){
            showAlert("Fill all fields")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            return
        }
            await axiosInstance.post("http://localhost:9091/api/hospitals/save-hospital", {hospitalName:hospitalName}).then((res)=>{
                console.log(res.data)
                setOpenHospitalModal(false)
                showAlert("New hospital created successfully")
                setHospitalName("")
                fetchHospitals();
            }).catch((err)=>{
                console.log(err)
                showAlert("Failed to create new hospital")
                setTimeout(()=>{
                    closeAlert();
                }, 3000)
            })

    }

    const [openSpecializationModal, setOpenSpecializationModal] = useState<boolean>(false);
    const [specializationName, setSpecializationName] = useState<string>("");
    const handleCloseSpecializationModal = ()=>{
        setOpenSpecializationModal(false);
    }
    const handleCreateSpecialization = async ()=>{
        if(!specializationName){
            showAlert("Fill all fields")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            return
        }
        await axiosInstance.post("http://localhost:9091/api/specializations/create-specialization", {specialization:specializationName}).then((res)=>{
            console.log(res.data)
            setOpenSpecializationModal(false)
            showAlert("New specialization created successfully")
            setSpecializationName("")
            fetchSpecializations();
        }).catch((err)=>{
            console.log(err)
            showAlert("Failed to create new specialization")
            setTimeout(()=>{
                closeAlert();
            }, 3000)
        })

    }
    const [openCreateNewsModal, setOpenCreateNewsModal] = useState<boolean>(false);
    const [newsTitle, setNewsTitle] = useState<string>("")
    const [newsContent, setNewsContent] = useState<string>("")
    const [newsImageUrl, setNewsImageUrl] = useState<string>("")
    const handleCloseNewsModal = ()=>{
        setOpenCreateNewsModal(false);
    }
    const handleCreateNews = async ()=>{
        if(!newsTitle || !newsContent || !newsImageUrl){
            showAlert("Fill all fields")
            setTimeout(()=>{
                closeAlert()
            }, 2000)
            return
        } else {
            const newsReq = {
                title:newsTitle,
                content:newsContent,
                imageUrl:newsImageUrl
            }
            await axiosInstance.post("http://localhost:9092/api/news/create-news", newsReq).then(res=>{
                console.log(res)
                showAlert("News created success")
                clearPatientDoctorData();
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
            }).catch(err=>{
                showAlert("Failed to create the news")
                setTimeout(()=>{
                    closeAlert()
                }, 2000)
                console.log(err)
            })
        }

    }
    return (
        <Box
            sx={{
                width: "100%",
                mx: "auto",
                marginTop: "60px",
                marginBottom: {
                    xl: "50px",
                    lg: "460px",
                    md: "50px",
                    sm: "50px",
                    xs: "50px",
                },
                padding: {
                    xl: "20px 200px",
                    lg: "20px 100px",
                    md: "20px 20px",
                    sm: "20px 50px",
                    xs: "20px 10px",
                },
            }}
        >
            {/*appointment modal*/}

            <ReusableModal onClose={handleCloseAppointmentModal} open={openAppointmentModal} title={"Schedule an Appointment"} actions={[ { label: "Close", onClick: handleCloseAppointmentModal, color: "primary", variant: "outlined" },
                { label: loading ? "scheduling" :"schedule", disabled:loading, onClick: handleCreateAppointment, color: "secondary", variant:"contained" }]} content={
                <Box>
                    <Typography>

                    </Typography>
                    <Box>
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
                                    const iso = d.format('YYYY-MM-DD');
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
                    </Box>
                </Box>
            }  />

            {/*create patient modal*/}

            <ReusableModal onClose={handleCloseCreatePatientModal} open={openCreatePatientModal} title={"Add a new patient"} actions={[ { label: "Close", onClick: handleCloseCreatePatientModal, color: "primary", variant: "outlined"  },
                { label: loading ? "creating" :"create", disabled:loading, onClick: handleCreatePatient, color: "secondary", variant:"contained" }]} content={
                <Box>
                    <Typography>
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Full name"

                            variant="filled"
                            helperText={!isValidName && "Name must be contain letters" }
                            fullWidth
                            required
                            type="text"
                            value={fullName}
                            onChange={(e)=>{
                                setFullName(e.target.value)
                            }}
                        />

                        <TextField

                            label="Address"
                            variant="filled"
                            fullWidth
                            required
                            type="text"
                            value={address}
                            onChange={(e)=>{
                                setAddress(e.target.value)
                            }}
                        />

                        <TextField
                            label="Email"
                            variant="filled"
                            helperText={!isValidEmail && "Enter correct email" }
                            fullWidth
                            required
                            type="email"
                            value={email}
                            onChange={(e)=>{
                                setEmail(e.target.value)
                            }}
                        />

                        <TextField
                            label="Password"
                            variant="filled"
                            fullWidth
                            required
                            helperText={!isValidPassword ? "must contain at least 6 characters and include @ or &" : ""}
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e)=>{
                                setPassword(e.target.value)
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: {xl:3, lg:2, md:1, sm:1, xs:0},
                            flexDirection: {xs: "column", sm: "row"},
                            marginTop:-2
                        }}>
                            <TextField

                                label="Phone"
                                variant="filled"
                                margin="normal"
                                fullWidth

                                required
                                type="text"
                                value={phone}
                                onChange={(e => setPhone(e.target.value))}
                            />
                            <TextField
                                sx={{
                                    marginTop: "8px"
                                }}
                                id="outlined-select-experience"
                                select
                                variant="filled"
                                fullWidth
                                label="Gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                            >
                                {genders.map((option) => (
                                    <MenuItem key={option} value={option}
                                              sx={{

                                              }}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField

                                label="Age"
                                variant="filled"
                                margin="normal"
                                fullWidth
                                required
                                type="number"
                                value={age}
                                onChange={(e => setAge(e.target.value))}
                            />
                        </Box>

                    </Box>
                </Box>
            }  />

            {/*create doctor modal*/}

            <ReusableModal onClose={handleCloseCreateDoctorModal} open={openCreateDoctorModal} title={"Add a new doctor"} actions={[
                {
                    label: "Close",
                    onClick: handleCloseCreateDoctorModal,
                    color: "primary",
                    variant: "outlined"
                },
                {
                    label: loading ? "creating" :"create", disabled:loading,
                    onClick: handleCreateDoctor,
                    color: "secondary",
                    variant: "contained"
                }
            ]} content={
                <Box sx={{
                    display:"flex",
                    flexDirection:"column",
                    gap:"8px"
                }}>
                    <TextField
                        sx={{
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            input: {color: 'var(--text-primary)'},
                            label: {color: 'var(--text-secondary)'}
                        }}
                        label="Full name"
                        variant="filled"
                        fullWidth
                        required
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                    <Box sx={{display: "flex", flexDirection:{xl:"row", lg:"row", md:"row", sm:"column", xs:"column"}, width: "100%", alignItems: "center", justifyContent: "space-between", gap: "10px"}}>
                        <TextField
                            label="Phone"
                            variant="filled"
                            fullWidth
                            required
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <TextField

                            label="Licence No"
                            variant="filled"
                            fullWidth
                            required
                            type="text"
                            value={licenceNo}
                            onChange={e => setLicenceNo(e.target.value)}
                        />
                        <Autocomplete

                            value={specializations.find(p => p.specialization === specName) || null}
                            onChange={(_event, newValue) => {
                                if (newValue) {
                                    setSpecialization(newValue.specialization);     // string
                                    setSpecName(newValue.specialization); // just the name string

                                }
                            }}
                            options={specializations}
                            getOptionLabel={(option) => option.specialization || ""}
                            isOptionEqualToValue={(option, value) => option.specializationId === value.specializationId}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Specializations" />}
                        />
                    </Box>

                    <TextField

                        label="Address"
                        variant="filled"
                        fullWidth
                        required
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />

                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexDirection:{xl:"row", lg:"row", md:"row", sm:"column", xs:"column"}
                    }}>
                        <Autocomplete

                            value={hospital}
                            onChange={(_event, newValue) => setHospital(newValue)}
                            options={hospitals}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Hospital" />}
                        />

                        <TextField
                            label="City"
                            variant="filled"

                            required
                            type="text"

                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            fullWidth
                        />

                        <TextField

                            id="outlined-select-experience"
                            variant="filled"
                            fullWidth
                            label="Experience in years"
                            type="number"
                            value={experience}
                            onChange={e => setExperience(e.target.value)}
                        >

                        </TextField>
                    </Box>

                    <TextField

                        label="Email"
                        variant="filled"
                        fullWidth
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}

                    />
                    <TextField
                        // sx={{
                        //     backgroundColor: 'var(--bg-secondary)',
                        //     color: 'var(--text-primary)',
                        //     input: {color: 'var(--text-primary)'},
                        //     label: {color: 'var(--text-secondary)'}
                        // }}
                        label="Password"
                        variant="filled"

                        fullWidth
                        helperText={!isValidPassword ? "must contain one of @ or & and be at least 6 characters long" :""}
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            }            />

            <ReusableModal onClose={handleCloseHospitalModal} open={openHospitalModal} title="Add new hospital" actions={
                [
                    {label:"close", onClick:handleCloseHospitalModal, variant:"outlined" },
                    {label: loading ? "creating" : "Create", onClick: handleCreateHospital, variant: "contained", disabled:!loading}
                ]
            } content={
                <Box>
                    <TextField
                        id="hospital"
                        label="Hospital Name"
                        type="text"
                        fullWidth
                        value={hospitalName}
                        onChange={(e)=>{
                            setHospitalName(e.target.value)
                        }}

                    />
                </Box>
            }/>

            <ReusableModal onClose={handleCloseSpecializationModal} open={openSpecializationModal} title="Add new hospital" actions={
                [
                    {label:"close", onClick:handleCloseHospitalModal, variant:"outlined" },
                    {label: loading ? "creating" : "Create", onClick: handleCreateSpecialization, variant: "contained", disabled:!loading}
                ]
            } content={
                <Box>
                    <TextField
                        id="specialization"
                        label="Specialization Name"
                        type="text"
                        fullWidth
                        value={specializationName}
                        onChange={(e)=>{
                            setSpecializationName(e.target.value)
                        }}

                    />
                </Box>
            }/>

            <ReusableModal onClose={handleCloseNewsModal} open={openCreateNewsModal} title="Add new news" actions={
                [
                    {label:"close", onClick:handleCloseNewsModal, variant:"outlined" },
                    {label: loading ? "creating" : "Create", onClick: handleCreateNews, color:"secondary",  variant: "contained", disabled:!loading}
                ]
            } content={
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        id="title"
                        label="Title"
                        type="text"
                        fullWidth
                        value={newsTitle}
                        onChange={(e)=>{
                            setNewsTitle(e.target.value)
                        }}

                    />

                    <TextField
                        id="content"
                        label="Content"
                        type="text"
                        multiline
                        rows={4}
                        fullWidth
                        value={newsContent}
                        onChange={(e)=>{
                                setNewsContent(e.target.value)

                        }}

                    />
                    <TextField
                        id="imageUrl"
                        label="Paste image url"
                        type="text"
                        fullWidth
                        value={newsImageUrl}
                        onChange={(e)=>{
                            setNewsImageUrl(e.target.value)
                        }}

                    />
                </Box>
            }/>


            {/* Top Welcome Section */}
            <motion.div variants={itemVariant} initial="hidden" animate="visible">
                <Box sx={{
                    width:"100%",
                    backgroundColor:"background.paper",
                    borderRadius:5,
                    padding:{xl:6, lg:4, md:3, sm:2, xs:1},
                    display:"flex",
                    flexDirection:{xl:"row", sm:"column" , xs:"column"},
                    position:"relative",
                    paddingBottom:{sm:0, xs:0}

                }}>

                    <Box sx={{
                        width:{xl:"65%", lg:"65%", md:"65%", sm:"100%"}
                    }}>
                        <Typography fontWeight="bold" sx={{
                            fontSize:{xl:80, lg:70, md:65, sm:70, xs:50},
                            textAlign:"center",
                            lineHeight:1.2,
                            fontWeightL:"bold",
                            color:"primary.text",
                            fontFamily:"Arial",
                            letterSpacing:2

                        }}>Best Healthcare Service Provider</Typography>
                        <Box sx={{
                            display:"flex",
                            flexDirection:{xl:"row", lg:"row", md:"row",sm:"column", xs:"column"},
                            alignItems:{sm:"center", xs:"center"},
                            marginTop:{xl:12, lg:15, md:20, sm:10, xs:8},
                            gap:{xl:8, lg:8, md:4, sm:5, xs:2}
                        }}>
                            <Typography width="50%" textAlign="center" sx={{
                                width:{sm:"90%", xs:"90%"},
                                fontFamily:'"Roboto"',
                                border:"1px solid",
                                borderColor:"primary.main",
                                padding:"0 10px",
                                borderRadius:2
                            }}>
                                "Comprehensive Healthcare Management Platform Offering Seamless Booking,
                                Patient Care, and Doctor Availability Tracking for Better Outcomes"
                            </Typography>
                            <Button sx={{
                                maxHeight:"50px",
                                width:"50%",
                                fontSize:{xl:18, lg:16, md:16, sm:16, xs:15},
                                color:"white",
                            }} variant="contained" onClick={()=>{
                                setOpenAppointmentModal(true);
                            }}>Schedule appointment</Button>
                        </Box>
                    </Box>

                    <Box component="img" sx={{
                        position:{xl:"absolute", lg:"absolute", md:"absolute"},

                        bottom:{xl:0,lg:0, md:0},
                        right:{xl:-40, lg:-20, md:-20, sm:0},

                        mx:{sm:"auto", xs:"auto"},
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center",
                        objectFit:"cover",
                        objectPosition:"top",
                        width: {xl:"500px", lg:"450px", md:"350px", sm:"400px", xs:"360px"},
                        height: {xl:"450px", lg:"420px", md:"420px", sm:"400px", xs:"400px"},

                    }}
                         alt="The house from the offer."
                         src={DoctorImage}
                    >

                    </Box>


                </Box>
            </motion.div>

            {/* Statistics Cards */}
            <Box mt={4} sx={{
                display:"grid",
                gridTemplateColumns:{xl:"1fr 1fr 1fr 1fr", lg:"1fr 1fr 1fr 1fr", md:"1fr 1fr 1fr", sm:"1fr 1fr", xs:"1fr"},

                gap:{xl:8, lg:5, md:6, sm:4, xs:2}
            }} mb={4}>
                {statsData.map((stat, idx) => (
                    <Box sx={{
                        width:"100%",
                        mx:"auto"
                    }}  key={idx}>
                        <Card sx={{ borderRadius: 3, boxShadow: 4, p: 1, height: "100%" }}>
                            <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                {/* Top Section */}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar sx={{ bgcolor: stat.iconColor, width: 50, height: 50 }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold">
                                            {stat.value}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Sparkline Chart */}
                                <SparkLineChart
                                    data={stat.chartData}
                                    height={50}
                                    showTooltip={true}
                                    colors={[stat.iconColor]}
                                    curve="monotone"
                                />
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {/* Chart + Quick Actions */}
            <Box sx={{
                display:'flex',
                flexDirection:{xl:"row", lg:"row", md:"row", sm:"column", xs:"column"},
                gap:{xl:8, lg:4, md:2, sm:4, xs:3},
                height:"100%"
            }}>
                <Box sx={{
                    flex:2
                }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" mb={2}>
                                Monthly Patients Overview
                            </Typography>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <TextField
                                        value={numberOfMonths}
                                        sx={{
                                            width: "80px",
                                            "& .MuiOutlinedInput-root": {
                                                "& fieldset": {
                                                    border: "none",        // Remove the default border
                                                },
                                                "&:hover fieldset": {
                                                    border: "none",        // Remove border on hover
                                                },
                                                "&.Mui-focused fieldset": {
                                                    border: "none",        // Remove border on focus
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                outline: "none",          // Remove the default outline on input
                                            },
                                        }}
                                        type="number"
                                        onChange={(e)=>{
                                            setNumberOfMonths(e.target.value)
                                        }}
                                    />
                                    <Button onClick={()=>{
                                        fetchMonthlyPatientOverview(numberOfMonths);
                                    }}>Change No: of months </Button>
                                </Box>

                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <LineChart
                                height={300}
                                series={[
                                    {
                                        data: patientsData.map(data=> Math.floor(data.patients)),
                                        label: "Patients",
                                        color: theme.palette.primary.main,
                                    },
                                ]}
                                yAxis={[
                                    {
                                        valueFormatter: (value:number) => Math.round(value).toString(), // Remove decimals
                                    },
                                ]}
                                xAxis={[
                                    {
                                        scaleType: "point",
                                        data: patientsData.map(data=> data.month.slice(0,3)),
                                    },
                                ]}
                            />
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{
                    flex:1
                }}>
                    <Card sx={{ height:"100%", borderRadius: 3, boxShadow: 3,  }}>
                        <CardContent sx={{
                            display:"flex",
                            flexDirection:"column",
                            justifyContent:"space-between",


                        }}>
                            <Typography variant="h6" mb={3}>
                                Quick Actions
                            </Typography>

                            <Button onClick={()=>{
                                setOpenCreatePatientModal(true)
                            }} fullWidth variant="outlined" sx={{ mb: 2 }}>
                                add new Patient
                            </Button>
                            <Button onClick={()=>{
                                setOpenCreateDoctorModal(true)
                            }} fullWidth variant="outlined" sx={{ mb: 2 }}>
                                add new Doctor
                            </Button>
                            <Button onClick={()=>{
                                setOpenHospitalModal(true)
                            }} fullWidth variant="outlined" sx={{ mb: 2 }}>
                                add new Hospital
                            </Button>
                            <Button onClick={()=>{
                                setOpenSpecializationModal(true)
                            }} fullWidth variant="outlined" sx={{ mb: 2 }}>
                                add new specialization
                            </Button>
                            <Button sx={{ mb: 2 }} fullWidth variant="outlined">Send Announcement</Button>
                            <Button onClick={()=>{
                                setOpenCreateNewsModal(true)
                            }} fullWidth variant="outlined">Create a news</Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Alerts */}
            <Collapse sx={{ width: { xs: '96%', sm: '80%', md: '60%' }, margin: "0 auto", position: "fixed", top: "65px", right: "0", left: "0", zIndex: "2000" }} in={openAlert}>
                <Alert
                    severity={alertStatus.includes("success") ? "success" : "error"}
                    action={
                        <IconButton color="inherit" size="small" onClick={closeAlert}>
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mt: 3 }}
                >
                    {alertStatus}
                </Alert>
            </Collapse>
        </Box>
    );
};

export default Home;
