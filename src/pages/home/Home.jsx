import { Header } from "../../components/header/Header";
import { Search } from "../../components/search/Search";
import { List } from "../../components/list/List";
export const Home = () => {
    return(
        <main>
            <Header/>
            <Search/>
            <List/>
        </main>
    );
}