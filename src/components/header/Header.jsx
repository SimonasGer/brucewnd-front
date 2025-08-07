import { useNavigate, Link } from "react-router-dom";
import "./header.scss";
export const Header = () => {
    const navigate = useNavigate();
    
    const handleLogout = (e) => {
        localStorage.removeItem("brucewndtoken");
        navigate("/");
    }

    return(
        <header>
            <nav>
                <a href="/"><img src={require("./logo512.png")} width={50} alt="BruceWnD"/></a>
                {!localStorage.getItem("brucewndtoken") && <div>
                    <Link to="/login">Log In</Link>
                    <Link to="/register">Sign Up</Link>
                </div>}
                {localStorage.getItem("brucewndtoken") && <div>
                    <Link onClick={handleLogout} to="/">Log Out</Link>
                </div>}
            </nav>
        </header>
    );
}