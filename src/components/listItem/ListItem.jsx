import { useNavigate } from "react-router-dom";
import "./listItem.scss"
export const ListItem = (props) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/comics/${props.name}`);
    }

    return(
        <article onClick={handleClick} className="card">
            <div>
                <img src={props.image} alt="Thumbnail"/>
            </div>
        </article>
    );
}