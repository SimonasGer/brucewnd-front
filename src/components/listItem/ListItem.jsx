import "./listItem.scss"
export const ListItem = (props) => {
    return(
        <article className="card">
            <div>
                <h3>{props.name}</h3>
                <img src={props.image} alt="Thumbnail"/>
            </div>
        </article>
    );
}