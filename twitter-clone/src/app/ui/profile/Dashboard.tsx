import styles from "@/app/ui/profile/Dashboard.module.css"
import profile from "@/public/profile.svg"
export default function Dashboard() {


    return (<>
        <div className={styles.DashboardContainer}>
            <div className={styles.ProfileContainer}>
                <img src={profile.src}></img>
            </div>
            <div className={styles.FollowContainer}>
                <div className={styles.InfoContainer}>
                    <div className={styles.NameDiv}>
                        <span className={styles.name}>OvooKhan</span>
                        <span className={styles.username}>@Oovoo</span>
                    </div>
                    <span className={styles.date}>Joined October 2023</span>

                    <div className={styles.followerStats}>
                        <div className={styles.following}>3 <div style={{ color: "rgb(113, 118, 123)" }}>Following</div></div>
                        <div className={styles.followers}>1 <div style={{ color: "rgb(113, 118, 123)" }}>Followers</div></div>
                    </div>
                </div>
                <button className={styles.followButton}>Follow</button>
            </div>
        </div>
    </>)
}