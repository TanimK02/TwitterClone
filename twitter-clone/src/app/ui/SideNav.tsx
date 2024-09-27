
import Link from 'next/link';
import NavLinks from './NavLinks';
import '@/app/ui/SideNav.css'
import Image from 'next/image';
import plus from '@/public/plus.svg'

export default function SideNav() {


    return (
        <nav className='sideNav-div'>
            <div className='nav-list'>
                <Link href='/' className='logo'>
                <h1>X</h1>
                </Link>
                <NavLinks></NavLinks>
                <button><p>Post</p><Image src={plus} alt="post tweet" height={30} width={30}></Image></button>
            </div>
        </nav>
    )
}