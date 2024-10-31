
import Link from 'next/link';
import NavLinks from '@/app/ui/Home/NavLinks';
import '@/app/ui/Home/SideNav.css'
import Image from 'next/image';
import plus from '@/public/plus.svg'
import logo from '@/public/logo.svg'
import { auth } from '@/auth';
import { getUserById } from '@/app/lib/actions';

export default async function SideNav() {

    const session = await auth();
    let username: string | null = null;
    if (session?.user?.id) {
        const user = await getUserById(session?.user?.id);
        username = user.username
    }
    return (
        <nav className='sideNav-div'>
            <div className='nav-list'>
                <Link href='/Home' className='logo'>
                    <Image src={logo} alt="home/logo button" height={23} width={24}></Image>
                </Link>
                <NavLinks username={username || "/Home"}></NavLinks>
                <button><p>Post</p><Image src={plus} alt="post tweet" height={30} width={30}></Image></button>
            </div>
        </nav>
    )
}