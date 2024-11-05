
import "@/app/(overview)/Home/home.css"
import TopNav from '@/app/ui/Home/NavTop';
import { auth } from "@/auth";
import UserName from "@/app/ui/Home/UserName";
import { getUserById } from "@/app/lib/actions";
import Feed from "@/app/ui/Feed/Feed";
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
      <div className="scrollableDiv">
        <Feed></Feed>
      </div>
    </div>
    {!username && <UserName></UserName>}
  </>
  );
}
