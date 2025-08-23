import Box from "@mui/material/Box";
import React, {useEffect, useState} from "react";
import axiosInstance, {startTokenRefreshInterval} from "../../../axios/axiosInstance.ts";
import {
    Alert,
    Avatar,
    Button,
    CircularProgress, Collapse,
    InputAdornment,
    MenuItem,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead, TablePagination,
    TableRow,
    Tabs,
    TextField
} from "@mui/material";

import AlertHook from "../../../alert/Alert.ts";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from '@mui/icons-material/Settings';
import ReusableModal from "./ReusableModal/ReusableModal.tsx";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from "prop-types";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

const columns:Column[] = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'age', label: 'Age', minWidth: 80 },
    { id: 'phone', label: 'Phone', minWidth: 60 },
    // { id: 'email', label: 'Email', minWidth: 100 },
    // { id: 'address', label: 'Address', minWidth: 100 },


];
type Column = {
    id:string,
    align?:"left " | "right" | "center",
    label:string,
    minWidth:number
}
type Patient = {
    name: string,
    email: string,
    phone: string,
    address: string,
    password: string,
    age: string,
    gender:string,
    patientId:string,
    userId:string,
    image?:string
}

function CustomTabPanel(props) {
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

const Patients = () => {

    const [value, setValue] = useState(0);

    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };
    const userUrl = import.meta.env.VITE_USER_API;
    const patientUrl = import.meta.env.VITE_PATIENT_API;


    const {alertStatus, openAlert, showAlert, closeAlert} = AlertHook();


    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [editField, setEditField] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    const isValidName =/^[A-Za-z\s]+$/.test(fullName);
    const isValidPassword = /^(?=.*[@&$])[A-Za-z0-9@&$]{6,}$/.test(password);



    const clearPatientDoctorData = ()=>{
        setFullName("");
        setEmail("");
        setAddress("");
        setPhone("");
        setGender("");
        setAge("");
        setPassword("");
    }

    const handleCreatePatient = async () => {
        setLoading(true);
        if (!fullName || !email || !address || !phone || !gender || !age || !password) {
            console.log("hi")
            showAlert("Fill all fields")
            setTimeout(() => {
                closeAlert();
            }, 2000)
            setLoading(false);
        } else {
            const date = new Date().toLocaleDateString('en-CA')
            console.log(date)
            const request = {
                name: fullName,
                email: email,
                password: password,
                address: address,
                phone: phone,
                gender: gender,
                age: age,
                createdDate: date
            };
            console.log(request)
            try {
                await axiosInstance.post(`${userUrl}/register-patient`,
                    request);
                showAlert("Patient created successfully")
                setLoading(false);
                clearPatientDoctorData();
                fetchPatients();
            } catch (e) {
                showAlert("Failed to create patient. Try again")
                console.log(e)
                setLoading(false);
            }
        }
    }


    const genders = [
        "Male","Female","Other"
    ]

    useEffect(() => {
        startTokenRefreshInterval();
    }, []);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (_event:React.MouseEvent<HTMLButtonElement>, newPage:number) => {
        setPage(newPage);
        fetchPatients(newPage, rowsPerPage, searchText)
    };

    const handleChangeRowsPerPage = (event) => {
        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchPatients(0, newSize, searchText);
    };

    const [searchText, setSearchText] = useState("")

    const [patients, setPatients] = useState<Patient[]>([])


    const [patientCount, setPatientCount] = useState(0);

    const fetchPatients = async (pageNumber = page, size = rowsPerPage, search = searchText)=>{
        try {
            const response = await axiosInstance.get(`${patientUrl}/find-all-patients`,{
                params:{
                    searchText:search,
                    page:pageNumber,
                    size:size
                }
            });
            setPatients(response.data.data.patientList);
            setPatientCount(response.data.data.patientCount)

        } catch (error) {
            showAlert("failed to load patients")
            console.error("Error fetching patients:", error);
        }
    }


    const rows = patients.map((pat) => ({
        name: pat.name,
        email: pat.email,
        phone: pat.phone,
        address: pat.address,
        age: pat.age,
        gender:pat.gender,
        patientId:pat.patientId,
        userId:pat.userId,

    }));

    const [modalData, setModalData] = useState<Patient >({});
    const [isChanged, setIsChanged] = useState(false);

    const [openPatientDetailModal, setOpenPatientDetailModal] = useState(false);

    const handleClosePatientDetailsModal = () => {
        setOpenPatientDetailModal(false);
        setLoading(false);
        setIsChanged(false);
    };


    const handleUpdatePatient = async (_patientId:string, patient:Patient) => {
        const updateRequest = {
            name:modalData.name,
            address:modalData.address,
            phone:modalData.phone,
            gender:modalData.gender,
            age:modalData.age
        };
        try{
            await axiosInstance.put(`${userUrl}/update-user/${patient.userId}`,
                updateRequest);
            fetchPatients();
            setLoading(false)
            showAlert("Patient updated successfully")
            handleClosePatientDetailsModal();
        } catch (e) {
            showAlert("failed to update the patient")
            console.log(e)
            setLoading(false);
        }
    }

    const handleChangePassword = async ()=>{
        await axiosInstance.put(`${userUrl}/update-password/${modalData.userId}`, {}, {params:{
                password:modalData.password,
                role:"patient"
            }} ).then(()=>{
            showAlert("Password changed successfully")
            handleClosePatientDetailsModal();
        }).catch((err)=>{
            console.log(err)
            showAlert("failed to change password")
        })
    }

    const handleChangeEmail = async ()=>{
        await axiosInstance.put(`${userUrl}/update-email/${modalData.userId}`, {}, {params:{
                email:modalData.email,
                role:"patient"
            }} ).then(()=>{
            fetchPatients(page, rowsPerPage, searchText)
            showAlert("Email changed successfully")
            handleClosePatientDetailsModal();
        }).catch((err)=>{
            console.log(err)
            showAlert("failed to change email")
        })

    }
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const handleCloseDeleteModal = ()=>{
        setOpenDeleteModal(false)
    }
    const handleDeletePatient = async (patientId:string, userId:string )=>{
        console.log(patientId, userId)
            try {
                await axiosInstance.delete(`${userUrl}/delete-user/${userId}`);
                await fetchPatients();
                showAlert("Patient deleted successfully")
                handleCloseDeleteModal();
                handleClosePatientDetailsModal();
                fetchPatients(page, rowsPerPage, searchText)
            } catch (e) {
                showAlert("failed to delete patient")
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
            },height:"100%"
        }}>

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

            {/*main container*/}
            <Box sx={{
                display:{xl:"flex", lg:"flex", md:"column", sm:"column", xs:"column"},
                gap:{xl:5, lg:4, md:10, sm:50, xs:10},
                height:"100%"
            }}>
                <ReusableModal open={openDeleteModal} onClose={handleCloseDeleteModal} title="Delete Patient"
                               actions={[
                                   {label:"Delete", variant:"contained", onClick:()=>{
                                           handleDeletePatient(modalData.patientId, modalData.userId)
                                       }, },
                                   {label:"close", onClick:handleCloseDeleteModal, variant:"text",}
                ]}
                               content={
                                   <Box>
                                       <Typography>Are you sure you want to delete this patient ?</Typography>
                                   </Box>
                }
                />
                <ReusableModal open={openPatientDetailModal} onClose={handleClosePatientDetailsModal} title="Patient Details"
                               actions={[
                                   {label:"close", onClick:handleClosePatientDetailsModal, color:"success" , variant:"outlined",},
                               ]}
                               content={
                                   <Box sx={{ height:"500px" }}>
                                       <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                           <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                               <Tab label="Profile" {...a11yProps(0)} />
                                               <Tab label="Security" {...a11yProps(1)} />
                                           </Tabs>
                                       </Box>
                                       <CustomTabPanel value={value} index={0}>
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
                                                       modalData.image? (
                                                           <img style={{width:"100px", height:"100px", borderRadius:"50%"}} src={modalData.image} alt="profile"/>
                                                       ):(

                                                           <Avatar sx={{
                                                               width:"160px",
                                                               height:"160px",
                                                               fontSize:"100px",
                                                           }} alt={modalData?.name} src="/static/images/avatar/1.jpg" />

                                                       )}
                                                   <Typography variant="h6">
                                                       {modalData.name}
                                                   </Typography>
                                               </Box>
                                               <Box sx={{display:"flex", marginTop:"10px", flexDirection:"column", gap:2}}>
                                                   <Typography variant="h6">Edit Doctor Details</Typography>
                                                   <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                                       <TextField
                                                           fullWidth
                                                           label="Name"
                                                           variant="outlined"
                                                           value={modalData.name}
                                                           onChange={e=>{
                                                               setModalData({...modalData, name:e.target.value})
                                                               setIsChanged(true)
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
                                                           value={modalData.address}
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
                                                           label="Phone"
                                                           variant="outlined"
                                                           value={modalData.phone}
                                                           onChange={e=>{
                                                               setModalData({...modalData, phone:e.target.value})
                                                               setIsChanged(true)
                                                           }}
                                                           InputProps={{
                                                               endAdornment: (
                                                                   <InputAdornment position="end">
                                                                       <IconButton onClick={()=>setEditField("phone")} edge="end">
                                                                           {editField === "phone" ? <SaveIcon /> : <EditIcon />}
                                                                       </IconButton>
                                                                   </InputAdornment>
                                                               ),
                                                               readOnly: !(editField === "phone")
                                                           }}
                                                       />
                                                   </Box>
                                                   <Box sx={{display:"flex", alignItems:"center", gap:2}}>
                                                       <TextField
                                                           fullWidth
                                                           label="Age"
                                                           type="number"
                                                           variant="outlined"
                                                           value={modalData.age}
                                                           onChange={e=>{
                                                               setModalData({...modalData, age:e.target.value})
                                                               setIsChanged(true)
                                                           }}
                                                           InputProps={{
                                                               endAdornment: (
                                                                   <InputAdornment position="end">
                                                                       <IconButton onClick={()=>setEditField("age")} edge="end">
                                                                           {editField === "age" ? <SaveIcon /> : <EditIcon />}
                                                                       </IconButton>
                                                                   </InputAdornment>
                                                               ),
                                                               readOnly: !(editField === "age")
                                                           }}
                                                       />
                                                   </Box>

                                                   <Button disabled={!isChanged} variant="contained" onClick={()=>{
                                                       handleUpdatePatient(modalData.patientId, modalData)
                                                   }}>Save Changes</Button>
                                               </Box>
                                           </Box>
                                       </CustomTabPanel>
                                       <CustomTabPanel value={value} index={1}>
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
                                                       value={modalData.email}
                                                       onChange={e=>setModalData({...modalData, email:e.target.value})}
                                                   />
                                                   <Button sx={{flex:1.5, height:"100%"}} variant="contained" onClick={handleChangeEmail} >change email</Button>
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
                                                       value={modalData.password}
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
                                               }}>Delete patient</Button>
                                           </Box>

                                       </CustomTabPanel>
                                   </Box>
                               }

                />

            {/*    form container*/}
                <Box sx={{
                    flex:1,
                    height:"620px",
                    backgroundColor:"background.paper",
                    padding:"10px",
                    borderRadius:2,
                    marginBottom:{md:"40px", sm:"40px", xs:"30px"}
                }}>
                    <Typography variant="h4" sx={{color:"primary.main", fontWeight:"bold"}}>
                        Patient Registration Form
                    </Typography>
                    <TextField

                        label="Name"
                        variant="filled"
                        margin="normal"
                        helperText={!isValidName ? "Name must be contain only letters" : ""}
                        fullWidth
                        required
                        type="text"
                        value={fullName}
                        onChange={(e => setFullName(e.target.value))}
                    />
                    <TextField

                        label="Email"
                        variant="filled"
                        margin="normal"
                        helperText={!isValidEmail ? "Invalid email address" : ""}
                        fullWidth
                        required
                        type="email"
                        value={email}
                        onChange={(e => setEmail(e.target.value))}
                    />
                    <TextField

                        label="Address"
                        variant="filled"

                        margin="normal"
                        fullWidth
                        required
                        type="text"
                        value={address}
                        onChange={(e => setAddress(e.target.value))}
                    />
                    <TextField

                        label="Password"
                        variant="filled"
                        margin="normal"
                        helperText={!isValidPassword ? "Password must be at least 6 characters long, include special characters" : ""}
                        fullWidth
                        required
                        type="password"
                        value={password}
                        onChange={(e => setPassword(e.target.value))}
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
                        gap: 2,
                        flexDirection: {xs: "column", sm: "row"}
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
                                              color: 'var(--text-primary)',
                                              backgroundColor: 'var(--bg-secondary)'
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
                    <Box mt={2} gap={2} display="flex" alignItems="center">
                        <Button type="submit" onClick={(e) => {
                            handleCreatePatient(e);
                        }} variant="text"

                                sx={{
                                    color: "primary.main",
                                    height: 40,
                                    minWidth: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                            {loading ?
                                <CircularProgress size={24} sx={{color: 'primary.main'}}/>
                                : "Save User"}
                        </Button>

                        <Button
                            variant="text"
                            sx={{
                                color:"text.primary",
                                fontWeight:"bold",

                            }}

                            onClick={() => {
                                setLoading(false)
                                clearPatientDoctorData();
                            }}>Cancel</Button>

                    </Box>
                </Box>

                <Box sx={{flex:1.6,height:"620px", backgroundColor:"background.paper", padding:"10px", borderRadius:2}}>
                    <Typography variant="h4" sx={{color:"primary.main", fontWeight:"bold"}}>
                        Patient List
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
                                fetchPatients(page, rowsPerPage, value);
                            }}
                        />

                        <Button sx={{
                            width:"200px",
                            height:"60px",
                            fontSize:"20px"
                        }} variant="text" onClick={()=>{
                            fetchPatients(page, rowsPerPage, searchText)
                        }} >See List</Button>
                    </Box>
                    <hr width="100%" />

                    <Paper sx={{width: '100%', overflow: 'hidden'}}>
                        <TableContainer sx={{


                            maxHeight: "418px",
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
                                            <TableCell
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "primary.main",
                                                }}
                                                key={column.id}
                                                align={column.align}
                                                style={{minWidth: column.minWidth}}
                                                onClick={() => {
                                                    console.log(column)
                                                }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}

                                    </TableRow>
                                </TableHead>


                                <TableBody>
                                    {rows.map((row, idx) => (
                                       <TableRow>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.id === "name" && (
                                                            <IconButton>
                                                                <SettingsIcon
                                                                    onClick={() => {
                                                                        setModalData(row);
                                                                        setOpenPatientDetailModal(true);
                                                                    }}
                                                                />
                                                            </IconButton>
                                                        )}
                                                        {value}
                                                    </TableCell>
                                                );
                                            })}
                                            <Box sx={{ marginTop: "6px" }} />
                                       </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={patientCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>


                </Box>
            </Box>
        </Box>
    );
};

export default Patients;