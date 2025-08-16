import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';

import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import {useColorMode} from "../../../../theme/ThemeContext.tsx";
import {NavLink} from "react-router-dom";
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import {Button} from "@mui/material";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import {styled} from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import {Alert, Collapse} from "@mui/material";
import AlertHook from '../../../alert/Alert.ts'
import axiosInstance, {stopTokenRefreshInterval} from "../../../axios/axiosInstance.ts";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';



const pages = [
    {
        title: "Home",
        link: "/context/home"
    },
    {
        title: "Doctors",
        link: "/context/doctors"
    },
    {
        title: "Patients",
        link: "/context/patients"
    },

    {
        title: "Appointments",
        link: "/context/appointments"
    },
];
type MyData = {
    licenceNo:string,
    specialization:string,
    image:string,
    name:string,
    city:string,
    phoneNumber:string,
    email:string,
    experience:string,
    hospital:string,
    address:string,
}



function ResponsiveAppBar() {
    const {openAlert, alertStatus, showAlert, closeAlert} = AlertHook();

    const BootstrapDialog = styled(Dialog)(({ theme }) => ({
        '& .MuiDialogContent-root': {
            padding: theme.spacing(2),
        },
        '& .MuiDialogActions-root': {
            padding: theme.spacing(1),
        },
    }));

    const ThemeToggleButton = () => {
        const { toggleColorMode, mode } = useColorMode()


        return (
            <IconButton  onClick={toggleColorMode} sx={(theme) => ({
                fontWeight:"bold",
                color: theme.palette.mode === "light" ? "#00684A" : "#4ADE80",
                "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                },
            })}>
                {mode === 'light' ? <LightModeIcon fontSize="large"  /> : <DarkModeIcon fontSize="large" />}
            </IconButton>
        )
    }

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const [openLogoutModal, setOpenLogoutModal] = React.useState<boolean>(false);

    const handleOpenLogoutModal = ()=>{
        setOpenLogoutModal(true);
    }
    const handleCloseLogoutModal = ()=>{
        setOpenLogoutModal(false);
    }

    // ----------------

    const [openProfileModal,setOpenProfileModal] = React.useState<boolean>(false);

    const handleOpenProfileModal = ():void=>{
        fetchMe().then(()=>{

            setOpenProfileModal(true);
        })
    }

    const handleCloseProfileModal = ():void=>{
        setOpenProfileModal(false);
    }
    const settings = [
    //     {
    //     name: 'Profile',
    //     onClick: () => {
    //          handleOpenProfileModal();
    //     },
    //     id:1
    // },
        {
            name:'Logout',
            onClick:() => {
        handleOpenLogoutModal();
    },
            id:2
        },

    ];
    const handleLogout = ()=>{
        showAlert("warning-logging-out")
        stopTokenRefreshInterval();
        setTimeout(()=>{
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login"
            console.log("Logged out")
        }, 1000)

    }
    const [myProfileData, setMyProfileData] = React.useState<MyData>();

    const fetchMe = async ()=>{
        await axiosInstance.get("http://localhost:9091/api/doctors/auth-doctor-details", {headers:{Authorization : `Bearer ${localStorage.getItem("access_token")}`}}).then(res=>{
            setMyProfileData(res.data.data);
        }).catch(err=>{
            console.log(err)
        })
    }
    return (
        <AppBar position="fixed" color="default" sx={{
            backgroundColor: "inherit", // semi-transparent background
            backdropFilter: "blur(20px)",                // blur effect
            WebkitBackdropFilter: "blur(5px)",
        }} elevation={1} >

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
                                {alertStatus === "warning-logging-out" && "Logging out. You'll be redirect to the login page."}
                                {alertStatus === "success-log-in" && "Logged in successfully."}

                            </Alert>
                        </Collapse>


            {/*alert*/}

            {/*logout modal*/}

            <BootstrapDialog
                onClose={handleCloseLogoutModal}
                aria-labelledby="customized-dialog-title"
                open={openLogoutModal}

            >
                <DialogTitle color="error" sx={{ m: 0, p: 2, }} id="customized-dialog-title">
                   Are You sure to logout ?
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseLogoutModal}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>

                </DialogContent>
                <DialogActions sx={{marginLeft:30}}>
                        <Button onClick={()=>{
                            handleCloseLogoutModal()
                        }}>cancel</Button>
                        <Button color="error" onClick={()=>{
                            handleLogout();
                            handleCloseLogoutModal();
                        }} variant="contained">Logout</Button>
                </DialogActions>
            </BootstrapDialog>
            {/*logout modal*/}


            {/*profile modal*/}
            <BootstrapDialog
                onClose={handleCloseProfileModal}
                aria-labelledby="customized-dialog-title"
                open={openProfileModal}

            >
                <DialogTitle sx={{ m: 0, p: 2, color:"primary.main" }} id="customized-dialog-title">
                   Your Profile Details
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseProfileModal}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <Box>
                        <Box sx={{
                            display:"flex",
                            alignItems:"center",
                            width:"100%",
                            boxShadow:"rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                            borderRadius:"10px"

                        }}>
                            {
                                myProfileData?.image? (
                                    <img style={{width:"100px", height:"100px", borderRadius:"50%"}} src={myProfileData?.image} alt="profile"/>
                                ):(

                                    <IconButton sx={{
                                        width:"160px",
                                        height:"160px",
                                        borderRadius:"50%"
                                    }}>
                                        <AccountCircleIcon sx={{
                                            width:"160px",
                                            height:"160px",
                                            borderRadius:"50%"
                                        }} />
                                    </IconButton>

                                )}
                            <Typography  variant="h6">
                                {myProfileData?.name}
                            </Typography>
                        </Box>
                        <Box sx={{display:"flex", alignItems:"center", justifyContent:"space-around"}}>
                            <Box sx={{display:"flex", gap:"10px", alignItems:"center", marginTop:"10px"}}>
                                <i className="fa-solid fa-envelope"></i>
                                <Typography>
                                    {myProfileData?.email}
                                </Typography>
                            </Box>
                            <Box sx={{display: "flex", gap: "10px", alignItems: "center", marginTop: "10px"}}>
                                <i className="fa-solid fa-location-dot"></i>
                                <Typography>
                                    {myProfileData?.address}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "18px",
                                padding: "20px",
                                marginTop: "12px",
                                width: "100%",
                                boxShadow:
                                    "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                                borderRadius: "16px",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <i className="fa-solid fa-house" style={{ color: "#4caf50", fontSize: 20 }}></i>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">
                                        City
                                    </Typography>
                                    <Typography variant="body1">{myProfileData?.city}</Typography>
                                </Box>
                            </Box>

                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions  sx={{marginLeft:1.5}}>
                    <Typography color="textDisabled" width="100%" >contact admin to update details</Typography>
                </DialogActions>
            </BootstrapDialog>
            {/*profile modal*/}
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/*logo goes here*/}
                    <NavLink style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}  to="/context/home" >

                        <HeartBrokenIcon sx={{ display: { xs: 'none', md: 'block' }, mr: 1, color:"secondary.main"}}/>

                    </NavLink>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#home"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        HOPE-HEALTH
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' }  }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            sx={{color:"primary.main"}}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none',}}}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    sx={{width:"100%" , marginRight:10,}}
                                    key={page.title}
                                    onClick={handleCloseNavMenu}
                                    divider
                                >

                                       <NavLink style={{
                                             textDecoration: "none",
                                             color: "primary.main",
                                             width: "100%",
                                             display: "flex",
                                             justifyContent: "center",
                                             alignItems: "center",
                                       }}  to={page.link} >
                                           <Typography sx={{ textAlign: "left", width: "100%" , color:"primary.main"}}>
                                               {page.title}
                                           </Typography>
                                       </NavLink>

                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <NavLink style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}  to="/context/home" >
                        <HeartBrokenIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color:"secondary.main"}}/>
                    </NavLink>

                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                        }}
                    >
                        HOPE-HEALTH
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap:2 }}>
                        {pages.map((page) => (
                            <MenuItem
                                key={page.title}
                                onClick={handleCloseNavMenu}
                                sx={(theme) => ({


                                    transition:"all 0.2s ease-in-out",
                                    borderRadius:2,
                                    border:"2px solid transparent",
                                    "&:hover": {
                                        borderBottomColor: theme.palette.primary.main,
                                        borderBottom:"2px solid ",
                                        borderRadius:10,
                                    },
                                })}
                            >
                                <NavLink style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}  to={page.link} >
                                    <Typography sx={{ textAlign: "left", width: "100%" }}>
                                        {page.title}
                                    </Typography>
                                </NavLink>
                            </MenuItem>
                        ))}
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 , marginRight:"20px"}}>
                                <Avatar alt={localStorage.getItem("loggedUser")?.charAt(0).toLocaleUpperCase()}  >
                                    <Typography>{localStorage.getItem("loggedUser")?.charAt(0).toLocaleUpperCase()}</Typography>
                                </Avatar>

                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem divider sx={{}} key={setting.id} onClick={()=>{
                                    setting.onClick()
                                    handleCloseUserMenu()
                                }}>
                                    <Typography sx={{paddingRight:10, textAlign: 'center', color: 'primary.main', }}>{setting.name}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <ThemeToggleButton />
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
