"use client"

import styles from "@/app/ui/profile/EditProfile.module.css"
import { useRef } from "react"
export default function StepTwoForm({ step, updateStep, bio, setBio }: { step: number, updateStep: React.Dispatch<React.SetStateAction<number>>, bio: string, setBio: React.Dispatch<React.SetStateAction<string>> }) {
    const textRef = useRef<HTMLTextAreaElement | null>(null);
    const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const input = event.target as HTMLTextAreaElement;
        setBio(input.value)
    }
    const EditLabel = useRef<HTMLLabelElement | null>(null);
    const EditSpan = useRef<HTMLSpanElement | null>(null);

    const handleFocus = () => {
        if (EditLabel.current) {
            EditLabel.current.style.borderColor = "#1DA1F2"
        }
        if (EditSpan.current) {
            EditSpan.current.style.color = "#1DA1F2"
        }
    }

    const handleOnBlur = () => {
        if (EditLabel.current) {
            EditLabel.current.style.borderColor = "rgba(255, 255, 255, 0.183)"
        }
        if (EditSpan.current) {
            EditSpan.current.style.color = "rgb(113, 118, 123)"
        }
    }
    return (<>
        <div className={styles.FormDiv}>
            <div className={styles.TopDiv}>
                <div className={styles.Information}>
                    <h1 className={styles.FormH1}>Describe yourself</h1>
                    <p>What makes you special? Don't think too hard, just have fun with it.</p>
                </div>
            </div>
            <div className={styles.InputDiv2}>
                <label ref={EditLabel} className={styles.BioEditLabel}>
                    <div className={styles.BioEditDiv}><span ref={EditSpan}>Your bio</span><div>{`${textRef.current?.value.length || 0}/160`}</div></div>
                    <textarea onBlur={() => handleOnBlur()} onFocus={() => handleFocus()} className={styles.BioEditTextArea} maxLength={160} ref={textRef} onChange={onTextChange}></textarea>
                </label>
            </div>

        </div>
        <div className={styles.NextButtonDiv}>
            <button onClick={() => updateStep(step + 1)} className={styles.NextButton}>{bio ? "Next" : "Skip For Now"}</button>
        </div>
    </>)
}