import "./header.scss";
export const Header = () => {
    return(
        <header>
            <nav>
                <a href="/"><img src={require("./logo512.png")} width={50} alt="BruceWnD"/></a>
                <div>
                    <a href="/login">Log In</a>
                    <a href="/register">Sign Up</a>
                </div>
            </nav>
        </header>
    );
}