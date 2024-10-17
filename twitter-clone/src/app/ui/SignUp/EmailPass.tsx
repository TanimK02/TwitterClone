'use client'

import '@/app/ui/SignUp/EmailPass.css'
import { createUserEP, CreateUserState } from '@/app/lib/actions'
import Image from 'next/image';
import close from '@/public/close.svg'
import logo from '@/public/logo.svg'
import { useFormState, useFormStatus } from 'react-dom';
import { Dispatch, SetStateAction } from 'react';

export default function EmailPass({ isOpen, setIsOpen }: {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const initialState: CreateUserState = { message: null, errors: {} };
    const [state, formAction] = useFormState(createUserEP, initialState);
    const { pending } = useFormStatus();

    const handleInputClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const labelElement = (e.currentTarget as HTMLDivElement).querySelector('label');
        if (labelElement) {
            labelElement.style.display = 'none';
        }

        const inputElement = (e.currentTarget as HTMLDivElement).querySelector('input');
        if (inputElement) {
            inputElement.style.display = 'block';
            inputElement.focus();
            e.currentTarget.style.border = "3px solid rgb(29, 155, 240)";
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parent = e.currentTarget.parentElement;
        if (parent) {
            parent.style.border = "1px solid rgba(255, 255, 255, 0.23)";
            const labelElement = (parent as HTMLDivElement).querySelector('label');
            if (labelElement && e.currentTarget.value == "") {
                labelElement.style.display = 'block';
                e.currentTarget.style.display = "none";
            }

        }
    };

    const handleError = (e: HTMLDivElement) => {
        console.log(e);
        e.style.border = "3px solid red";


    };

    return (

        <div className="emailPass-container">
            <div className='form-container'>
                <div className='logoClose-Container'>
                    <div className='close'>
                        <Image onClick={() => { setIsOpen(!isOpen) }} src={close} height={20} width={20} alt='close button'></Image>
                    </div>
                    <Image className='form-logo' src={logo} height={30} width={30} alt='form-container-x-logo'></Image>
                    <div className='close-filler'></div>
                </div>
                <form action={formAction}>
                    <div className='form-div'>
                        <div className='form-h1'>Create your account</div>
                        <div>
                            <div className='formInputs' onClick={handleInputClick}>
                                <label>Name</label>
                                <input type="text" id="name" name='name' style={{ display: 'none' }} onBlur={handleInputBlur}></input>
                            </div>
                            {
                                state.errors?.name &&
                                state.errors?.name.map((error: string) => (
                                    <label className='error'>
                                        {error}
                                    </label>
                                ))
                            }
                        </div>
                        <div>
                            <div className='formInputs' onClick={handleInputClick}>

                                <label>Email</label>
                                <input type="email" id="email" name='email' style={{ display: 'none' }} onBlur={handleInputBlur}></input>

                            </div>
                            {state.errors?.email &&
                                state.errors?.email.map((error: string) => (
                                    <label className='error'>
                                        {error}
                                    </label>
                                ))
                            }
                        </div>
                        <div>
                            <div className='formInputs' onClick={handleInputClick}>

                                <label>Password</label>
                                <input type="text" id="password" name='password' style={{ display: 'none' }} onBlur={handleInputBlur}></input>

                            </div>
                            {state.errors?.password &&
                                state.errors?.password.map((error: string) => (
                                    <label className='error'>
                                        {error}
                                    </label>
                                ))
                            }
                        </div>
                    </div>
                    <div className='submit-container'>
                        <input disabled={pending} type="submit" value="Next"></input>
                    </div>

                </form>
            </div>
        </div>

    )
}

