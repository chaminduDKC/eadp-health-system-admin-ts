
import { useState } from "react";

export default function Alert() {
    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [alertStatus, setAlertStatus] = useState<string>("");

    const showAlert = (status:string) => {
        setAlertStatus(status);
        setOpenAlert(true);
    };

    const closeAlert = () => {
        setOpenAlert(false);
        setAlertStatus("");

    };

    return {
        openAlert,
        alertStatus,
        showAlert,
        closeAlert
    };
}
