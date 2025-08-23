import  {useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

const CookieManagerService = {
    set: (token: string, key: string) => localStorage.setItem(key, token),
    get: (key: string) => localStorage.getItem(key),
    tokenIsExists: (key: string) => !!localStorage.getItem(key),
    remove:(key:string)=> localStorage.removeItem(key),
};


function Login({ onLogin}) {


    const user_url = import.meta.env.VITE_USER_API;
    const kc_url = import.meta.env.VITE_KC_API;
    const client_id = import.meta.env.VITE_CLIENT_ID;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    // const navigateTo = useNavigate();

    const handleSubmit = async (e:any) => {
        setError("")
        e.preventDefault();

        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("client_id", client_id);
        params.append("username", username);
        params.append("password", password);

        await axios.post(kc_url, params, {headers:{"Content-Type": "application/x-www-form-urlencoded"}})
            .then((res)=>{
                const {access_token, refresh_token} = res.data;
                CookieManagerService.set(access_token, "access_token");
                CookieManagerService.set(refresh_token, "refresh_token");

                axios.post(`${user_url}/visitor/verify-admin-role`, {}, {headers:{Authorization: `Bearer ${CookieManagerService.get("access_token")}`}})
                    .then(res=>{
                        console.log("Success")
                        CookieManagerService.set(access_token, "access_token");
                        CookieManagerService.set(refresh_token, "refresh_token");
                        if(onLogin) onLogin(username); // pass email for app
                        console.log(res.data.data)
                    }).catch(err=>{
                        CookieManagerService.remove("access_token")
                        CookieManagerService.remove("refresh_token")
                        setError(err.message)
                        setLoading(false);
                        console.log(err)
                    })

            }).catch(err=>{
                if(err.response.data.error === "invalid_grant"){
                    setError("Wrong Credentials")
                    CookieManagerService.remove("access_token")
                    CookieManagerService.remove("refresh_token")
                }
                return;
            }).catch(err=>{
                console.log(err.message)
            })

    }


    // completed test on ui
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                marginLeft:"10px",
                marginRight:"10px",
                mx:"auto"
            }}
        >
            <Paper
                elevation={4}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    minWidth: 350,
                    maxWidth: 400,
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        color:"primary.main"
                    }}
                >
                    Admin Portal
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type="email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                    {error && (
                        <Typography
                            color="error"
                            sx={{ mt: 1, mb: 1 }}
                        >
                            {error.code}
                        </Typography>
                    )}
                    <Box
                        sx={{
                            mt: 3,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !username || !password}
                            fullWidth
                            sx={{
                                height: 48,
                                fontWeight: "bold",
                                fontSize: "1rem",
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    color="inherit"
                                />
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </Box>
                </form>

            </Paper>
        </Box>
    );
}
export default Login;
