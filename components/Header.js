import Link from "next/link";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();

  const isActive = (href) => {
    return router.pathname === href;
  };

  return (
    <div className="flex justify-center p-3 text-white bg-black text-xl">
      <Link href="/">
        <a className={isActive("/") ? "text-white" : ""}>
          <h1 className="m-0 font-normal">Enthusiastic Panther</h1>
        </a>
      </Link>

      <div className="space-x-4 font-normal hidden">
        <Link href="/about">
          <a className={isActive("/about") ? "text-yellow-300" : ""}>About</a>
        </Link>
        <Link href="/shows">
          <a className={isActive("/shows") ? "text-yellow-300" : ""}>Shows</a>
        </Link>
        <Link href="/songs">
          <a className={isActive("/songs") ? "text-yellow-300" : ""}>Songs</a>
        </Link>
      </div>
    </div>
  );
};

export default Header;
