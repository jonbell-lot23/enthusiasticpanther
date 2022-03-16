import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Enthusiastic Panther is a made-up band</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center p-8 text-black rounded-xl m-12 text-xl">
        <h1>Enthusiastic Panther!</h1>
      </div>
    </div>
  );
}
