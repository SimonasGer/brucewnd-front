import { useState, useEffect } from "react";
import axios from "axios";
import { ListItem } from "../listItem/ListItem";
import "./list.scss";
export const List = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get(`${apiUrl}/comics`);
                setItems(res.data);
            } catch (err) {
                console.error(err);
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [apiUrl]);
    return(
        <>
        <h2>All works</h2>
        {error && <p className="error">{error}</p>}
        {loading && <p className="loading">Loading...</p>}
        <section className="items"> 
            {items.map((item) => (
                <ListItem
                    key={item.id}
                    name={item.name}
                    image={item.coverImage}
                />
            ))}
        </section>
        </>
    );
}