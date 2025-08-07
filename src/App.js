import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { jwtDecode } from "jwt-decode";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";

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


export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("brucewndtoken");
    return token && isTokenValid(token) ? children : <Navigate to="/"/>;
}

export const PublicRoute = ({ children }) => {
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
                </Routes>
            </Router>
            <Analytics/>
        </div>
    );
}

export default App;
