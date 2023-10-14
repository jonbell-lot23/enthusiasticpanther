import Head from "next/head";
import Link from "next/link";
import styles from "../../styles/Home.module.css";
import prisma from "/prisma";
import Subnav from "../../components/Subnav";
import React from "react";
import ShowCard from "../../components/ShowCard";
import cardStyles from "../../components/ShowCard.module.css";

function Song(props) {
  // Determine the class based on quality
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

function Page({ data, showId, location, date, footnotes }) {
  // Parse the date to the desired format
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  let score = 0; // Initialize score to 0

  if (data && data.length > 0) {
    // Check if data is defined and has elements
    score = Math.floor(
      data.reduce((sum, song) => sum + song.quality, 0) / data.length
    );
  }

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
            {" "}
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
              <div className="app">
                {data && Array.isArray(data) ? (
                  data.map((song, index) => (
                    <Song key={index} name={song.name} />
                  ))
                ) : (
                  // Handle the case where data is undefined or not an array
                  <p>No setlist data available</p>
                )}
              </div>

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

export async function getStaticPaths() {
  // Fetch the most recent 100 show IDs from your database
  const recentShows = await prisma.ep_shows.findMany({
    take: 100,
    orderBy: { id: "desc" }, // Assuming your IDs are in descending order
  });

  // Generate paths for these show IDs
  const paths = recentShows.map((show) => ({
    params: { showid: show.id.toString() },
  }));

  return {
    paths,
    fallback: true, // Render 404 for paths not found
  };
}

export async function getStaticProps({ params }) {
  const showId = Number(params.showid);

  const showDetails = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  // Fetch the song performances for the given show ID
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
    orderBy: { showid: "asc" },
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

  // Collect footnotes for debuts and gaps
  let footnotes = [];
  let debutFootnoteIndices = [];
  let footnoteCounter = 0;

  data.forEach((song) => {
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
    song.footnoteIndex = footnoteIndex;
  });

  // Combine debut footnotes into a single line
  if (debutFootnoteIndices.length > 0) {
    footnotes.push(`[${debutFootnoteIndices.join(", ")}] Debut`);
  }

  await prisma.$disconnect();

  return {
    props: {
      data,
      showId,
      location: showDetails.location,
      date: showDetails.date,
      footnotes,
    },
  };
}

export default Page;
