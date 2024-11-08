import { getUserPostAmount } from "@/app/lib/actions";
import "@/app/(overview)/[username]/profile.css"
import NavTop from "@/app/ui/profile/NavTop"
import { redirect } from 'next/navigation'
import Dashboard from "@/app/ui/profile/Dashboard";
import Feed from "@/app/ui/Feed/Feed";
export default async function Home({ params }: { params: { username: string } }) {
    const username = decodeURIComponent(params.username)
    const postAmount = await getUserPostAmount(username); // Call the new getUserPostAmount function

    if (postAmount == null) {
        redirect("/Home"); // Use server-side redirect
    }
    return (<>
        <div className="profile">
            <NavTop username={username} postAmount={postAmount as number}></NavTop>
            <Dashboard username={username}></Dashboard>
            <Feed username={username}></Feed>
        </div>
    </>
    );
}
