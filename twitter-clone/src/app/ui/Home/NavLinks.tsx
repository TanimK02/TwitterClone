'use client'
import Link from 'next/link';
import homePic from '@/public/home.svg'
import searchPic from '@/public/search.svg'
import messagePic from '@/public/messages.svg'
import communityPic from '@/public/communities.svg'
import profilePic from '@/public/profile.svg'
import Image from 'next/image';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function NavLinks({ username = "/Home" }: { username?: string }) {
    const router = usePathname();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('prevPath', router);
        }
    }, [router]);

    return (
        <>
            <Link href='/Home'>
                <Image src={homePic} alt="Home Button" width={23} height={24} />
                <label>Home</label>
            </Link>
            <Link href='/'>
                <Image src={searchPic} alt="Explore Button" width={23} height={24} />
                <label>Explore</label>
            </Link>
            <Link href='/'>
                <Image src={messagePic} alt="Messages Button" width={23} height={24} />
                <label>Messages</label>
            </Link>
            <Link href='/' >
                <Image src={communityPic} alt="Communities Button" width={23} height={24} />
                <label>Communities</label>
            </Link>
            <Link href={username} >
                <Image src={profilePic} alt="Profile Button" width={23} height={24} />
                <label>Profile</label>
            </Link>
        </>
    )
}