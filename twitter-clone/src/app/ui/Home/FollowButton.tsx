'use client'
type FollowButtonProps = {
    username: string,
    curFollow?: boolean
} & React.ComponentPropsWithoutRef<'button'>
import { useState, useEffect } from "react"
export default function FollowButton({ username, className, curFollow }: FollowButtonProps) {
    const [following, setFollow] = useState(false);
    username = decodeURIComponent(username);
    const [pending, setPending] = useState(false);
    useEffect(() => {
        if (curFollow) {
            setFollow(true);
        }
    }, [])
    return (<button className={className ? className : ""} disabled={pending} onClick={() => {
        setPending(true);
        fetch(`/api/userInteractions?username=${username}`).then(response => {
            if (!response.ok) {
                throw new Error("Failed to follow")
            }
            return response.json()
        }).then(data => {
            console.log(data.result)
            if (data.result == "Followed") {
                setFollow(true);
            } else {
                setFollow(false)
            }
        }
        ).finally(() => {
            setPending(false)
        }
        )
    }}>{following ? "Following" : "Follow"}</button>)
}