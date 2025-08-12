import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import {useEffect, useState} from "react";
import {Button, List} from "@mui/material";
import {TimeClock, TimePicker} from "@mui/x-date-pickers";
import axiosInstance from "../../../axios/axiosInstance.ts";
import { motion, AnimatePresence } from "framer-motion";
import {Alert, Collapse} from "@mui/material";
import AlertHook from '../../../alert/Alert.ts'
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

// Animation
const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};
type Time = {
    id: number;
    name:string
}
const Doctor = () => {
    const {openAlert, alertStatus, showAlert, closeAlert} = AlertHook();

    // ---------------------------------------
    return (
        <Box sx={{width:"100%",mx:"auto", marginTop:"60px", marginBottom:{
                xl:"50px",
                lg:"460px",
                md:"50px",
                sm:"50px",
                xs:"50px",
            }, padding:{
                xl:"20px 200px",
                lg:"20px 100px",
                md:"20px 20px",
                sm:"20px 50px",
                xs:"20px 5px",
            },}}>

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
                    {alertStatus === "failed-my-data" && "Failed to load some data. Try again."}
                    {alertStatus === "failed" && "Failed to load some data. Try again."}
                </Alert>
            </Collapse>
            {/*alert*/}

        </Box>
    );
};

export default Doctor;