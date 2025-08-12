import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ActionButton {
    label: string;
    onClick: () => void ;
    color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
    variant?: "text" | "outlined" | "contained";
    disabled?:boolean;
}

interface ReusableModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
    actions?: ActionButton[] | React.ReactNode; // can be array OR JSX
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

const ReusableModal: React.FC<ReusableModalProps> = ({
                                                         open,
                                                         onClose,
                                                         title,
                                                         content,
                                                         actions,
                                                         maxWidth = "sm",
                                                     }) => {
    return (
        <Dialog sx={{
            mx:{xs:"auto"},
            width:{xs:"100%"},
            maxWidth:"700px",
            minWidth:"360px"
        }} open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, color: "primary.main" }}>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                width:"100%"
            }} dividers>{content}</DialogContent>

            <DialogActions>
                {Array.isArray(actions)
                    ? actions.map((btn, index) => (
                        <Button
                            key={index}
                            onClick={btn.onClick}
                            color={btn.color || "primary"}
                            variant={btn.variant || "contained"}
                        >
                            {btn.label}
                        </Button>
                    ))
                    : actions}
            </DialogActions>
        </Dialog>
    );
};

export default ReusableModal;
