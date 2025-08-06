import { Header } from "../../components/header/Header";
import "./auth.scss"
export const Register = () => {
    return(
        <>
        <Header/>
        <form className="auth-form">
            <fieldset>
                <input type="text" name="username" placeholder="Username"/>
                <input type="email" name="email" placeholder="Email"/>
                <input type="password" name="password" placeholder="Password"/>
                <input type="password" name="repeatPassword" placeholder="Repeat Password"/>
                <button>Log In</button>
                <a href="./login">Have an account? Log In.</a>
            </fieldset>
        </form>
        </>
    );
}