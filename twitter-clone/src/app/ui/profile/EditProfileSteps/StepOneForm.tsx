"use client"

import styles from "@/app/ui/profile/EditProfile.module.css"
import profile from "@/public/profile.svg"
import camera from "@/public/camera.svg"
import { useRef, useState } from "react"
export default function StepOneForm() {
    const imgInput = useRef<HTMLInputElement | null>(null);
    const [picture, setPicture] = useState<string | null>(null);

    const imgClick = () => {
        imgInput.current?.click();
    }
    return (<>
        <div className={styles.FormDiv}>
            <div className={styles.TopDiv}>
                <div className={styles.Information}>
                    <h1 className={styles.FormH1}>Pick a profile picture</h1>
                    <p>Have a favorite selfie? Upload it now.</p>
                </div>
            </div>
            <div className={styles.InputDiv}>
                <div onClick={imgClick} className={styles.ImageContainer}>
                    <div style={{ top: "0", left: "0", backgroundColor: "rgba(91, 112, 131, 0.4)", width: "100%", height: "100%" }}>
                        <img className={styles.ProfileImage} src={profile.src}></img>
                        <div className={styles.CameraContainer}>
                            <img className={styles.Camera} src={camera.src}></img>
                        </div>
                    </div>
                </div>
                <input ref={imgInput} type="file" style={{ display: "none" }}></input>
            </div>

        </div>
        <div className={styles.NextButtonDiv}>
            <button className={styles.NextButton}>Next</button>
        </div>
    </>)
}