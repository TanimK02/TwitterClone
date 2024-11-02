'use client'
import TweetPost from "@/app/ui/Home/TweetPost"
import { useState } from "react"
import styles from '@/app/ui/Feed/Feed.module.css'
import TweetItem from "@/app/ui/Feed/TweetItem";

export default function Feed() {
    const [tweets, updateTweets] = useState();
    return (
        <>
            <TweetPost></TweetPost>
            <div className={styles.FeedContainer}>
                <TweetItem profileUrl="" name="Bob" username="HelloThere" time="2024-10-30T12:34:56.123Z" content="Hello There everyone" mediaUrls={[""]} ></TweetItem>
            </div>
        </>
    )
}
