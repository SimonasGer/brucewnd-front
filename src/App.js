import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { jwtDecode } from "jwt-decode";
const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token)
        const now = Date.now() / 1000
        const valid = decoded.exp && decoded.exp > now
        if (!valid) {
            localStorage.removeItem("token")
        }
        return valid
    } catch (e) {
        localStorage.removeItem("token")
        return false
    }
}


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token && isTokenValid(token) ? children : <Navigate to="/"/>;
}

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token && isTokenValid(token) ? <Navigate to="/game"/> : children;
}

function App() {
    return (
        <div className="App">
            
            <Analytics/>
        </div>
    );
}

export default App;
