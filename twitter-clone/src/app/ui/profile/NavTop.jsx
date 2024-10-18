import backArrow from "@/public/back-arrow.svg"
import Link from "next/link"
import Image from "next/image"


export default function TopNav() {

    return (
        <>
            <nav className='topNav-div'>
                <Link><Image></Image></Link>
            </nav>
        </>
    )
}