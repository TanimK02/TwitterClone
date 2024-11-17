"use client"

import styles from "@/app/ui/profile/EditProfile.module.css"
import logo from "@/public/logo.svg"
export default function StepThreeForm({ callback }: { callback: () => {} }) {
    return (<>
        <div className={styles.FormDiv} style={{ alignItems: "center" }}>
            <div className={styles.TopDiv} style={{ width: "fit-content", height: "50%" }}>

                <div className={styles.Information} style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around", width: "100%" }}>
                    <img src={logo.src} style={{ height: "7vh" }}></img>
                    <h1 className={styles.FormH1}>Click to save updates</h1>
                    <button onClick={() => callback()} className={styles.FinalButton}>Save</button>
                </div>
            </div>
        </div>

    </>)
}