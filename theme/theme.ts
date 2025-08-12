import { createTheme } from "@mui/material/styles"

declare module "@mui/material/styles" {
    interface Theme {
        customGradients: {
            primary: string;
            secondary: string;
            success: string;
            danger: string;
        };
    }
    interface ThemeOptions {
        customGradients?: {
            primary?: string;
            secondary?: string;
            success?: string;
            danger?: string;
        };
    }
}

export const lightTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#00C565" },
        secondary: { main: "#008A47" },
        background: {
            default: "#ffffff",
            paper: "#f6f5f5",
        },
        text: {
            primary: "#1a1a1a",
            secondary: "#4d4d4d",
        },
    },
    customGradients: {
        primary: "linear-gradient(135deg, #00C565, #008A47)",
        secondary: "linear-gradient(135deg, #43cea2, #185a9d)",
        success: "linear-gradient(135deg, #56ab2f, #a8e063)",
        danger: "linear-gradient(135deg, #ff416c, #ff4b2b)",
    },
});

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#00C06B" },
        secondary: { main: "#00A75F" },
        background: {
            default: "#0d0d0d",
            paper: "#1a1a1a",
        },
        text: {
            primary: "#f5f5f5",
            secondary: "#bfbfbf",
        },
    },
    customGradients: {
        primary: "linear-gradient(135deg, #00C06B, #00A75F)",
        secondary: "linear-gradient(135deg, #4b6cb7, #182848)",
        success: "linear-gradient(135deg, #11998e, #38ef7d)",
        danger: "linear-gradient(135deg, #ff5f6d, #ffc371)",
    },
});