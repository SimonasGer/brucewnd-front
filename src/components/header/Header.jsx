import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./header.scss";
export const Header = () => {
    const navigate = useNavigate();

    const checkRole = (role) => {
        const token = localStorage.getItem("brucewndtoken");
        if (!token) return false;
        const decoded = jwtDecode(token);
        const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const roles = Array.isArray(roleClaim) ? roleClaim : roleClaim ? [roleClaim] : [];
        return roles.includes(role);
    }

    const checkName = () => {
        const token = localStorage.getItem("brucewndtoken");
        if (!token) return false;
        const decoded = jwtDecode(token);
        return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
    }

    const handleLogout = (e) => {
        localStorage.removeItem("brucewndtoken");
        navigate("/");
    }

    return(
        <header>
            <nav>
                <a href="/"><img src={require("./logo512.png")} width={50} alt="BruceWnD"/></a>
                {!localStorage.getItem("brucewndtoken") && 
                <div>
                    <Link to="/login">Log In</Link>
                    <Link to="/register">Sign Up</Link>
                </div>}
                {checkRole("user") && 
                <div>
                    {checkRole("admin") && <Link to="/dashboard">Dashboard</Link>}
                    <Link to="/user">{checkName()}</Link>
                    <Link onClick={handleLogout} to="/">Log Out</Link>
                </div>}
            </nav>
        </header>
    );
}