import SearchFollow from "@/app/ui/Home/SearchFollow";
import NavTop from "@/app/ui/profile/NavTop.jsx"
export default function Home() {
    return (<>
        <div className="profile">
            <NavTop></NavTop>
        </div>
        <SearchFollow></SearchFollow>
    </>
    );
}
