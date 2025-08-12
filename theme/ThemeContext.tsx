import { createContext, useMemo, useState, useContext, type ReactNode } from "react"
import { ThemeProvider, CssBaseline } from "@mui/material"
import { lightTheme, darkTheme } from "./theme"

type ColorModeContextType = {
    mode: "light" | "dark"
    toggleColorMode: () => void
}

const ColorModeContext = createContext<ColorModeContextType | undefined>(undefined)

export const useColorMode = (): ColorModeContextType => {
    const context = useContext(ColorModeContext)
    if (!context) {
        throw new Error("useColorMode must be used within AppThemeProvider")
    }
    return context
}

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<"light" | "dark">(() => {
        const stored = localStorage.getItem("mode") as "light" | "dark" | null
        return stored ?? "dark"
    })

    const toggleColorMode = () => {
        setMode((prevMode) => {
            const newMode = prevMode === "light" ? "dark" : "light"
            localStorage.setItem("mode", newMode)
            return newMode
        })
    }

    const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode])

    return (
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    )
}
