'use client'

import { useState } from 'react'
import EmailPass from '@/app/ui/SignUp/EmailPass'

export default function SignUpButtons() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <>
            <button type="submit" onClick={() => setIsOpen(!isOpen)}>Create Account</button>
            {isOpen && <EmailPass isOpen={isOpen} setIsOpen={setIsOpen}></EmailPass>}
        </>
    )
}