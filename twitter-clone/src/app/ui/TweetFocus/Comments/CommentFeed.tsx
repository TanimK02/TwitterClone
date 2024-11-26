'use client'
import CommentPost from "@/app/ui/TweetFocus/CommentPost"
import { useEffect, useState } from "react"
import styles from '@/app/ui/TweetFocus/Comments/CommentFeed.module.css'
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
    likes: number;
    liked: boolean;
    retweets: number;
    retweeted: boolean;
    retweeter_username: string;
    replyingTo: string;
};
export default function CommentFeed({ parentId, user }: { parentId: string, user: string }) {
    const [tweets, updateTweets] = useState<Tweet[]>([]);


    function parseMediaInfo(mediaInfo: string) {
        // Split the mediaInfo string by comma to separate each media entry
        const mediaItems = mediaInfo.split(',');

        // Map each media entry into an object with id, url, and type keys
        const mediaList = mediaItems.map(item => {
            const [id, url, type] = item.split('|');
            return {
                id: id,
                url: url,
                type: type
            };
        });

        return mediaList;
    }


    useEffect(() => {


    })
    return (
        <>
            <CommentPost user={user} parentId={parentId}></CommentPost>
            <div className={styles.FeedContainer}>
                {tweets.map((tweet, index) => <TweetItem key={index} retweeter={tweet.retweeter_username} retweeted={tweet.retweeted} retweets={tweet.retweets} liked={tweet.liked} id={tweet.id} likes={tweet.likes} profileUrl={tweet.cover_image_url || ""} name={tweet.name} username={tweet.username} time={tweet.createdAt} content={tweet.content} mediaUrls={tweet.media_info ? parseMediaInfo(tweet.media_info) : []} ></TweetItem>)}
            </div>
        </>
    )
}
