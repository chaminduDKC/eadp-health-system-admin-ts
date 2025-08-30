import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import axiosInstance from "../../../axios/axiosInstance.ts";
import {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import ReusableModal from "./ReusableModal/ReusableModal.tsx";
import Typography from "@mui/material/Typography";
import AlertHook from '../../../alert/Alert.ts'
import {Alert, Collapse} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";


interface Column {
    id: 'packageTitle' | 'category' | 'instructionsList' | 'testsList' | 'density';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
    format?: (value: []) => string;
}
interface Package {
    packageTitle: string;
    packageId: string;
    population: number;
    packagePrice: number;
    category: string;
    instructionsList: string[];
    testsList: string[];
    size: number;
    density: number;
}


const columns: readonly Column[] = [
    { id: 'packageTitle', label: 'Title', minWidth: 100 },
    { id: 'category', label: 'Category', minWidth: 100 },
    {
        id: 'instructionsList',
        label: 'Instructions',
        minWidth: 170,
        align: 'left',

    },
    {
        id: 'testsList',
        label: 'Tests included',
        minWidth: 170,
        align: 'left',


    },

];



export default function Checkups() {

    const healthPackageUrl = import.meta.env.VITE_HEALTH_PACKAGE_API;

    const {alertStatus, showAlert, closeAlert, openAlert} = AlertHook();

    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(2);

    const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
        setPage(newPage);
        fetchPackages(newPage, rowsPerPage, "");
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {

        const newSize = parseInt(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(0);
        fetchPackages(0, newSize, "")
    };

    useEffect(() => {
        fetchPackages(page, rowsPerPage, "");
    }, []);
    const [packages, setPackages] = useState<Package[]>([]);
    const [packageCount, setPackageCount] = useState<number>(0)


    const fetchPackages = async (page:number, size:number, searchText:string)=>{
        await axiosInstance.get(`${healthPackageUrl}/get-all-health-packages`, {params:{searchText:searchText, page:page, size:size}}).then(res=>{
            setPackages(res.data.data.packageList)
            setPackageCount(res.data.data.packageCount)
        }).catch(err=>{
            showAlert("Failed to load package data. try again")
            console.log(err)
        });
    }

    const [openDetailModal, setOpenDetailModal] = useState(false)
    const [modalData, setModalData] = useState<Package | null>();

    const handleCloseDetailModal = ()=>{
        setOpenDetailModal(false);
    }
    const deletePackage = async (id:string)=>{
        await axiosInstance.delete(`${healthPackageUrl}/delete-package-by-id/${id}`).then(()=>{

            setOpenDetailModal(false)
            fetchPackages(page, rowsPerPage, "");
            showAlert("Package deleted successfully")
        }).catch(err=>{
            showAlert("Failed to delete package")
            console.log(err)
        })
    }
    return (
        <Box  sx={{
            width: "100%",
            mx: "auto",
            marginTop: "100px",
            marginBottom: {
                xl: "50px",
                lg: "460px",
                md: "50px",
                sm: "50px",
                xs: "50px",
            },
            padding: {
                xl: "20px 200px",
                lg: "20px 100px",
                md: "20px 20px",
                sm: "20px 50px",
                xs: "20px 10px",
            },
            overflow: 'hidden'
        }}>

            {/**/}

            <Collapse  sx={{
                width: { xs: '96%', sm: '80%', md: '60%' },
                margin: "0 auto",
                position: "fixed",
                top: "85px",
                right: 0,
                left: 0,
                zIndex: 14,
                px: { xs: 1, sm: 0 }
            }} in={openAlert}>
                <Alert
                    severity={alertStatus.includes("success") ? "success" : "error"}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            onClick={closeAlert}
                        >
                            <CloseIcon />
                        </IconButton>
                    }
                    sx={{
                        fontSize: { xs: "0.95rem", sm: "1rem" },
                        alignItems: "center"
                    }}
                >
                    {alertStatus}
                </Alert>
            </Collapse>

            {/**/}
            <ReusableModal
                title={"Delete?"}
                maxWidth="xs"
                open={openDetailModal}
                onClose={handleCloseDetailModal}
                actions={[{label:"close", onClick:handleCloseDetailModal}, {label: "delete", onClick:()=>{
                    if(modalData?.packageId){
                        deletePackage(modalData.packageId)
                    }
                    else {
                        console.log("Cannot delete")
                    }
                    }}]}
                content={
                    <Box sx={{
                        display:"flex",
                        flexDirection:"column",
                        gap:2
                    }}>

                        <Typography>Are you sure you want to delete this package?</Typography>
                    </Box>
                }
            />
        <Paper sx={{
            padding:1,
            backgroundColor:"Background.main"
        }} >

            <TableContainer sx={{ maxHeight: 440, backgroundColor:"background.paper" }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {packages.map((row) => {
                                return (

                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.packageId}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {
                                                        column.id === "packageTitle" &&
                                                        <IconButton>
                                                            <DeleteIcon onClick={()=>{
                                                                setModalData(row)
                                                                setOpenDetailModal(true);

                                                            }} />
                                                        </IconButton>
                                                    }
                                                    {Array.isArray(value) ? (
                                                        <ul style={{ paddingLeft: "20px", margin: 0 }}>
                                                            {value.map((item: string, idx: number) => (
                                                                <li key={idx}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) :  (
                                                        value
                                                    )}

                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[2,5, 10, 25, 50, 100]}
                component="div"
                count={packageCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
            {/*alert*/}

            {/*alert*/}
        </Box>
    );
}
