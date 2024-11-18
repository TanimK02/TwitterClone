'use client'

import styles from '@/app/ui/Home/TweetPost.module.css'
import profile from '@/public/profile.svg'
import Image from 'next/image'
import gif from '@/public/gif.svg'
import imagePic from '@/public/image.svg'
import { useEffect, useRef, useState } from 'react'
import close from '@/public/close.svg'
import { getSignedURL, createTweet } from '@/app/lib/TweetActions/actions'
import { getOwnProfile } from '@/app/lib/actions'

export default function TweetPost({ callback }: { callback: (erase?: boolean) => Promise<void> }) {

    const imgInput = useRef<HTMLInputElement | null>(null);
    const [images, setImages] = useState<{ file: File, previewUrl: string }[]>([]);
    const picVidDiv = useRef<HTMLDivElement | null>(null);
    const maxSizeInBytes = 10 * 1024 * 1024;
    const disabledButton = useRef<HTMLInputElement | null>(null)
    const text = useRef<HTMLTextAreaElement | null>(null);
    const handleImage = () => {
        imgInput.current?.click()
    }

    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            if (images.length >= 3) {
                alert("No more than 3 images")
                return
            }
            const files = Array.from(input.files);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > maxSizeInBytes) {
                    alert("File size must be less than 10 MB");
                    return;
                }
            }

            const validMediaFiles = files.filter((file) =>
                file.type.startsWith("image/") || file.type.startsWith("video/")
            );
            const newImages = validMediaFiles.map((file) => ({
                file,
                previewUrl: URL.createObjectURL(file),
            }));

            setImages((prevImages) => [...prevImages, ...newImages]);
        }
        console.log(input.files)
    }

    const deleteImage = (indexToDelete: Number) => {
        setImages(images.filter((_, index) => index !== indexToDelete));
        if (imgInput.current?.value) {
            imgInput.current.value = ""
        }  // Filter out the image at the specific index
    };

    async function calculateFileSHA256(file: File): Promise<string> {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (disabledButton.current) {
            disabledButton.current.disabled = true
        }
        const formData = new FormData(e.currentTarget);
        const mediaIds = [];
        const content = formData.get("content") as string;
        try {

            const files = Array.from(images);

            for (let i = 0; i < files.length; i++) {
                const data = files[i];
                const file = data.file;
                const checksum = await calculateFileSHA256(file);
                const signedUrl = await getSignedURL(file.type, file.size, checksum);
                console.log(signedUrl);

                if (signedUrl.failure !== undefined) {
                    alert("failed to post tweet");
                    throw new Error(signedUrl.failure);
                }

                const { url, mediaId } = signedUrl.success;
                await fetch(url, {
                    method: "PUT",
                    body: data.file,
                    headers: {
                        "Content-Type": data.file.type
                    }
                });
                mediaIds.push(mediaId)

            }
            await createTweet({ content, mediaIds })
            setImages([])
            if (text.current) {
                text.current.value = "";
            }
            callback();


        }
        catch (e) {
            alert("failed")
        }
        finally {
            if (disabledButton.current) {
                disabledButton.current.disabled = false
            }
        }
    };


    const [coverImage, updateImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoverImage = async () => {
            const imageUrl = await getOwnProfile();
            if (imageUrl.status == 200 && imageUrl.user?.coverImageUrl) {
                updateImage(imageUrl.user?.coverImageUrl);
            }
        };

        fetchCoverImage();
    }, []);
    return (
        <>
            <div className={styles.tweetPostContainer}>
                <div className={styles.profileContainer}>
                    <Image src={coverImage ? coverImage : profile.src} height={40} width={40} alt='Profile picture in tweet box' style={{ aspectRatio: "40 : 40" }}></Image>
                </div>
                <form className={styles.tweetContainer} onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                        <textarea ref={text} name="content" placeholder='What is happening?!' required></textarea>
                        <div ref={picVidDiv} className={styles.imageContainer}>
                            {
                                images.map((mediaData, index) => (
                                    <div className={styles.imageContainer2} key={index}>
                                        {mediaData.file.type.startsWith("video/") ? (
                                            <video
                                                src={mediaData.previewUrl}
                                                height={100}
                                                width={100}

                                            />
                                        ) : (
                                            <Image
                                                src={mediaData.previewUrl}
                                                alt={`image-${index}`}
                                                height={100}
                                                width={100}
                                            />
                                        )}
                                        <button
                                            type='button'
                                            style={{ backgroundColor: "transparent" }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                deleteImage(index);
                                            }}
                                        >
                                            <Image src={close} alt="close button on media" height={20} width={20} />
                                        </button>
                                    </div>
                                ))
                            }

                        </div>
                    </div>
                    <div className={styles.xtrasSubmitContainer}>
                        <div className={styles.buttonContainer}>
                            <Image src={imagePic} height={20} width={20} alt="add image" onClick={handleImage}></Image>
                            <input ref={imgInput} type='file' hidden accept=".jpeg, .jpg, .png, video/*" multiple onChange={(e) => { onImageChange(e) }}></input>
                            <Image src={gif} height={20} width={20} alt="add gif"></Image>
                        </div>
                        <input ref={disabledButton} type='submit' value="Post"></input>
                    </div>
                </form >
            </div >
        </>
    )
}