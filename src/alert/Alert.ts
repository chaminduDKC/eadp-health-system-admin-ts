// src/hooks/useAlert.js
import { useState } from "react";

export default function Alert() {
    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [alertStatus, setAlertStatus] = useState<string>("");

    const showAlert = (status:string) => {
        setAlertStatus(status);
        setOpenAlert(true);
    };

    const closeAlert = () => {
        setAlertStatus("");
        setOpenAlert(false);
    };

    return {
        openAlert,
        alertStatus,
        showAlert,
        closeAlert
    };
}
