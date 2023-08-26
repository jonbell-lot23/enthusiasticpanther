import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import React, { useEffect, useRef } from "react";
import ShowCard from "../../components/ShowCard";

function Song(props) {
  // Determine the class based on quality
  let qualityClass = "";
  if (props.quality > 73) qualityClass = "excellent";
  else if (props.quality < 40) qualityClass = "poor";

  return (
    <div className={`${styles.songContainer} ${styles[qualityClass]}`}>
      <div className={styles.songTitle}>
        <Link href={`/song/${props.songId}`}>
          <a>{props.name}</a>
        </Link>
        {props.footnoteIndex !== null && <sup>[{props.footnoteIndex}]</sup>}
      </div>
    </div>
  );
}

function Page({ data, showId, location, date }) {
  // Parse the date to the desired format
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Collect footnotes for debuts and gaps
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
        songId={song.id} // Pass songId as a prop
      />
    );
  });

  // Combine debut footnotes into a single line
  if (debutFootnoteIndices.length > 0) {
    footnotes.push(`[${debutFootnoteIndices.join(", ")}] Debut`);
  }

  let score = Math.floor(
    data.reduce((sum, song) => sum + song.quality, 0) / data.length
  );

  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Shows</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex m-4">
          <div className={styles.albumContainer}>
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
    </div>
  );
}

export async function getStaticPaths() {
  const prisma = new PrismaClient();
  const shows = await prisma.ep_shows.findMany({
    orderBy: { id: "desc" },
    take: 10,
  });
  await prisma.$disconnect();

  const paths = shows.map((show) => ({
    params: { showid: show.id.toString() },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps(context) {
  const prisma = new PrismaClient();
  const showId = Number(context.params.showid);

  const showDetails = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  // Fetch the song performances for the given show ID
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
    orderBy: { showid: "asc" }, // Order by show ID to calculate the gap
  });

  // Map the performances into the desired format for the page
  const data = await Promise.all(
    performances.map(async (performance) => {
      // Fetch song details for each performance
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      // Determine if it's a debut and calculate the gap
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

  await prisma.$disconnect();

  return {
    props: {
      data,
      showId,
      location: showDetails.location,
      date: showDetails.date,
    },
  };
}

export default Page;
