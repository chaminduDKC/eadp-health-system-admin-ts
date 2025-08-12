import Login from './pages/login/Login.tsx'
import {useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";
import Context from "./pages/context/Context.tsx";
import Home from './pages/context/screens/Home.tsx'
import {AppThemeProvider} from "../theme/ThemeContext.tsx";
import Appointment from "./pages/context/screens/Appointment.tsx";
import Patients from "./pages/context/screens/Patients.tsx";
import Doctor from "./pages/context/screens/Doctor.tsx";


const isValidToken = (token:any)=>{
    if(token !== null){
        return token.trim() !== "" && token !== "undefined";
    }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(isValidToken(localStorage.getItem("access_token")));
  const [loggedEmail, setLoggedEmail] = useState<string>("");

  const handleLogin = (email:string)=>{
    setLoggedEmail(email);
    localStorage.setItem("loggedUser", email)
    setIsAuthenticated(true);
  }

  useEffect(() => {
    setIsAuthenticated(isValidToken(localStorage.getItem("access_token")))
  }, [isAuthenticated]);




  return (
<AppThemeProvider>
    <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/context" /> : <Navigate to="/login"/>}/>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/context" /> : <Login onLogin={handleLogin} /> }/>
        <Route path="/context" element={isAuthenticated ? <Context /> : <Login onLogin={handleLogin} />}>
            <Route path="/context" element={<Navigate to="/context/home" /> } />
            <Route path="/context/home" element={<Home />} />
            <Route path="/context/appointments" element={<Appointment />} />
            <Route path="/context/doctors" element={<Doctor />} />
            <Route path="/context/patients" element={<Patients />} />
        </Route>

    </Routes>
</AppThemeProvider>

  )
}

export default App
