import styles from "./Song.module.css"; // Update stylesheet for song details
import prisma from "/prisma";

function SongPage({ songDetails, performances }) {
  return (
    <div className={styles.container}>
      <h2 className="w-full my-4 text-2xl font-semibold text-left pl-7">
        {songDetails.name}
      </h2>

      <BarGraph performances={performances} /> {/* Use the BarGraph component */}
    </div>
  );
}

export async function getServerSideProps(context) {
  const songId = Number(context.params.songid);

  // Fetch all shows
  const allShows = await prisma.ep_shows.findMany({
    orderBy: { id: "asc" },
  });

  // Fetch the song performances for the given song ID including the quality
  const songPerformances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
    select: { showid: true, quality: true }, // Select the showid and quality
  });

  // Map all shows to include a played boolean and the performance quality
  const performances = allShows.map(show => {
    const performance = songPerformances.find(sp => sp.showid === show.id);
    return {
      showId: show.id,
      played: performance ? true : false,
      quality: performance ? performance.quality : null, // Include the quality score
    };
  });

  const songDetails = await prisma.ep_songs.findUnique({
    where: { id: songId },
  });

  return { props: { songDetails, performances } };
}

function BarGraph({ performances }) {
  return (
    <div className={styles.barGraph}>
      {performances.map((performance, index) => {
        let barHeight = performance.played ? (performance.quality ? performance.quality * 5 : 20) : 500; // Set height to 500px if not played
        barHeight = Math.min(barHeight, 500);
        return (
          <div
            key={index}
            className={performance.played ? styles.playedBar : styles.notPlayedBar}
            style={{ height: `${barHeight}px` }} // Set the height dynamically
            title={`Quality: ${performance.quality || 'N/A'}`}
          >
            {performance.quality && <span className="hidden">{performance.quality}</span>}
          </div>
        );
      })}
    </div>
  );
}
export default SongPage;
