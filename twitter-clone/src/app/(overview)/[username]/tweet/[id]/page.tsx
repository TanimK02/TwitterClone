import { pullTweetById } from "@/app/lib/TweetActions/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TopNav from "@/app/ui/TweetFocus/TopNav";
import FocusedTweet from "@/app/ui/TweetFocus/FocusedTweet";
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
};

export default async function TweetNdComments({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/SignUp")
    }
    const id = (await params).id
    const response = await pullTweetById(session.user.id as string, id);
    const tweets: Tweet[] = response.rows as Tweet[];
    if (tweets.length == 0) {
        redirect('/Home')
    }
    function parseMediaInfo(mediaInfo: string) {
        // Split the mediaInfo string by comma to separate each media entry
        if (mediaInfo.length == 2) {
            return null
        }
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
    return (<>
        <div style={{ display: "flex", flexDirection: "column" }}>
            <TopNav></TopNav>
            {tweets.map((tweet, index) => <FocusedTweet key={index} retweeter={tweet.retweeter_username} retweeted={tweet.retweeted} retweets={tweet.retweets} liked={tweet.liked} id={tweet.id} likes={tweet.likes} profileUrl={tweet.cover_image_url || ""} name={tweet.name} username={tweet.username} time={tweet.createdAt} content={tweet.content} mediaUrls={parseMediaInfo(tweet.media_info!)} ></FocusedTweet>)}
        </div>
    </>)
}
