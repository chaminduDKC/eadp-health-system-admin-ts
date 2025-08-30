import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import  { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import React, {type SyntheticEvent, useEffect, useState} from "react";
import {Autocomplete, Button, CircularProgress,  Tab, Tabs, TextField} from "@mui/material";
import {TimePicker} from "@mui/x-date-pickers";
import axiosInstance, {startTokenRefreshInterval} from "../../../axios/axiosInstance.ts";
import { motion } from "framer-motion";
import SettingsIcon from '@mui/icons-material/Settings';
import {Alert, Collapse} from "@mui/material";
import AlertHook from '../../../alert/Alert.ts'
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {Visibility, VisibilityOff} from "@mui/icons-material";

import Avatar from '@mui/material/Avatar';
import SaveIcon from '@mui/icons-material/Save';
import {
    Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow, InputAdornment,
} from "@mui/material";
import ReusableModal from "./ReusableModal/ReusableModal.tsx";
import PropTypes from "prop-types";

// Animation

type Specialization = {
    specialization:string,
    id:number
}
type Hospital = {
    name:string
}
type Doctor = {
    image?:string,
    name?:string,
    email?: string,
    phoneNumber?: string,
    specialization: string,
    experience: string,
    hospital: string,
    address: string,
    licenceNo: string,
    city: string,
    doctorId: string,
    userId: string,
    code:string,
    password:string
}

type Column = {
    id: 'name' | 'phoneNumber' | 'email' | 'city' | 'hospital' | 'specName' | 'address' |'specialization';
    label: string;
    minWidth?: number;
    align?: 'right' | 'center' | 'left';
    format?: (value: number) => string;
}

const columns:Column[] = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'hospital', label: 'Hospital', minWidth: 100 },
    { id: 'specialization', label: 'Specialization', minWidth: 100 },
];

interface CustomTabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    index: number;
    value:number;
}

function CustomTabPanel(props:CustomTabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index:number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}


const Doctor:React.FC = () => {

    const specializationUrl = import.meta.env.VITE_SPECIALIZATION_API;
    const doctorUrl = import.meta.env.VITE_DOCTOR_API;
    const userUrl = import.meta.env.VITE_USER_API;
    const hospitalUrl = import.meta.env.VITE_HOSPITAL_API;
    const availabilityUrl = import.meta.env.VITE_AVAILABILITY_API;


    const [value, setValue] = useState(0);

    const handleChange = (_event:SyntheticEvent, newValue:number) => {
        setValue(newValue);
    };

    useEffect(() => {
        fetchSpecializations()
        fetchHospitals()
        startTokenRefreshInterval();
    }, []);


    const {openAlert, alertStatus, showAlert, closeAlert} = AlertHook();

    const [fullName, setFullName] = useState<string>("");
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [hospital, setHospital] = useState<string | null>(null);
    const [city, setCity] = useState("")
    const [experience, setExperience] = useState("");
    const [licenceNo, setLicenceNo] = useState("");
    const [hospitals, setHospitals] = useState<Hospital[] | string>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [doctorCount, setDoctorCount] = useState(0);


    const [specializations, setSpecializations] = useState<Specialization[]>([])
    const [specName, setSpecName] = useState<string>("")

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchText, setSearchText] = useState("")

    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const [endTime, setEndTime] = useState<Dayjs | null>(null);


    const fetchHospitals =  async ()=>{

        await axiosInstance.get(`${hospitalUrl}/find-all-hospitals`, {params:{
                searchText:""
            }}).then(res=>{
            setHospitals(res.data.data)
        }).catch(err=>{
            console.log(err)
            showAlert("Failed to load hospitals")
        })

    }

    const fetchSpecializations = async ()=>{
        try {
            const response = await axiosInstance.get(`${specializationUrl}/find-all-specializations`,{params: {searchText:""}}
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

    const handleChangePage = (_event:React.MouseEvent<HTMLButtonElement> | null, newPage:number) => {
        setPage(newPage);
        fetchDoctors(newPage, rowsPerPage, searchText);
    };

    const handleChangeRowsPerPage = (event: { target: { value: string; }; }) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchDoctors(0, newSize, searchText);

    };

    const fetchDoctors = async (pageNumber = page, size = rowsPerPage, search = searchText) => {
        setLoading(false);
        try {
            const response = await axiosInstance.get(`${doctorUrl}/find-all-doctors`, {
                params: {
                    searchText: search,
                    page: pageNumber,
                    size: size
                }
            });

            setDoctors(response.data.data.dataList);
            setDoctorCount(response.data.data.dataCount)

        } catch (err) {
            showAlert("Failed to load doctors")
            console.log("Error is " + err);

        } finally {
            setLoading(false);
        }
    };
    // ---------------------------------------


    const rows = doctors.map((doc) => ({
        name: doc?.name,
        email: doc?.email,
        phoneNumber: doc?.phoneNumber,
        specialization: doc?.specialization,
        experience: doc?.experience,
        hospital: doc?.hospital,
        address: doc?.address,
        licenceNo: doc?.licenceNo,
        city: doc?.city,
        doctorId: doc?.doctorId,
        userId: doc?.userId,
        code:doc?.doctorId
    }));

    const handleCreateDoctor = async (e:React.MouseEvent)=>{
        setLoading(true)
        e.preventDefault();
        if(!fullName ||  !address || !phone || !specName  || !hospital || !city || !experience || !licenceNo) {
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
            await axiosInstance.post(`${userUrl}/register-doctor`, request).then(()=>{
                showAlert("Doctor created successfully")
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

    const clearPatientDoctorData = ()=>{
        setFullName("");
        setEmail("")
        setAddress("")
        setPassword("")
        setPhone("")
        setSpecName("")
        setExperience("")
        setHospital("")
        setCity("")
        setLicenceNo("")
    }


    const [openDoctorDetailModal, setOpenDoctorDetailModal] = useState(false);

    const handleCloseDoctorDetailsModal = () => {
        setOpenDoctorDetailModal(false);
        setModalData(null)
        setLoading(false);
        setIsChanged(false);
    };

    const [alreadySelectedDates, setAlreadySelectedDates] = useState<string[]>([]);
    const [modalData, setModalData] = useState<Partial<Doctor | null>>()

    const fetchAlreadySelectedDates = async (doctorId:string)=>{
        await axiosInstance.get(`${availabilityUrl}/find-selected-dates-by-doctor-id/${doctorId}`).then(res=>{
            setAlreadySelectedDates(res.data.data)
        }).catch(err=>{
            showAlert("failed-availabilities")
            console.log(err)
        })

    }

    const handleAvailableTimes = async (doctorId:string)=>{
        const formattedDate = selectedDate?.format("YYYY-MM-DD");

        const formattedStartTime = startTime?.format("HH:mm")
        const formattedEndTime = endTime?.format("HH:mm")

        try {
            const requestBody = {
                doctorId:doctorId,
                date:formattedDate,
                startTime:formattedStartTime,
                endTime:formattedEndTime
            }
            await axiosInstance.post(`${availabilityUrl}/save-availabilities`, requestBody).then(()=>{
                    showAlert("Date scheduled successfully")
                    handleCloseDoctorDetailsModal()
                }
            ).catch((err)=>{
                showAlert("failed to schedule date")
                console.log(err)
            })
        } catch (e) {
            console.log(e)
        }


    }

    const [isChanged, setIsChanged] = useState(false);

    const [editField, setEditField] = useState("");

    const handleUpdateDoctor = async (doctorId:string, modalData:Doctor)=>{
        const doctorRequest = {
            name:modalData.name,
            phone:modalData.phoneNumber,
            specialization:modalData.specialization,
            experience:modalData.experience,
            hospital:modalData.hospital,
            address:modalData.address,
            city:modalData.city,
            licenceNo:modalData.licenceNo
        }
        try {
            await axiosInstance.put(
                `${doctorUrl}/update-doctor/${doctorId}`,
                doctorRequest
            )
            showAlert("Doctor details updated successfully.")
            handleCloseDoctorDetailsModal();

        } catch (e) {
            showAlert("failed to update the doctor")
            console.log("Failed to update with error "+ e)
        }
    }

    const handleChangePassword = async ()=>{
        await axiosInstance.put(`${userUrl}/update-password/${modalData?.userId}`, {}, {params:{
                password:modalData?.password,
                role:"doctor"
            }} ).then(()=>{
            showAlert("Password changed successfully")
            handleCloseDoctorDetailsModal();
        }).catch((err)=>{
            console.log(err)
            showAlert("failed to change password")
        })
    }

    const handleChangeEmail = async ()=>{
        await axiosInstance.put(`${userUrl}/update-email/${modalData?.userId}`, {}, {params:{
                email:modalData?.email,
                role:"doctor"
            }} ).then(()=>{
            fetchDoctors(page, rowsPerPage, searchText)
            showAlert("Email changed successfully")
            handleCloseDoctorDetailsModal();
        }).catch((err)=>{
            if(err.status === 409){
                showAlert("This email is already exist. Try another one")
                setTimeout(()=>{
                    closeAlert()
                },3000)
                setLoading(false)
            }
            console.log(err)
            showAlert("failed to change email")
        })

    }

    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setOpenDeleteModal(false)
    }
    const handleDeleteDoctor = async (doctorId:string, userId:string)=>{
        try{
            await axiosInstance.delete(
                `${doctorUrl}/delete-doctor/${doctorId}`,
                {
                    params:{
                        userId:userId
                    }
                }
            )
            showAlert("Doctor deleted successfully")
            handleCloseDeleteModal();
            handleCloseDoctorDetailsModal();
            fetchDoctors(page, rowsPerPage, searchText)
        } catch (e){
            showAlert("failed to delete")
            console.log(e)
        }
    }
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


            {/*main container*/}
            <Box sx={{
                display:{xl:"flex", lg:"flex", md:"column", sm:"column", xs:"column"},
                gap:{xl:5, lg:4, md:10, sm:50, xs:10}
            }}>


                <ReusableModal
                    open={openDeleteModal}
                    onClose={handleCloseDeleteModal}
                    title={"Delete user?"}
                    content={

                        <Box>
                            <Typography>
                                Are you sure you want to delete this user? All data associated with this user will be permanently deleted.
                            </Typography>
                        </Box>
                    }
                    actions={[
                        {label:"Cancel", onClick:handleCloseDeleteModal},
                        {label:"Delete", onClick:()=>{
                            if(modalData?.doctorId && modalData?.userId){
                                handleDeleteDoctor(modalData?.doctorId, modalData?.userId)
                            } else {
                                showAlert("Something went wrong")
                                return;
                            }

                            }}
                    ]}
                />

                {/*doctor details  */}

                <ReusableModal
                    open={openDoctorDetailModal}
                    onClose={handleCloseDoctorDetailsModal}
                    title={"Doctor Details"}
                    content={
                        <Box sx={{ height:"600px" }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                    <Tab label="Calendar" {...a11yProps(0)} />
                                    <Tab label="Profile" {...a11yProps(1)} />
                                    <Tab label="Security" {...a11yProps(2)} />
                                </Tabs>
                            </Box>
                            <CustomTabPanel value={value} index={0}>
                                {/*Calendar*/}
                                <Box sx={{
                                    display:"flex",
                                    flexDirection:"column",
                                    alignItems:"center",

                                    boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                    borderRadius:"10px",
                                    marginTop:"12px"
                                }}>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateCalendar
                                            slotProps={{

                                                day: {
                                                    sx: {
                                                        fontSize: {
                                                            xs: '1rem',

                                                        },
                                                        width: {

                                                            xl: 34,
                                                        },
                                                        height: {

                                                            xl: 34,
                                                        },
                                                    },
                                                },
                                            }}
                                            disablePast  shouldDisableDate={(date) =>
                                            alreadySelectedDates.includes(date.format('YYYY-MM-DD'))
                                        } value={selectedDate} onChange={(newValue) => setSelectedDate(newValue)} />

                                        <Box sx={{
                                            width:"90%",
                                            display:"flex",
                                            gap:"20px"
                                        }}>
                                            <TimePicker
                                                label="Start time"
                                                value={startTime}
                                                onChange={(newValue) => setStartTime(newValue)}
                                            />


                                            <TimePicker
                                                label="End time"
                                                value={endTime}
                                                onChange={(newValue) => setEndTime(newValue)}
                                            />
                                        </Box>
                                    </LocalizationProvider>

                                    <Box width="100%" display="flex" justifyContent="flex-end">
                                        <Button
                                            disabled={startTime == null || endTime == null || selectedDate == null}
                                            sx={{
                                                backgroundColor:"var(--color-green-dark)",
                                                color:"var(--color-cream)",
                                                marginTop:"10px",
                                                paddingX:"20px",
                                                marginBottom:"10px",
                                                marginRight:"10px"
                                            }} autoFocus onClick={()=>{
                                                if(modalData?.doctorId) {
                                                    handleAvailableTimes(modalData?.doctorId).then(()=>{
                                                        // handleCloseModal();
                                                    })
                                                }
                                        }}>
                                            Save
                                        </Button>
                                    </Box>
                                </Box>
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <Box>
                                    <Box sx={{
                                        display:"flex",
                                        alignItems:"center",
                                        width:"100%",
                                        gap:"10px",
                                        justifyContent:"center",
                                        flexDirection:"column",
                                        padding:"5px 0px",
                                        boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                        borderRadius:"10px"

                                    }}>
                                        {
                                            modalData?.image? (
                                                <img style={{width:"100px", height:"100px", borderRadius:"50%"}} src={modalData.image} alt="profile"/>
                                            ):(

                                                <Avatar sx={{
                                                    width:"160px",
                                                    height:"160px",
                                                   fontSize:"100px",
                                                }} alt={modalData?.name} src="/static/images/avatar/1.jpg" />

                                            )}
                                        <Typography variant="h6">
                                            {modalData?.name}
                                        </Typography>
                                    </Box>
                                    <Box sx={{display:"flex", marginTop:"10px", flexDirection:"column", gap:2}}>
                                        <Typography variant="h6">Edit Doctor Details</Typography>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="Name"
                                                variant="outlined"
                                                value={modalData?.name}
                                                onChange={e=>{
                                                    if(e.target.value) {
                                                        setModalData({...modalData, name:e.target.value})
                                                        setIsChanged(true)
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("name")} edge="end">
                                                                {editField === "name" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "name")
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="Address"
                                                variant="outlined"
                                                value={modalData?.address}
                                                onChange={e=>{
                                                    setModalData({...modalData, address:e.target.value})
                                                    setIsChanged(true)
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("address")} edge="end">
                                                                {editField === "address" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "address")
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                variant="outlined"
                                                value={modalData?.city}
                                                onChange={e=>{
                                                    setModalData({...modalData, city:e.target.value})
                                                    setIsChanged(true)
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("city")} edge="end">
                                                                {editField === "city" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "city")
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                variant="outlined"
                                                value={modalData?.phoneNumber}
                                                onChange={e=>{
                                                    setModalData({...modalData, phoneNumber:e.target.value})
                                                    setIsChanged(true)
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("phoneNumber")} edge="end">
                                                                {editField === "phoneNumber" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "phoneNumber")
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="Experience"
                                                variant="outlined"
                                                value={modalData?.experience}
                                                onChange={e=>{
                                                    setModalData({...modalData, experience:e.target.value})
                                                    setIsChanged(true)
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("experience")} edge="end">
                                                                {editField === "experience" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "experience")
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>

                                            <Autocomplete
                                                sx={{
                                                    backgroundColor: 'var(--bg-secondary)',
                                                    color: 'var(--text-primary)',
                                                    input: {color: 'var(--text-primary)'},
                                                    label: {color: 'var(--text-secondary)'},

                                                }}
                                                value={modalData?.hospital}
                                                onChange={(_event, newValue) => {
                                                    if (newValue) {
                                                        modalData.hospital = newValue; // just the name string
                                                        setIsChanged(true)
                                                    }
                                                }}
                                                options={hospitals}
                                                fullWidth
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("hospital")} edge="end">
                                                                {editField === "hospital" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "hospital")
                                                }}
                                                renderInput={(params) => <TextField {...params} label="Hospital" />}
                                            />


                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <Autocomplete
                                                sx={{
                                                    marginTop:"10px",
                                                    color: 'var(--text-primary)',
                                                    input: {color: 'var(--text-primary)'},
                                                    label: {color: 'var(--text-secondary)'}
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("specialization")} edge="end">
                                                                {editField === "specialization" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "specialization")
                                                }}
                                                value={specializations.find(p => p.specialization === modalData?.specialization) || null}
                                                onChange={(_event, newValue) => {
                                                    if (newValue) {
                                                        // patient ID
                                                        if(modalData) {
                                                            modalData.specialization = newValue.specialization; // just the name string
                                                            setIsChanged(true)
                                                        }

                                                    } else {
                                                        // setDoctor(null);
                                                        // setDocId(null);
                                                        // setDocName("");
                                                    }
                                                }}
                                                options={specializations}
                                                getOptionLabel={(option) => option.specialization || ""}
                                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                                fullWidth
                                                renderInput={(params) => <TextField {...params} label="Specializations" />}
                                            />
                                        </Box>
                                        <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                            <TextField
                                                fullWidth
                                                label="Licence No"
                                                variant="outlined"
                                                value={modalData?.licenceNo}
                                                onChange={e=>{
                                                    setModalData({...modalData, licenceNo:e.target.value})
                                                    setIsChanged(true)
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={()=>setEditField("licenceNo")} edge="end">
                                                                {editField === "licenceNo" ? <SaveIcon /> : <EditIcon />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                    readOnly: !(editField === "licenceNo")
                                                }}
                                            />
                                        </Box>
                                        <Button disabled={!isChanged} variant="contained" onClick={()=>{
                                            handleUpdateDoctor(modalData.doctorId, modalData)
                                        }}>Save Changes</Button>
                                    </Box>
                                </Box>
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={2}>
                                <Box sx={{display:"flex",height:"100%", flexDirection:"column", gap:2,marginBottom:2}}>
                                    <Typography variant="h6">Change Email and Password</Typography>
                                    <Box sx={{
                                        height:"100%",
                                        display:"flex",
                                        alignItems:"flex-end",
                                        justifyContent:"space-between",
                                        gap:2
                                    }}>
                                        <TextField
                                            sx={{flex:3}}
                                            label="Email"
                                            variant="outlined"
                                            value={modalData?.email}
                                            onChange={e=>setModalData({...modalData, email:e.target.value})}
                                        />
                                        <Button sx={{flex:1.5, height:"100%"}} variant="contained" onClick={handleChangeEmail}>change email</Button>
                                    </Box>
                                   <Box sx={{
                                       height:"100%",
                                       display:"flex",
                                       alignItems:"flex-end",
                                       justifyContent:"space-between",
                                       gap:2
                                   }}>
                                    <TextField
                                        sx={{flex:3}}
                                        label="Password"
                                        variant="outlined"
                                        type={showPassword ? "text" : "password"}
                                        value={modalData?.password}
                                        onChange={e=>setModalData({...modalData, password:e.target.value})}
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
                                    <Button sx={{flex:1.5, height:"100%"}}  variant="contained" onClick={handleChangePassword}>Change password</Button>
                                   </Box>
                                    <Button color="error" variant="contained" onClick={()=>{
                                        setOpenDeleteModal(true)
                                    }}>Delete doctor</Button>
                                </Box>

                            </CustomTabPanel>
                        </Box>
                    }
                    actions={[
                        {label:"Close", onClick:handleCloseDoctorDetailsModal}
                        ]}
                />

                {/*form*/}
                <Box sx={{
                    flex:1,
                    backgroundColor:"background.paper",
                    padding:"10px",
                    borderRadius:2,
                    marginBottom:{md:"40px", sm:"40px", xs:"30px"}
                }}>
                    <Typography variant="h4" sx={{color:"primary.main", fontWeight:"bold"}}>
                        Doctor Registration Form
                    </Typography>
                    <TextField
                        sx={{

                        }}
                        label="Name"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                    />
                    <TextField

                        label="Email"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}

                    />
                    <TextField
                        label="Password"
                        variant="filled"
                        margin="normal"
                        fullWidth
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
                    <TextField

                        label="Address"
                        variant="filled"
                        margin="normal"
                        fullWidth
                        required
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />

                    <Box sx={{display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: "10px"}}>
                        <TextField
                            sx={{
                                backgroundColor: 'background.paper',
                            }}
                            label="Phone"
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            type="text"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <TextField
                            label="Licence No"
                            variant="filled"
                            margin="normal"
                            fullWidth
                            required
                            type="text"
                            value={licenceNo}
                            onChange={e => setLicenceNo(e.target.value)}
                        />

                    </Box>

                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "12px"
                    }}>


                        <Autocomplete

                            value={hospital}
                            onChange={(_event, newValue) => setHospital(newValue)}
                            options={hospitals}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Hospital" />}
                        />

                        <Autocomplete
                            sx={{
                                color: 'var(--text-primary)',
                                input: {color: 'var(--text-primary)'},
                                label: {color: 'var(--text-secondary)'}
                            }}
                            value={specializations.find(p => p.specialization === specName) || null}
                            onChange={(_event, newValue) => {
                                if (newValue) {
                                    // patient ID
                                    setSpecName(newValue.specialization); // just the name string

                                } else {
                                    // setDoctor(null);
                                    // setDocId(null);
                                    // setDocName("");
                                }
                            }}
                            options={specializations}
                            getOptionLabel={(option) => option.specialization || ""}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            fullWidth
                            renderInput={(params) => <TextField {...params} label="Specializations" />}
                        />

                    </Box>
                    <Box sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginTop: "20px"
                    }}>


                        <TextField

                            id="outlined-select-experience"
                            variant="filled"
                            fullWidth
                            label="City"
                            type="text"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                        />


                        <TextField
                            // sx={{
                            //     backgroundColor: 'var(--bg-secondary)',
                            //     color: 'var(--text-primary)',
                            //     input: {color: 'var(--text-primary)'},
                            //     label: {color: 'var(--text-secondary)'}
                            // }}
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
                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button type="submit" onClick={(e) => {
                           handleCreateDoctor(e);
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
                                : "Save User"}
                        </Button>

                        <Button
                            sx={{
                                color:"var(--color-green-dark)",

                                fontWeight:"bold"
                            }}

                            onClick={() => {
                                setLoading(false)
                                clearPatientDoctorData();
                            }}>Cancel</Button>

                    </Box>
                </Box>
                {/*table*/}
                <Box sx={{
                    flex:1.6,
                    backgroundColor:"background.paper",
                    padding:"10px",
                    borderRadius:2,
                    height:"660px",
                    display:"flex",
                    flexDirection:"column",
                }}>
                    <Typography variant="h4" sx={{color:"primary.main", fontWeight:"bold"}}>Registered Doctors</Typography>

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
                                fetchDoctors(page, rowsPerPage, value);
                            }}
                        />

                        <Button sx={{
                            width:"200px",
                            height:"60px",
                            fontSize:"20px"
                        }} variant="text" onClick={()=>{
                            fetchDoctors(page, rowsPerPage, searchText)
                        }} >See List</Button>
                    </Box>
                    <hr width="100%" />

                        <Paper sx={{width: '100%', overflow: 'hidden'}}>
                            <TableContainer  sx={{
                                maxHeight: 460,
                                height:"fit-content",
                                overflowY: "auto", // allow vertical scrolling
                                scrollbarWidth: "none", // Firefox
                                "&::-webkit-scrollbar": {
                                    display: "none", // Chrome, Safari
                                }
                            }} >
                                <Table  stickyHeader aria-label="sticky table">
                                    <TableHead>
                                        <TableRow>
                                            {columns.map((column) => (
                                                <TableCell
                                                    sx={{
                                                        fontWeight:"bold",
                                                        color:"primary.main"
                                                    }}
                                                    key={column.id}
                                                    align={column.align}
                                                    style={{minWidth: column.minWidth}}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            ))}

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <motion.tr
                                                key={row.code}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.id === "name" && (
                                                                    <IconButton>
                                                                        <SettingsIcon
                                                                            sx={{ color: "secondary.main" }}
                                                                            onClick={() => {
                                                                                fetchAlreadySelectedDates(row.doctorId).then(() => {
                                                                                    setOpenDoctorDetailModal(true)
                                                                                    setModalData(row);
                                                                                    console.log(row);
                                                                                });
                                                                            }}
                                                                        />
                                                                    </IconButton>
                                                            )}
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
                                count={doctorCount}
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
                    severity={alertStatus.includes("success") ? "success" : alertStatus.includes("warning") ? "warning" : "error"}
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
                    {alertStatus}
                </Alert>
            </Collapse>
            {/*alert*/}

        </Box>
    );
};

export default Doctor;