
import Link from 'next/link';
import NavLinks from './NavLinks';
import '@/app/ui/Home/SideNav.css'
import Image from 'next/image';
import plus from '@/public/plus.svg'
import logo from '@/public/logo.svg'

export default function SideNav() {


    return (
        <nav className='sideNav-div'>
            <div className='nav-list'>
                <Link href='/Home' className='logo'>
                <Image src={logo} alt="home/logo button" height={33} width={33}></Image>
                </Link>
                <NavLinks></NavLinks>
                <button><p>Post</p><Image src={plus} alt="post tweet" height={30} width={30}></Image></button>
            </div>
        </nav>
    )
}