
import '@/app/Home/home.css'
import TopNav from '@/app/ui/Home/NavTop';
import SearchFollow from '@/app/ui/Home/SearchFollow';

export default function Home() {
  return (<>
    <div className="home">
      <TopNav></TopNav>
    </div>
    <SearchFollow></SearchFollow>
  </>
  );
}
