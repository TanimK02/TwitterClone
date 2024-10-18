
import Link from 'next/link';
import homePic from '@/public/home.svg'
import searchPic from '@/public/search.svg'
import messagePic from '@/public/messages.svg'
import communityPic from '@/public/communities.svg'
import profilePic from '@/public/profile.svg'
import Image from 'next/image';

export default function NavLinks() {

    return (
        <>
            <Link href='/Home'>
                <Image src={homePic} alt="Home Button" width={33} height={33} />
                <label>Home</label>
            </Link>
            <Link href='/'>
                <Image src={searchPic} alt="Explore Button" width={33} height={33} />
                <label>Explore</label>
            </Link>
            <Link href='/'>
                <Image src={messagePic} alt="Messages Button" width={33} height={33} />
                <label>Messages</label>
            </Link>
            <Link href='/'>
                <Image src={communityPic} alt="Communities Button" width={33} height={33} />
                <label>Communities</label>
            </Link>
            <Link href='/profile'>
                <Image src={profilePic} alt="Profile Button" width={33} height={33} />
                <label>Profile</label>
            </Link>
        </>
    )
}