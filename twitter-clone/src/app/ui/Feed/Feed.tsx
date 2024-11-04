'use client'
import TweetPost from "@/app/ui/Home/TweetPost"
import { useEffect, useState } from "react"
import styles from '@/app/ui/Feed/Feed.module.css'
import TweetItem from "@/app/ui/Feed/TweetItem";
type Tweet = {
    id: string;
    content: string;
    parent_tweet_id?: string;
    tweet_type: string;
    createdAt: string;
    media_info?: string;
    name: string;
    cover_image_url?: string;
    username: string;
};
export default function Feed() {
    const [tweets, updateTweets] = useState<Tweet[]>([]);
    const loadInTweets = async () => {
        const data = fetch(`/api/pullTweets?timestamp=${new Date().toISOString()}`).then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweets');
            }
            return response.json(); // Parse the response JSON
        }).then(data => {
            updateTweets([...tweets, ...data.results]);
            // Do something with data.results if your response format is { results: [...] }
        })
            .catch(error => {
                console.error('Error loading tweets:', error);
            });
    }

    useEffect(() => {
        loadInTweets();
        console.log(tweets)
    }, [])
    return (
        <>
            <TweetPost></TweetPost>
            <div className={styles.FeedContainer}>
                <TweetItem profileUrl="" name="Bob" username="HelloThere" time="2024-10-30T12:34:56.123Z" content="Hello There everyone" mediaUrls={[""]} ></TweetItem>
            </div>
        </>
    )
}
