import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import prisma from "/prisma";
import Subnav from "../../components/Subnav";
import NodeCache from "node-cache";

import React, { useEffect, useRef } from "react";
import ShowCard from "../../components/ShowCard";
import cardStyles from "../../components/ShowCard.module.css";
const myCache = new NodeCache({ stdTTL: 0 }); // 0 means no expiration time

function Song(props) {
  let qualityClass =
    props.quality > 73
      ? cardStyles.excellent
      : props.quality < 40
      ? cardStyles.poor
      : "";

  return (
    <div className={`${cardStyles.songContainer} ${qualityClass}`}>
      <div className={cardStyles.songTitle}>
        <Link href={`/song/${props.songId}`}>
          <a>{props.name}</a>
        </Link>
        {props.footnoteIndex !== null && <sup>[{props.footnoteIndex}]</sup>}
      </div>
    </div>
  );
}

function Page({ data, showId, location, date }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let footnotes = [];
  let debutFootnoteIndices = [];
  let footnoteCounter = 0;

  const songs = data.map((song, index) => {
    let footnoteIndex = null;
    if (song.isDebut) {
      footnoteIndex = ++footnoteCounter;
      debutFootnoteIndices.push(footnoteIndex);
    } else if (song.gap > 15) {
      footnoteIndex = ++footnoteCounter;
      footnotes.push(
        `[${footnoteIndex}] First performance in ${song.gap} shows`
      );
    }
    return (
      <Song
        key={index}
        name={song.name}
        quality={song.quality}
        footnoteIndex={footnoteIndex}
        songId={song.id}
      />
    );
  });

  if (debutFootnoteIndices.length > 0) {
    footnotes.push(`[${debutFootnoteIndices.join(", ")}] Debut`);
  }

  let score = Math.floor(
    data.reduce((sum, song) => sum + song.quality, 0) / data.length
  );

  return (
    <>
      <Head>
        <title>Enthusiastic Shows</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <Subnav showId={showId} />
        <div className="flex flex-col m-4 md:flex-row">
          <div className={`${styles.albumContainer} w-full sm:w-1/2 md:w-auto`}>
            <ShowCard showId={showId} location={location} showScore={score} />
            <div className={styles.metadata}>
              <div className={styles.metadataTitle}></div>
            </div>
          </div>
          <div className="px-2 py-3">
            <main className="mb-12">
              <h2 className={styles.locationHeader}>{location}</h2>
              <h3 className={styles.dateSubheader}>{formattedDate}</h3>
              <h2 className={styles.locationHeader}>Setlist</h2>
              <div className="app">{songs}</div>

              {footnotes.length > 0 && (
                <>
                  <h2 className={styles.shownotesHeader}>Show notes</h2>
                  <div className={styles.shownotes}>
                    {footnotes.map((note, index) => (
                      <div key={index}>{note}</div>
                    ))}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

// ... (the rest of the import statements and components remain unchanged)

export async function getServerSideProps(context) {
  const showId = Number(context.params.showid);

  // Create a cache key based on showId
  const cacheKey = `show-${showId}`;

  // Try to get data from cache
  let cachedData = myCache.get(cacheKey);

  if (cachedData) {
    // If cached, return the cached data
    return { props: cachedData };
  }

  const showDetails = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
    orderBy: { showid: "asc" },
  });

  const data = await Promise.all(
    performances.map(async (performance) => {
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      const previousPerformances = await prisma.ep_songperformances.findMany({
        where: { songid: performance.songid, showid: { lt: showId } },
        orderBy: { showid: "desc" },
      });

      const isDebut = previousPerformances.length === 0;
      const gap = isDebut ? 0 : showId - previousPerformances[0].showid - 1;

      return {
        name: song.name,
        quality: performance.quality,
        isDebut,
        gap,
        id: song.id,
      };
    })
  );

  const dataToCache = {
    data,
    showId,
    location: showDetails.location,
    date: showDetails.date,
  };
  myCache.set(cacheKey, dataToCache);

  return {
    props: dataToCache,
  };
}

// No getStaticPaths function as it's not needed for server-side rendering

export default Page;
