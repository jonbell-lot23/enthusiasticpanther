import Head from "next/head";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Enthusiastic Panther is a made-up band</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>enthusiastic panther, your favourite made-up band from New Zealand</header>                                    
      <div className="mt-4">
        <ul>
        <li><Link href="songs/">
           <a>list of songs</a>
         </Link> </li> 
        <li>
        <Link href="shows/">
           <a>recent shows</a>
         </Link>         
        </li>
        </ul>
      </div>
                         
                         
                          

    </div>
  );
}
