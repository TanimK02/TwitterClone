"use client"

import styles from "@/app/ui/Feed/TweetItem.module.css"
import Image from "next/image"
import sasuke from "@/public/sasuke.webp"
import profile from "@/public/profile.svg"
import threeDots from "@/public/three-dots.svg"
import commentPic from "@/public/comment.svg"
import retweetPic from "@/public/retweet.svg"
import grayHeart from "@/public/heart.svg"
import redHeart from "@/public/redHeart.svg"
import stats from "@/public/statsPic.svg"
import bookmark from "@/public/bookmark.svg"
import upload from "@/public/upload.svg"
import Media from "@/app/ui/Feed/Media"
import greenRetweet from "@/public/retweeted.svg"
import { addLike, retweet } from "@/app/lib/TweetActions/actions"
import { useState } from "react"

type MediaInfo = {
    id: string;
    url: string;
    type: string;
};

export default function TweetItem({ name = "Billy", username = "Bob James", time = "2024-10-30T12:34:56.123Z", content = "Hello new tweet", mediaUrls, profileUrl = "", likes = 0, id, liked = false, retweets = 0,
    retweeted = false, retweeter = "", replyingTo, comments
}:
    {
        name: string, username: string, time: string, content: string, mediaUrls?: MediaInfo[], profileUrl: string, likes: number, id: string, liked?: boolean, retweets: number, retweeted: boolean, retweeter: null | string, replyingTo: null | string,
        comments: number;
    }
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

        // Calculate the difference in milliseconds between local 'now' and adjusted input date
        const diffMs = now.getTime() - adjustedInputDate.getTime();

        // Convert milliseconds to seconds, minutes, and hours
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);

        if (diffSeconds < 60) {
            return `${diffSeconds}s`;
        } else if (diffMinutes < 60) {
            return `${diffMinutes}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else {
            // Format the date for anything more than a day
            const options: Intl.DateTimeFormatOptions = {
                month: 'short',
                day: 'numeric',
            };

            if (adjustedInputDate.getFullYear() !== now.getFullYear()) {
                options.year = 'numeric';
            }

            return new Intl.DateTimeFormat('en-US', options).format(adjustedInputDate);
        }
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
            <div className={styles.BigContainer} onClick={() => {
                window.location.href = `http://localhost:3000/${username}/tweet/${id}`
            }} style={{ cursor: "pointer" }}>
                {retweeter && <div style={{ display: "flex", alignItems: "center", width: "100%" }} >
                    <div className={styles.retweetFiller}>
                    </div>
                    <Image src={retweetPic} alt="click to goto retweeter profile" height={14} width={14}></Image>
                    <p className={styles.ExtraSpan} style={{ font: "0.7rem", marginTop: "5px", cursor: "pointer" }} onClick={() => {
                        window.location.href = `/${retweeter}`;
                    }} >{retweeter} retweeted</p>
                </div>}
                <div className={styles.TweetContainer}>
                    <div className={styles.Profile}>
                        <Image onClick={(event) => {
                            event.stopPropagation()
                            handleRedirect()
                        }} src={profileUrl || profile || sasuke} height={40} width={40} alt="profile picture from tweet" style={{ cursor: "pointer" }}></Image>
                    </div>
                    <div className={styles.ContentContainer}>
                        <div>

                            <div className={styles.ProfileInfo}>

                                <div className={styles.ProfileNames} onClick={(event) => {
                                    event.stopPropagation()
                                    handleRedirect()
                                }} style={{ cursor: "pointer" }}>

                                    <p className={styles.Name}>{name}</p><p className={styles.UserName}>@{username}</p><p className={styles.Point}>•</p><p className={styles.Time}>{time}</p>
                                </div>

                                <div className={styles.Options}>
                                    <Image src={threeDots} height={19} width={19} alt="Tweet Options"></Image>
                                </div>
                            </div>
                            <div className={styles.ContentText}>
                                {content}
                            </div>
                            {mediaUrls && <Media media={mediaUrls}></Media>}
                        </div>
                        <div className={styles.FooterContainer} onClick={async (event) => {
                            event.stopPropagation()
                        }} >
                            <div className={styles.CRHS}>
                                <div className={styles.ImageContainer} onClick={() => {
                                    window.location.href = `/${username}/tweet/${id}`
                                }} >
                                    <Image src={commentPic} height={20} width={20} alt="open comments and comment"></Image> <span>{comments}</span>
                                </div>
                                <div className={styles.ImageContainer} onClick={async (event) => {
                                    event.stopPropagation()
                                    changeRetweet()
                                    const result = await retweet(id)
                                    if (!result) {
                                        changeRetweet()
                                    }
                                }}>
                                    <Image src={retColor} height={20} width={20} alt="Retweet"></Image> <span style={{ color: isRetweeted ? "#90EE90" : "rgb(113, 118, 123)" }}>{curRetweets}</span>
                                </div>
                                <div className={styles.ImageContainer} onClick={async (event) => {
                                    event.stopPropagation()
                                    changeHeart()
                                    const result = await addLike(id)
                                    if (!result) {
                                        changeHeart()
                                    }

                                }}>
                                    <Image src={heart} height={20} width={20} alt="Like the tweet"></Image> <span style={{ color: isLiked ? "#FF69B4" : "rgb(113, 118, 123)" }}>{curLikes}</span>
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
            </div>
        </>)
}