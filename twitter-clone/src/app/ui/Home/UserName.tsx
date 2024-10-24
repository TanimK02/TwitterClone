'use client'

import '@/app/ui/Home/UserName.css'
import { CreateUsernameState, changeUserName } from '@/app/lib/actions'
import Image from 'next/image';
import logo from '@/public/logo.svg'
import { useFormState, useFormStatus } from 'react-dom';
import { redirect } from 'next/navigation';

export default function UserName() {
    const initialState: CreateUsernameState = { message: null, errors: {} };
    const [state, formAction] = useFormState(changeUserName, initialState);
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
                    </div>
                    <Image className='form-logo' src={logo} height={30} width={30} alt='form-container-x-logo'></Image>
                    <div className='close-filler'></div>
                </div>
                <form action={formAction}>
                    <div className='form-div'>
                        <div className='form-h1'>Pick a username</div>
                        {state.message &&
                            <label className='error'>
                                {state.message}
                            </label>
                        }
                        <div>
                            <div className='formInputs' onClick={handleInputClick}>
                                <label>Username</label>
                                <input type="text" id="username" name='username' style={{ display: 'none' }} onBlur={handleInputBlur}></input>
                            </div>
                            {
                                state.errors?.username &&
                                state.errors?.username.map((error: string) => (
                                    <label className='error'>
                                        {error}
                                    </label>
                                ))
                            }
                        </div>
                        {state.message == 'Username accepted.' && redirect("/Home")}
                    </div>
                    <div className='submit-container'>
                        <input disabled={pending} type="submit" value="Submit"></input>
                    </div>

                </form>
            </div>
        </div>

    )
}

