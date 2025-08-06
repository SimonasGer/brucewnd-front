import "./search.scss";
export const Search = () => {
    return(
        <form className="search-form">
            <input type="text" placeholder="Search series"/>
            <button>Search</button>
        </form>
    );
}