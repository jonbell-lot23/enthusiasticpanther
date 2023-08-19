import Head from "next/head";
import styles from "/styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import React, { useEffect, useRef } from "react";
import ShowCard from "/components/ShowCard";

function Song(props) {
  return (
    <div className={styles.songContainer}>
      <div className={styles.songTitle}>{props.name}</div>
      <div className={styles.songQuality}>{props.quality}</div>
    </div>
  );
}

function Page({ data, showId, location }) {
  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Shows</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex my-4">
          <div className={styles.albumContainer}>
            <ShowCard showId={showId} location={location} />
            <div className={styles.metadata}>
              <div className={styles.metadataTitle}></div>
            </div>
          </div>
          <div className="w-1/2">
            <main className="mb-12">
              <div className="app">
                {data &&
                  data.map((song) => (
                    <Song name={song.name} quality={song.quality} />
                  ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const showId = Number(context.query.showid);

  const showDetails = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  // Fetch the song performances for the given show ID
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
  });

  // Map the performances into the desired format for the page
  const data = await Promise.all(
    performances.map(async (performance) => {
      // Fetch song details for each performance
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      return {
        name: song.name,
        quality: performance.quality,
      };
    })
  );

  await prisma.$disconnect();

  return { props: { data, showId, location: showDetails.location } };
}

export default Page;
