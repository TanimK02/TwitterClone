import '@/app/globals.css'
import TopNav from '@/app/ui/NavTop';

export default function Home() {
  return (<>
    <div className="home">
      <TopNav></TopNav>
    </div>
    <div className="others"></div>
  </>
  );
}
