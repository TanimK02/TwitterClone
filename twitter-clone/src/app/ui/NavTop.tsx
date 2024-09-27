import Link from "next/link"
import '@/app/ui/NavTop.css'
export default function TopNav() {


    return (
        <>
        <nav className='topNav-div'>
            <div className="tabs">
                <div className="for-you">
                <Link href="/"><span>For You</span></Link>
                </div>
                <div className="following">
                <Link href="/"><span>Following</span></Link>
                </div>
            </div>
        </nav>
        </>
    )
}