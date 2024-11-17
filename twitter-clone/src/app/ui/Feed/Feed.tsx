'use client'
import TweetPost from "@/app/ui/Home/TweetPost"
import { useEffect, useState } from "react"
import styles from '@/app/ui/Feed/Feed.module.css'
import TweetItem from "@/app/ui/Feed/TweetItem";
import TopNav from "@/app/ui/Home/NavTop";
import { pullTweetsFromFollowing } from "@/app/lib/TweetActions/actions";
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
export default function Feed({ username }: { username?: string }) {
    const [tweets, updateTweets] = useState<Tweet[]>([]);
    const loadInTweets = async (erase: boolean = false) => {
        const data = fetch(`/api/pullTweets?timestamp=${new Date().toISOString()}`).then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweets');
            }
            return response.json(); // Parse the response JSON
        }).then(data => {
            if (erase) {
                updateTweets([...data.results])
            } else {
                updateTweets([...tweets, ...data.results]);
            }

            // Do something with data.results if your response format is { results: [...] }
        })
            .catch(error => {
                console.error('Error loading tweets:', error);
            });
    }

    const loadInProfileTweets = async (offset: number = 0, erase: boolean = false) => {
        const data = fetch(`/api/profile?username=${username}&offset=${offset}`).then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweets');
            }
            return response.json(); // Parse the response JSON
        }).then(data => {
            if (erase) {
                updateTweets([...data.results])
            } else {
                updateTweets([...tweets, ...data.results]);
            }

            // Do something with data.results if your response format is { results: [...] }
        })
            .catch(error => {
                console.error('Error loading tweets:', error);
            });
    }

    const loadInFollowingTweets = async (offset: number = 0, erase: boolean = false) => {
        const data = fetch(`/api/pullFollowingTweets?&offset=${offset}`).then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tweets');
            }
            return response.json(); // Parse the response JSON
        }).then(data => {
            if (erase) {
                updateTweets([...data.results])
            } else {
                updateTweets([...tweets, ...data.results]);
            }

            // Do something with data.results if your response format is { results: [...] }
        })
            .catch(error => {
                console.error('Error loading tweets:', error);
            });
    }

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

    const [following, setFollowing] = useState<boolean>(false);

    useEffect(() => {

        if (!username && !following) {
            loadInTweets(true);
        }
        else if (following) {
            loadInFollowingTweets(0, true);
        }
        else {
            loadInProfileTweets(0, true)
        }

    }, [following])
    return (
        <>{!username &&
            <>
                <TopNav following={following} setFollowing={setFollowing}></TopNav>
                <TweetPost></TweetPost>
            </>}
            <div className={styles.FeedContainer}>
                {tweets.map((tweet, index) => <TweetItem key={index} profileUrl={tweet.cover_image_url || ""} name={tweet.name} username={tweet.username} time={tweet.createdAt} content={tweet.content} mediaUrls={tweet.media_info ? parseMediaInfo(tweet.media_info) : []} ></TweetItem>)}
            </div>
        </>
    )
}
