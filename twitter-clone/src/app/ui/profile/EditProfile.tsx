"use client"
import styles from "@/app/ui/profile/EditProfile.module.css"
import { useState } from "react"
import logo from "@/public/logo.svg"
import StepOneForm from "@/app/ui/profile/EditProfileSteps/StepOneForm"
import StepTwoForm from "@/app/ui/profile/EditProfileSteps/StepTwoForm"
import StepThreeForm from "@/app/ui/profile/EditProfileSteps/StepThreeForm"
type EditProfileButton = {
    first?: boolean,
} & React.ComponentPropsWithoutRef<'button'>

export default function EditProfile({ first = false, className }: EditProfileButton) {
    const [editing, setEditing] = useState(false);
    const [step, updateStep] = useState(1);
    const [picture, setPicture] = useState<File | undefined>(undefined);
    const [bio, setBio] = useState<string>("");

    async function calculateFileSHA256(file: File): Promise<string> {
        return file.arrayBuffer().then(arrayBuffer =>
            crypto.subtle.digest('SHA-256', arrayBuffer)
        ).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        });
    }

    const submitPicBio = async () => {
        if (picture) {

            const checksum = await calculateFileSHA256(picture);
            let response = await fetch("/api/userEdits/UploadPhoto",
                {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: picture.type,
                        size: picture.size,
                        checksum: checksum
                    })
                }
            )
            if (!response.ok) {
                throw new Error("Couldn't get url for picture upload.")
            }
            let result = await response.json();
            const url = result.result.url;
            await fetch(url, {
                method: "PUT",
                body: picture,
                headers: {
                    "Content-Type": picture.type
                }
            });
            response = await fetch("/api/userEdits/UploadPhoto",
                {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        mediaUrl: result.result.url
                    })
                }
            )
            if (!response.ok) {
                throw new Error("Couldn't .")
            }
            location.reload();


        }
        updateStep(1)
        setEditing(false)
        setPicture(undefined)
    }

    return (<>

        <button className={className} onClick={() => setEditing(true)}>{first ? "Setup Profile" : "Edit Profile"}</button>
        {
            editing &&
            <div className={styles.Container}>
                <div className={styles.EditProfileDiv}>
                    <div className={styles.logoDiv}>
                        {step < 3 && <img className={styles.logo} alt="logo" src={logo.src}></img>}
                    </div>
                    {step == 1 && <StepOneForm picture={picture} setPicture={setPicture} step={step} updateStep={updateStep}></StepOneForm>}
                    {step == 2 && <StepTwoForm bio={bio} setBio={setBio} step={step} updateStep={updateStep}></StepTwoForm>}
                    {step == 3 && <StepThreeForm callback={submitPicBio}></StepThreeForm>}
                </div>

            </div>
        }

    </>)
}