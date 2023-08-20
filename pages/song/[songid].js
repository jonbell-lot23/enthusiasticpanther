import Head from "next/head";
import styles from "../../styles/Home.module.css"; // Update stylesheet for song details
import { PrismaClient } from "@prisma/client";

function Performance(props) {
  return (
    <div className={styles.performanceContainer}>
      <div className={styles.showLocation}>{props.location}</div>
      <div className={styles.showDate}>{props.date}</div>
      <div className={styles.showQuality}>{props.quality}</div>
    </div>
  );
}

function SongPage({ songDetails, performances }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{`Enthusiastic Shows - ${songDetails.name}`}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.songTitle}>{songDetails.name}</h1>
      <div className={styles.songDetails}></div>

      <h2 className={styles.performancesTitle}>Performances</h2>
      <div className={styles.performancesContainer}>
        {performances &&
          performances.map((performance) => (
            <Performance
              location={performance.location}
              date={performance.date}
              quality={performance.quality}
            />
          ))}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const songId = Number(context.query.songid);

  // Fetch the details for the given song ID
  const songDetails = await prisma.ep_songs.findUnique({
    where: { id: songId },
  });

  // Fetch the song performances for the given song ID
  const songPerformances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
  });

  // Map the song performances to include show details
  const performances = await Promise.all(
    songPerformances.map(async (performance) => {
      // Fetch show details for each performance
      const show = await prisma.ep_shows.findUnique({
        where: { id: performance.showid },
      });

      return {
        location: show.location,
        date: show.date,
        quality: performance.quality,
      };
    })
  );

  await prisma.$disconnect();

  return { props: { songDetails, performances } };
}

export default SongPage;
