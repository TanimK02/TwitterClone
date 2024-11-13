"use client"
import styles from "@/app/ui/profile/EditProfile.module.css"
import { useState } from "react"
import logo from "@/public/logo.svg"
import StepOneForm from "./EditProfileSteps/StepOneForm"
import StepTwoForm from "./EditProfileSteps/StepTwoForm"
type EditProfileButton = {
    first?: boolean,
} & React.ComponentPropsWithoutRef<'button'>

export default function EditProfile({ first = false, className }: EditProfileButton) {
    const [editing, setEditing] = useState(false);
    const [step, updateStep] = useState(1);
    const [picture, setPicture] = useState<string>("");
    const [bio, setBio] = useState<string>("");

    return (<>

        <button className={className} onClick={() => setEditing(true)}>{first ? "Setup Profile" : "Edit Profile"}</button>
        {
            editing &&
            <div className={styles.Container}>
                <div className={styles.EditProfileDiv}>
                    <div className={styles.logoDiv}>
                        <img className={styles.logo} alt="logo" src={logo.src}></img>
                    </div>
                    {step == 1 && <StepOneForm picture={picture} setPicture={setPicture} step={step} updateStep={updateStep}></StepOneForm>}
                    {step == 2 && <StepTwoForm bio={bio} setBio={setBio} step={step} updateStep={updateStep}></StepTwoForm>}

                </div>
            </div>
        }

    </>)
}