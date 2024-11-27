"use client"

import styles from "@/app/ui/TweetFocus/FocusedTweet.module.css"
import Image from "next/image"
import sasuke from "@/public/sasuke.webp"
import profile from "@/public/profile.svg"
import threeDots from "@/public/three-dots.svg"
import commentPic from "@/public/comment.svg"
import retweetPic from "@/public/retweet.svg"
import grayHeart from "@/public/heart.svg"
import redHeart from "@/public/redHeart.svg"
import bookmark from "@/public/bookmark.svg"
import upload from "@/public/upload.svg"
import Media from "@/app/ui/Feed/Media"
import greenRetweet from "@/public/retweeted.svg"
import { addLike, retweet } from "@/app/lib/TweetActions/actions"
import { useState } from "react"
import CommentFeed from "@/app/ui/TweetFocus/Comments/CommentFeed"

type MediaInfo = {
    id: string;
    url: string;
    type: string;
};

export default function FocusedTweet({ comments, name = "Billy", username = "Bob James", time = "2024-10-30T12:34:56.123Z", content = "Hello new tweet", mediaUrls, profileUrl = "", likes = 0, id, liked = false, retweets = 0,
    retweeted = false, retweeter = ""
}:
    { comments: number, name: string, username: string, time: string, content: string, mediaUrls?: MediaInfo[] | null, profileUrl: string, likes: number, id: string, liked?: boolean, retweets: number, retweeted: boolean, retweeter: null | string }
) {
    const [curLikes, setLikes] = useState<number>(likes);
    const [heart, setHeart] = useState<any>(liked ? redHeart : grayHeart);
    const [isLiked, setIsLiked] = useState<boolean>(liked);

    const [curRetweets, setRetweets] = useState<number>(retweets);
    const [retColor, setRetColor] = useState<any>(retweeted ? greenRetweet : retweetPic);
    const [isRetweeted, setIsRetweeted] = useState<boolean>(retweeted);
    function timeAgo(dateString: string) {
        const now = new Date();
        const inputDate = new Date(dateString);

        // Ensure the input date is valid
        if (isNaN(inputDate.getTime())) {
            return "Invalid date";
        }

        // Calculate the timezone offset difference between the user's timezone and UTC
        const localOffset = now.getTimezoneOffset() * 60 * 1000; // in milliseconds
        const adjustedInputDate = new Date(inputDate.getTime() - localOffset);

        const timeString = adjustedInputDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        const retdateString = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(adjustedInputDate);

        return `${timeString} · ${retdateString}`;

    }

    time = timeAgo(time);

    const handleRedirect = () => {
        window.location.href = `/${username}`;
    }

    const changeHeart = () => {
        const nextIsLiked = !isLiked;
        setHeart(heart == grayHeart ? redHeart : grayHeart)
        setIsLiked(!isLiked)
        setLikes(li => nextIsLiked ? Number(li) + 1 : Number(li) - 1)
    }

    const changeRetweet = () => {
        const nextRetweet = !isRetweeted;
        setRetColor(retColor == retweetPic ? greenRetweet : retweetPic)
        setIsRetweeted(!isRetweeted)
        setRetweets(retwts => nextRetweet ? Number(retwts) + 1 : Number(retwts) - 1)
    }

    return (
        <>
            <div className={styles.Overall} style={{ overflowY: "scroll", msOverflowStyle: "none", scrollbarWidth: "none" }}>
                <div className={styles.BigContainer}>
                    {retweeter && <div style={{ display: "flex", alignItems: "center", width: "100%" }} >
                        <div className={styles.retweetFiller}>
                        </div>
                        <Image src={retweetPic} alt="click to goto retweeter profile" height={14} width={14}></Image>
                        <p className={styles.ExtraSpan} style={{ font: "0.7rem", marginTop: "5px", cursor: "pointer" }} onClick={() => {
                            window.location.href = `/${retweeter}`;
                        }} >{retweeter} retweeted</p>
                    </div>}
                    <div className={styles.TweetContainer}>
                        <div className={styles.ContentContainer}>
                            <div className={styles.InnerContentContainer}>

                                <div className={styles.ProfileInfo}>
                                    <div className={styles.LeftProfileInfo}>
                                        <Image onClick={() => { handleRedirect() }} src={profileUrl || profile || sasuke} height={40} width={40} alt="profile picture from tweet" style={{ cursor: "pointer" }}></Image>

                                        <div onClick={() => { handleRedirect() }} style={{ cursor: "pointer" }}>

                                            <p className={styles.Name}>{name}</p><p className={styles.UserName}>@{username}</p>
                                        </div>
                                    </div>

                                    <div className={styles.Options}>
                                        <Image src={threeDots} height={19} width={19} alt="Tweet Options"></Image>
                                    </div>
                                </div>
                                <div className={styles.ContentText}>
                                    {content}
                                </div>
                                {mediaUrls && <Media media={mediaUrls}></Media>}
                                <p className={styles.Time}>{time}</p>
                            </div>
                            <div className={styles.FooterContainer}>
                                <div className={styles.CRHS}>
                                    <div className={styles.ImageContainer}>
                                        <Image src={commentPic} height={23} width={23} alt="open comments and comment"></Image> <span>{comments}</span>
                                    </div>
                                    <div className={styles.ImageContainer} onClick={async () => {
                                        changeRetweet()
                                        const result = retweet(id)
                                        if (!result) {
                                            changeRetweet()
                                        }
                                    }}>
                                        <Image src={retColor} height={23} width={23} alt="Retweet"></Image> <span style={{ color: isRetweeted ? "#90EE90" : "rgb(113, 118, 123)" }}>{curRetweets}</span>
                                    </div>
                                    <div className={styles.ImageContainer} onClick={async () => {
                                        changeHeart()
                                        const result = await addLike(id)
                                        if (!result) {
                                            changeHeart()
                                        }

                                    }}>
                                        <Image src={heart} height={23} width={23} alt="Like the tweet"></Image> <span style={{ color: isLiked ? "#FF69B4" : "rgb(113, 118, 123)" }}>{curLikes}</span>
                                    </div>
                                    <div className={styles.ImageContainer}>
                                        <Image src={bookmark} height={23} width={23} alt="Save"></Image>
                                    </div>
                                    <div className={styles.ImageContainer}>
                                        <Image src={upload} height={23} width={23} alt="Share"></Image>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <CommentFeed parentId={id} user={username} ></CommentFeed>
            </div>
        </>)
}