import styles from "./Song.module.css"; // Update stylesheet for song details
import prisma from "/prisma";

import ShowCard from "../../components/ShowCard";
import GapCard from "../../components/GapCard";

function SongPage({ songDetails, performances }) {
  return (
    <div className={styles.container}>
      <h2 className="w-full my-4 text-2xl font-semibold text-left pl-7">
        {songDetails.name}
      </h2>

      <div className={styles.performancesContainer}>
        {performances &&
          performances.map((performance, index) => (
            <div
              key={index}
              className={performance.type === "show" ? styles.card : styles.gap}
            >
              {performance.type === "show" ? (
                <ShowCard
                  showId={performance.showId}
                  location={performance.location}
                  showScore={performance.quality}
                />
              ) : (
                <div className={styles.gapContainer}>
                  {[...Array(performance.gap)].map((_, i) => (
                    <div key={i}>.</div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export async function getStaticProps(context) {
  const songId = Number(context.params.songid);
  const songPerformances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
    orderBy: { id: "desc" },
  });

  let previousShowId = null;
  const performances = [];

  for (const performance of songPerformances) {
    const show = await prisma.ep_shows.findUnique({
      where: { id: performance.showid },
    });

    if (previousShowId) {
      const gap = previousShowId - performance.showid;
      performances.push({
        type: "gap",
        gap,
      });
    }

    performances.push({
      type: "show",
      location: show.location,
      date: show.date,
      quality: performance.quality,
      showId: performance.showid,
    });

    previousShowId = performance.showid;
  }

  await prisma.$disconnect();

  const songDetails = await prisma.ep_songs.findUnique({
    where: { id: songId },
  });

  return { props: { songDetails, performances } };
}

export async function getStaticPaths() {
  const allSongs = await prisma.ep_songs.findMany({
    select: {
      id: true,
    },
  });

  const paths = allSongs.map((song) => ({
    params: { songid: song.id.toString() },
  }));

  await prisma.$disconnect();

  return {
    paths,
    fallback: false,
  };
}

export default SongPage;
