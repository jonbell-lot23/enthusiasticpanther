import styles from "./Song.module.css"; // Update stylesheet for song details
import { PrismaClient } from "@prisma/client";
import ShowCard from "../../components/ShowCard";

function SongPage({ songDetails, performances }) {
  return (
    <div className={styles.container}>
      <h2 className="w-full my-4 text-2xl font-semibold text-left pl-7">
        {songDetails.name}
      </h2>
      <div className={styles.performancesContainer}>
        {performances &&
          performances.map((performance) => (
            <div key={performance.id} className={styles.card}>
              <ShowCard
                showId={performance.showId}
                location={performance.location}
                showScore={performance.quality}
              />

              {performance.isDebut && (
                <p className="text-xs">{performance.quality}</p>
              )}
            </div>
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
    orderBy: { id: "desc" },
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
        showId: performance.showid,
      };
    })
  );

  await prisma.$disconnect();

  return { props: { songDetails, performances } };
}

export default SongPage;
