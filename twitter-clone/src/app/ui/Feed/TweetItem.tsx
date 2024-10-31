import styles from "@/app/ui/Feed/TweetItem.module.css"

export default function TweetItem({ name = "Billy", username = "Bob James", time = "2024-10-30T12:34:56.123Z", content = "Hello new tweet", mediaUrls = [""] }:
    { name: string, username: string, time: string, content: string, mediaUrls: string[] }
) {

    return (
        <>
            <div className={styles.TweetContainer}>
                <div></div>
                <div>
                    <div>
                        <div>

                        </div>
                        <div>

                        </div>
                    </div>
                    <div>
                    </div>
                    <div>

                    </div>
                    <div></div>
                </div>
            </div>
        </>)
}