
import { checkFollow, getUserProfile } from "@/app/lib/actions"
import styles from "@/app/ui/profile/Dashboard.module.css"
import { auth } from "@/auth";
import profile from "@/public/profile.svg"
import { redirect } from "next/navigation";
import FollowButton from "@/app/ui/Home/FollowButton";
import EditProfile from "@/app//ui/profile/EditProfile";

type returnUserProfile = {
    cover_image_url: string | null,
    username: string,
    name: string
    created_at: string,
    following: number,
    id: string,
    followers: number
}


export default async function Dashboard({ username }: { username: string }) {

    const user: returnUserProfile[] = await getUserProfile(username) as returnUserProfile[];
    if (!user) {
        redirect("/Home")
    }
    const cover_image_url = user[0].cover_image_url;
    const response = await checkFollow(user[0].username);
    const following = await response.json();
    const session = await auth();
    function formatMonthYear(dateString: string): string {
        const date = new Date(dateString);

        // Options for formatting: abbreviated month and full year
        const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };

        return date.toLocaleDateString('en-US', options);
    }


    return (<>
        <div className={styles.DashboardContainer}>
            <div className={styles.ProfileContainer}>
                <img src={cover_image_url ? cover_image_url : profile.src}></img>
            </div>
            <div className={styles.FollowContainer}>
                <div className={styles.InfoContainer}>
                    <div className={styles.NameDiv}>
                        <span className={styles.name}>{user[0].name || "No Name Exists"}</span>

                        <span className={styles.username}>@{user[0].username}</span>
                    </div>
                    <span className={styles.date}>Joined {formatMonthYear(user[0].created_at)}</span>

                    <div className={styles.followerStats}>
                        <div className={styles.following}>{user[0].following} <div style={{ color: "rgb(113, 118, 123)" }}>Following</div></div>
                        <div className={styles.followers}>{user[0].followers} <div style={{ color: "rgb(113, 118, 123)" }}>Followers</div></div>
                    </div>

                </div>

            </div>
            <div className={styles.ButtonDiv}>
                {session?.user?.id !== user[0].id && (
                    <FollowButton username={user[0].username} className={styles.followButton} curFollow={following.result ? true : false}></FollowButton>
                )}
                {session?.user?.id == user[0].id && (
                    <EditProfile className={styles.followButton} first={!user[0].cover_image_url ? true : false} />
                )}
            </div>
        </div>
    </>)
}