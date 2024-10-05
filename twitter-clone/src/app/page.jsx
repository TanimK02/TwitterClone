import '@/app/signUpLogin.css'
import Image from 'next/image'
import google from '@/public/google.svg'
import apple from '@/public/apple.svg'

export default function Page() {
  return(
    <>
    <div className='container'>
    <div className='logo-container'>
    <svg width="400" height="360" viewBox="0 0 1200 1300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" stroke="white" strokeWidth="40" fill="white"/>
</svg>
    </div>
    <div className='signUpLogin-Container'>
    <h1>Happening now</h1>
    <h2>Join today.</h2>
    <div className='options'>
    <div className='signUp'>
        <button type="submit"><Image height={23} width={23} alt="google-signUp icon" src={google}></Image>Sign up with Google</button>
        <button type="submit"><Image height={23} width={23} alt="apple-signUp icon" src={apple}></Image>Sign up with Apple</button>
        <fieldset><legend>or</legend></fieldset>
        <button type="submit">Create Account</button>
        <p>By signing up, you agree to the Terms of Service and Privacy Policy, including Cookie Use.</p>
        <h3>Already have an account?</h3>
        <button>Sign in</button>
      </div>
    </div>
    </div>
    </div>
    <footer></footer>
    </>
  )
}
