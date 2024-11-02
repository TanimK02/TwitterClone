import styles from "@/app/ui/Feed/TweetItem.module.css"
import Image from "next/image"
import sasuke from "@/public/sasuke.webp"
import profile from "@/public/profile.svg"
import threeDots from "@/public/three-dots.svg"
import commentPic from "@/public/comment.svg"
import retweetPic from "@/public/retweet.svg"
import heart from "@/public/heart.svg"
import stats from "@/public/statsPic.svg"
import bookmark from "@/public/bookmark.svg"
import upload from "@/public/upload.svg"

export default function TweetItem({ name = "Billy", username = "Bob James", time = "2024-10-30T12:34:56.123Z", content = "Hello new tweet", mediaUrls = [""], profileUrl = "" }:
    { name: string, username: string, time: string, content: string, mediaUrls: string[], profileUrl: string }
) {

    function timeAgo(dateString: string) {
        const now = new Date();
        const inputDate = new Date(dateString);

        // Calculate the difference in milliseconds
        const diffMs = now.getTime() - inputDate.getTime();

        // Convert milliseconds to hours
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            const hoursAgo = Math.floor(diffHours);
            return `${hoursAgo}h`;
        } else {
            // Determine if the input date's year is different from the current year
            const options: Intl.DateTimeFormatOptions = {
                month: 'short',
                day: 'numeric',
            };

            if (inputDate.getFullYear() !== now.getFullYear()) {
                options.year = 'numeric';
            }

            // Format the date accordingly
            return new Intl.DateTimeFormat('en-US', options).format(inputDate);
        }
    }


    time = timeAgo(time);

    return (
        <>
            <div className={styles.TweetContainer}>
                <div className={styles.Profile}>
                    <Image src={profileUrl || sasuke || profile} height={40} width={40} alt="profile picture from tweet"></Image>
                </div>
                <div className={styles.ContentContainer}>
                    <div className={styles.ProfileInfo}>
                        <div className={styles.ProfileNames}>
                            <p className={styles.Name}>{name}</p><p className={styles.UserName}>@{username}</p><p className={styles.Point}>•</p><p className={styles.Time}>{time}</p>
                        </div>
                        <div className={styles.Options}>
                            <Image src={threeDots} height={19} width={19} alt="Tweet Options"></Image>
                        </div>
                    </div>
                    <div className={styles.ContentText}>
                        {content}
                    </div>
                    <div className={styles.MediaContainer}>
                    </div>
                    <div className={styles.FooterContainer}>
                        <div className={styles.CRHS}>
                            <div className={styles.ImageContainer}>
                                <Image src={commentPic} height={20} width={20} alt="open comments and comment"></Image> <span>0</span>
                            </div>
                            <div className={styles.ImageContainer}>
                                <Image src={retweetPic} height={20} width={20} alt="Retweet"></Image> <span>0</span>
                            </div>
                            <div className={styles.ImageContainer}>
                                <Image src={heart} height={20} width={20} alt="Like the tweet"></Image> <span>0</span>
                            </div>
                            <div className={styles.ImageContainer}>
                                <Image src={stats} height={20} width={20} alt="Views"></Image> <span>525</span>
                            </div>
                        </div>
                        <div className={styles.SS}>
                            <div className={styles.ImageContainer}>
                                <Image src={bookmark} height={20} width={20} alt="Save"></Image>
                            </div>
                            <div className={styles.ImageContainer}>
                                <Image src={upload} height={20} width={20} alt="Share"></Image>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>)
}