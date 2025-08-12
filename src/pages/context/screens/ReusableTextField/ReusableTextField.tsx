import React from "react";
import {TextField} from "@mui/material";

interface ReusableTextFieldProps {
    label:string;
    variant?:string | any;
    helperText?: string;
    fullWidth:boolean;
    required:boolean;
    type:string;
    value:string | number;
    onChange:()=>void;
}
const ReusableTextField : React.FC<ReusableTextFieldProps> = ({
    label,variant, helperText, type, value, fullWidth, onChange, required

}) =>{
    return(
        <TextField
            label={label}
            variant={variant}
            helperText={helperText}
            type={type}
            value={value}
            fullWidth={fullWidth}
            onChange={onChange}
            required={required}

        />
    )
}
export default ReusableTextField;
