import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/header/Header";
import "./auth.scss"
export const Login = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/users/login`, user);
            localStorage.setItem("brucewndtoken", res.data.token);
            navigate("/");
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("Something went wrong.");
        }
    }

    const handleChange = (e) => {
        setUser({
            ...user, 
            [e.target.name]: e.target.value
        })
    }
    return(
        <>
        <Header/>
        <form onSubmit={handleSubmit} className="auth-form">
            <fieldset>
                <input type="text" name="username" placeholder="Username" value={user.username} onChange={handleChange} required/>
                <input type="password" name="password" placeholder="Password"  value={user.password} onChange={handleChange} required/>
                <button type="submit">Log In</button>
                {error && <p className="error">{error}</p>}
                {loading && <p className="loading">Loading...</p>}
                <a href="./register">Don't have an account? Sign Up.</a>
            </fieldset>
        </form>
        </>
    );
}