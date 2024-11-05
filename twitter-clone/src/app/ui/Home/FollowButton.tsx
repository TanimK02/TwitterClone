'use client'

import { useState } from "react"

export default function FollowButton({ username }: { username: string }) {
    const [following, setFollow] = useState(false);
    username = decodeURIComponent(username);
    return (<button disabled={following} onClick={() => {
        fetch(`/api/userInteractions?username=${username}`).then(response => {
            if (!response.ok) {
                throw new Error("Failed to follow")
            }
            return response.json()
        }).then(data => {
            console.log(data.result)
            if (data.result == "Success") {
                setFollow(true);
            }
        }
        )
    }}>{following ? "Following" : "Follow"}</button>)
}