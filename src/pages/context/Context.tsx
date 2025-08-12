import Header from "./components/Header.tsx";
import {Outlet} from "react-router-dom";
import Footer from "./components/Footer.tsx";

const Context = () =>
    (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>

);

export default Context;