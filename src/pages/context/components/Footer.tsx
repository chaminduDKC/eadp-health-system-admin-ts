import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                position: "fixed",
                bottom: 0,
                width: "100%",
                backgroundColor: "background.paper",
                borderTop: "1px solid",
                borderColor: "divider",
                py: 2,
                px: { xs: 2, sm: 4, md: 8 },
                textAlign: "center",
                zIndex: 1300,
            }}
        >
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} HopeHealth. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
