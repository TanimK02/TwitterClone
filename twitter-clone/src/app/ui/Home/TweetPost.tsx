'use client'

import styles from '@/app/ui/Home/TweetPost.module.css'
import profile from '@/public/profile.svg'
import Image from 'next/image'
import gif from '@/public/gif.svg'
import imagePic from '@/public/image.svg'
import { useRef } from 'react'
export default function TweetPost() {
    const imgInput = useRef<HTMLInputElement | null>(null);

    function handleImageButton() {
        if (imgInput.current) {
            imgInput.current.click();
            console.log("clicked")
        }
    }
    return (
        <>
            <div className={styles.tweetPostContainer}>
                <div className={styles.profileContainer}>
                    <Image src={profile} height={30} width={30} alt='Profile picture in tweet box' style={{ filter: "invert(100%)", aspectRatio: "40 : 40" }}></Image>
                </div>
                <form className={styles.tweetContainer}>
                    <div className={styles.inputContainer}>
                        <textarea placeholder='Whats is happening?!'></textarea>
                    </div>
                    <div className={styles.xtrasSubmitContainer}>
                        <div className={styles.buttonContainer}>
                            <Image src={imagePic} height={20} width={20} alt="add image" onClick={handleImageButton}></Image>
                            <input ref={imgInput} type='file' hidden accept="image/*, video/*"></input>
                            <Image src={gif} height={20} width={20} alt="add gif"></Image>
                        </div>
                        <input type='submit' value="Post"></input>
                    </div>
                </form>
            </div>
        </>
    )
}