'use client'
import backArrow from "@/public/back-arrow.svg"
import Link from "next/link"
import Image from "next/image"

export default function GoBack() {
    let prev = "/Home";

    if (typeof window !== "undefined" && window.sessionStorage) {
        prev = sessionStorage.getItem('prevPath') || "/Home";
    }

    return (
        <Link href={prev}><Image src={backArrow} height={15} width={15} style={{ filter: "invert(100%)" }} alt="back-button"></Image></Link>
    )
}
