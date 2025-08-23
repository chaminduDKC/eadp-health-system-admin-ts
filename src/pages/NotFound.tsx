import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            textAlign="center"
            bgcolor="background.default"
            color="text.primary"
            px={2}
        >
            <Typography variant="h1" component="h1" fontWeight="bold" gutterBottom>
                404
            </Typography>

            <Typography variant="h5" gutterBottom>
                Oops! Page not found.
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={3}>
                The page you’re looking for doesn’t exist or has been moved.
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/")}
                sx={{ borderRadius: 2, px: 3 }}
            >
                Go Home
            </Button>
        </Box>
    );
};

export default NotFound;
