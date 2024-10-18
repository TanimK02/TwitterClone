import '@/app/(overview)/Home/home.css'
import searchPic from '@/public/search.svg'
import Image from 'next/image'
import Link from 'next/link'
import profile from '@/public/profile.svg'
export default function SearchFollow() {

    const links = []
    for (let i = 0; i < 30; i++) {
        links.push(
            <Link href="" key={i}>
                <div className='info'>
                    <Image src={profile} alt="profile image" height={30} width={30}></Image>
                    <div className='name-link'>
                        <h4>Outdoor Channel</h4>
                        <p>@OUTDChannel</p>
                    </div>
                </div>
                <button>Follow</button>
            </Link>)
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