"use client"

import '@/app/(overview)/Home/home.css'
import searchPic from '@/public/search.svg'
import Image from 'next/image'
import Link from 'next/link'
import profile from '@/public/profile.svg'
import FollowButton from '@/app/ui/Home/FollowButton'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
type returnUsers = {
    cover_image_url: string | null,
    username: string,
    name: string
}

export default function SearchFollow() {
    const [results, updateResults] = useState<returnUsers[]>([])
    const pathname = usePathname();
    useEffect(() => {
        fetch(`/api/userPull`).then(
            response => {
                if (!response.ok) {
                    throw new Error("Failed to pull users")
                }

                return response.json()
            }
        ).then(data => {

            updateResults(data.result);
        })

    }, [pathname])

    const links = []

    for (let i = 0; i < results.length; i++) {
        if (pathname.includes(encodeURIComponent(results[i].username))) {
            continue
        }
        links.push(

            <div className='info' key={i}>
                <Link href={`/${results[i].username}`} >
                    <Image src={results[i].cover_image_url || profile} alt="profile image" height={30} width={30}></Image>
                    <div className='name-link'>
                        <h4>{results[i].name}</h4>
                        <p>@{results[i].username}</p>
                    </div>
                </Link>
                <FollowButton username={results[i].username}></FollowButton>
            </div>
        )
    }
    return (
        <div className="search-follow">
            <div className='search-container'>
                <div className='search-div'>
                    <Image src={searchPic} alt="search-input-pic" width={20} height={20}></Image>
                    <input type='text' placeholder='Search'></input>
                </div>
            </div>
            <div className='follow-container'>
                <h1>Who to follow</h1>
                <div className='follow-list' key={pathname}>

                    {[...links]}

                </div>
            </div>
        </div>
    )
}