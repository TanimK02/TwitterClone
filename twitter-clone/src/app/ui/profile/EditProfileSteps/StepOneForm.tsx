"use client"

import styles from "@/app/ui/profile/EditProfile.module.css"
import profile from "@/public/profile.svg"
import camera from "@/public/camera.svg"
import { useRef, useState } from "react"
export default function StepOneForm({ step, updateStep, picture, setPicture }: { step: number, updateStep: React.Dispatch<React.SetStateAction<number>>, picture: File | undefined, setPicture: React.Dispatch<React.SetStateAction<File | undefined>> }) {
    const imgInput = useRef<HTMLInputElement | null>(null);
    const profileImage = useRef<HTMLImageElement | null>(null);
    const imgClick = () => {
        imgInput.current?.click();
    }

    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            const file = Array.from(input.files)[0]
            if (file.type.startsWith("image/")) {
                setPicture(file)
                if (picture && profileImage.current) {
                    profileImage.current.src = URL.createObjectURL(picture) || profile.src;
                }
            }
        }

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
                        <img ref={profileImage} className={styles.ProfileImage} src={picture ? URL.createObjectURL(picture) : profile.src}></img>
                        <div className={styles.CameraContainer}>
                            <img className={styles.Camera} src={camera.src}></img>
                        </div>
                    </div>
                </div>
                <input ref={imgInput} onChange={onImageChange} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }}></input>
            </div>

        </div>
        <div className={styles.NextButtonDiv}>
            <button onClick={() => updateStep(step + 1)} className={styles.NextButton}>{picture ? "Next" : "Skip For Now"}</button>
        </div>
    </>)
}