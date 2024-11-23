import "@/app/ui/profile/NavTop.css"
import GoBack from "@/app/ui/profile/goBack"

export default async function TopNav() {

    return (
        <>
            <nav className='profileNav-div' style={{ borderBottom: "none" }}>
                <GoBack></GoBack>
                <div className="user-info">
                    <p className="display-name">Post</p>
                </div>
            </nav>
        </>
    )
}