
import Link from 'next/link';
import NavLinks from '@/app/ui/Home/NavLinks';
import '@/app/ui/Home/SideNav.css'
import Image from 'next/image';
import plus from '@/public/plus.svg'
import logo from '@/public/logo.svg'
import { auth } from '@/auth';

export default async function SideNav() {

    const session = await auth();
    return (
        <nav className='sideNav-div'>
            <div className='nav-list'>
                <Link href='/Home' className='logo'>
                    <Image src={logo} alt="home/logo button" height={23} width={24}></Image>
                </Link>
                <NavLinks username={session?.user?.username || "/Home"}></NavLinks>
                <button><p>Post</p><Image src={plus} alt="post tweet" height={30} width={30}></Image></button>
            </div>
        </nav>
    )
}