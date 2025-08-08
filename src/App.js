import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { jwtDecode } from "jwt-decode";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { User } from "./pages/user/User";
import { Dashboard } from "./pages/dashboard/Dashboard";

const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        const valid = decoded.exp && decoded.exp > now;
        if (!valid) {
            localStorage.removeItem("brucewndtoken");
        }
        return valid;
    } catch (e) {
        localStorage.removeItem("brucewndtoken");
        return false;
    }
}

const containsRole = (token, role) => {
    const decoded = jwtDecode(token);
    return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"].includes(role);
}

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("brucewndtoken");
    return token && isTokenValid(token) && containsRole(token, role) ? children : <Navigate to="/"/>;
}

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("brucewndtoken");
    return token && isTokenValid(token) ? <Navigate to="/"/> : children;
}

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<PublicRoute><Login/></PublicRoute>}/>
                    <Route path="/register" element={<PublicRoute><Register/></PublicRoute>}/>
                    <Route path="/user" element={<ProtectedRoute role="user"><User/></ProtectedRoute>}/>
                    <Route path="/dashboard" element={<ProtectedRoute role="admin"><Dashboard/></ProtectedRoute>}/>
                </Routes>
            </Router>
            <Analytics/>
        </div>
    );
}

export default App;
