
import "@/app/(overview)/Home/home.css"
import TopNav from '@/app/ui/Home/NavTop';
import SearchFollow from '@/app/ui/Home/SearchFollow';
import { auth } from "@/auth";
import UserName from "@/app/ui/Home/UserName";
import TweetPost from "@/app/ui/Home/TweetPost";
import { getUserById } from "@/app/lib/actions";

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;
  let username: string = "";
  if (typeof userId == "string") {
    const user = await getUserById(userId);
    if (user && typeof user !== "undefined") {
      username = user?.username || "";
    }
  }

  return (<>
    <div className="home">
      <TopNav></TopNav>
      <TweetPost></TweetPost>
    </div>
    <SearchFollow></SearchFollow>
    {username == "" && <UserName></UserName>}
  </>
  );
}
