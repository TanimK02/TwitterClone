'use client'

import { useState } from "react"
export default function FollowButton({ username }: { username: string }) {
    const [following, setFollow] = useState(false);
    username = decodeURIComponent(username);
    const [pending, setPending] = useState(false);
    return (<button disabled={pending} onClick={() => {
        setPending(true);
        fetch(`/api/userInteractions?username=${username}`).then(response => {
            if (!response.ok) {
                throw new Error("Failed to follow")
            }
            return response.json()
        }).then(data => {
            console.log(data.result)
            if (data.result == "Success") {
                setFollow(!following);
            }
        }
        ).finally(() => {
            setPending(false)
        }
        )
    }}>{following ? "Following" : "Follow"}</button>)
}