import '@/app/(overview)/Home/home.css'
import searchPic from '@/public/search.svg'
import Image from 'next/image'
import Link from 'next/link'
import profile from '@/public/profile.svg'
import { pullUsers } from '@/app/lib/actions'
import FollowButton from './FollowButton'
type returnUsers = {
    cover_image_url: string | null,
    username: string,
    name: string
}

export default async function SearchFollow() {
    const results: returnUsers[] = await pullUsers() as returnUsers[];
    const links = []
    for (let i = 0; i < results.length; i++) {
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
                <div className='follow-list'>

                    {[...links]}

                </div>
            </div>
        </div>
    )
}