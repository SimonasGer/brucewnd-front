import { Header } from "../../components/header/Header";
import "./auth.scss"
export const Login = () => {
    return(
        <>
        <Header/>
        <form className="auth-form">
            <fieldset>
                <input type="email" name="email" placeholder="Email"/>
                <input type="password" name="password" placeholder="Password"/>
                <button>Log In</button>
                <a href="./register">Don't have an account? Sign Up.</a>
            </fieldset>
        </form>
        </>
    );
}