'use client'
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import '@/app/ui/Home/NavTop.css'

export default function TopNav() {
    const spanRef = useRef(null);
    const [lineWidth, setWidth] = useState(0);
    const spanRef2 = useRef(null);
    const [lineWidth2, setWidth2] = useState(0);
    useEffect((() => {
        if (spanRef.current) {
            setWidth(spanRef.current.offsetWidth);
        }
        if (spanRef2.current) {
            setWidth2(spanRef2.current.offsetWidth);
        }
    }), []);

    const firstLine = useRef(null);
    const secondLine = useRef(null);

    const change1 = () => {
        firstLine.current.hidden = false;
        secondLine.current.hidden = true;
    }

    const change2 = () => {
        firstLine.current.hidden = true;
        secondLine.current.hidden = false;
    }

    return (
        <>
            <nav className='topNav-div'>
                <div className="tabs">
                    <div className="for-you">
                        <Link href="/" onClick={change1}>
                            <span ref={spanRef}>For You</span>
                        </Link>
                        <div ref={firstLine} className="blue-line" style={{ width: `${lineWidth}px` }}></div>
                    </div>
                    <div className="following">
                        <Link href="/" onClick={change2}>
                            <span ref={spanRef2}>Following</span>
                        </Link>
                        <div ref={secondLine} className="blue-line" style={{ width: `${lineWidth2}px` }} hidden={true}></div>
                    </div>
                </div>
            </nav>
        </>
    )
}