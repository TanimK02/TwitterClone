
import "@/app/ui/profile/NavTop.css"
import GoBack from "@/app/ui/profile/goBack"

export default async function TopNav({ username = "", postAmount }: { username?: string, postAmount?: Number | null }) {

    return (
        <>
            <nav className='profileNav-div'>
                <GoBack></GoBack>
                <div className="user-info">
                    <p className="display-name">{username || ""}</p>
                    <p className="post-number">{postAmount?.toString() || 0} posts</p>
                </div>
            </nav>
        </>
    )
}