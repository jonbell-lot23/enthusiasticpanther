import Head from "next/head";
import Link from "next/link";
import prisma from "/prisma";

import styles from "../styles/Home.module.css";

function Song(props) {
  let bgcolor;
  if (!props.avg) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-black p-1 pl-0 float-left";
  } else if (props.avg > 65) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-green-500 p-1 pl-0 float-left";
  } else if (props.avg > 45) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-gray-800 p-1 pl-0 float-left";
  } else {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-red-400 p-1 pl-0 float-left";
  }

  return (
    <div className={bgcolor}>
      <div>{props.name}</div>
    </div>
  );
}

function Home({ songs }) {
  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Panther Songs</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="m-12">
          <div className="app">
            {songs &&
              songs.map((song) => <Song name={song.name} avg={song.avg} />)}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const songs = await prisma.ep_songs.findMany({
    orderBy: {
      id: "desc",
    },
  });

  // Log the songs to see if they are being fetched correctly
  console.log("Fetched songs:", songs);

  await prisma.$disconnect();

  return { props: { songs } };
}

export default Home;
