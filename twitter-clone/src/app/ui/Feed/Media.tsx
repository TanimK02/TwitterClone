'use client'

import styles from "@/app/ui/Feed/Feed.module.css"
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import play from "@/public/play.svg"
import Image from "next/image";
type MediaInfo = {
    id: string;
    url: string;
    type: string;
};

export default function Media({ media }: { media?: MediaInfo[] }) {
    if (!media) { return (<></>) }
    const [open, setOpen] = useState(false);

    return (<>
        <div className={styles.MediaContainer}>
            <div className={styles.Thumbnail} onClick={() => { setOpen(true) }}>
                {media[0].type.startsWith("image") &&
                    <img src={media[0].url} alt={`Images and videos. ${media.length > 1 ? "Click to see them." : ""}`}></img>}
                {media[0].type.startsWith("video") &&
                    <div className={styles.ThumbnailDiv} style={{ position: "relative" }}>
                        <video src={media[0].url} style={{
                            pointerEvents: "none",
                        }}></video>
                        <Image src={play} height={25} width={25} style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "10%",
                            height: "10%",
                            border: "none",
                            borderRadius: "0",
                            filter: "invert(100%)"
                        }} alt="" />
                    </div>}
            </div>
            <Lightbox plugins={[Video]} open={open} close={() => { setOpen(false) }} slides={media.map((mediaObs) => { return (mediaObs.type.startsWith("image") ? { src: mediaObs.url } : { type: "video", sources: [{ src: mediaObs.url, type: mediaObs.type }] }) })}></Lightbox>
        </div>
    </>)
}