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

      <div className="w-full font-medium pl-7">
        <b>Statistics</b>
        <p>sdfsd</p>
      </div>

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

export async function getServerSideProps(context) {
export async function getStaticProps(context) {
  const songId = Number(context.params.songid);

  // Fetch the song performances for the given song ID
  const songPerformances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
    orderBy: { id: "desc" },
  });

  // Map the song performances to include show details and the gap between shows
  let previousShowId = null;
  const performances = [];

  for (const performance of songPerformances) {
    // Fetch show details for each performance
    const show = await prisma.ep_shows.findUnique({
      where: { id: performance.showid },
    });

    // If there's a previous show, calculate the gap and add it to the performances array
    if (previousShowId) {
      const gap = previousShowId - performance.showid;
      performances.push({
@@ -71,7 +61,6 @@ export async function getServerSideProps(context) {
      });
    }

    // Add the show to the performances array
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