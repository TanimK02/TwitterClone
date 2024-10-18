import '@/app/login/login.css'
import { redirect } from "next/navigation"
import { signIn, auth, providerMap } from "@/auth"
import { AuthError } from "next-auth"
import google from '@/public/google.svg'
import Image from 'next/image'
export default async function Page(props: {
    searchParams: { error: string | undefined }
}) {

    return (
        <>
            <div className="container">
                <h1 className="title">Sign in to X</h1>

                <div className='options'>

                    <form
                        action={async (formData) => {
                            "use server"
                            try {
                                await signIn("credentials", formData)
                            } catch (error) {
                                if (error instanceof AuthError) {
                                    return redirect(`login?error=${error.type}`)
                                }
                                throw error
                            }
                        }}
                    >
                        {props.searchParams.error && <p>Invalid email or password</p>}
                        <input name="email" id="email" placeholder='Email' />

                        <input name="password" id="password" placeholder='Password' />

                        <input type="submit" value="Sign In" />
                        <fieldset><legend>or</legend></fieldset>
                    </form>

                    {Object.values(providerMap).map((provider) => (
                        <form key={provider.name}
                            action={async () => {
                                "use server"
                                try {
                                    await signIn(provider.id, {
                                        redirectTo: ''
                                    })
                                } catch (error) {
                                    if (error instanceof AuthError) {
                                        return redirect('/api/auth/callback/google')
                                    }
                                    throw error
                                }
                            }}
                        >
                            <button type="submit">
                                <Image height={23} width={23} alt="google-signUp icon" src={google}></Image>Sign in with {provider.name}
                            </button>
                        </form>
                    ))}

                </div>
            </div>
        </>
    )
}