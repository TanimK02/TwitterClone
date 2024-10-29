import { getUserPostAmount } from "@/app/lib/actions";
import "@/app/(overview)/[username]/profile.css"
import SearchFollow from "@/app/ui/profile/SearchFollow";
import NavTop from "@/app/ui/profile/NavTop"
import { redirect } from 'next/navigation'
export default async function Home({ params }: { params: { username: string } }) {

    const [postAmount] = await Promise.all([     // Call your existing getUserByName function
        getUserPostAmount(params.username)       // Call the new getUserPostAmount function
    ]);
    if (postAmount == null) {
        redirect("/Home"); // Use server-side redirect
    }
    return (<>
        <div className="profile">
            <NavTop username={params.username} postAmount={postAmount as number}></NavTop>
        </div>
        <SearchFollow></SearchFollow>
    </>
    );
}
