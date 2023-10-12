import React from "react";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const HistogramPage = ({ songsData, showId }) => {
  console.log("Props received in HistogramPage:", { songsData, showId });

  if (!songsData) {
    return <div>Error: Song data is not available.</div>;
  }

  const groupedByAlbum = songsData.reduce((acc, song) => {
    acc[song.album] = (acc[song.album] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1>Histogram for Show ID: {showId}</h1>

      <h2>Album Distribution</h2>
      {Object.entries(groupedByAlbum).map(([album, count]) => (
        <div key={album}>
          {album}: {count} songs
        </div>
      ))}

      <h2>Debut Shows</h2>
      {songsData.map((song) => (
        <div key={song.name}>
          {song.name || "Unknown Song"} - Debut in show: {song.debutShow}
        </div>
      ))}
    </div>
  );
};

export async function getServerSideProps(context) {
  try {
    const showId = Number(context.params.showid);
    console.log("Show ID from params:", context.params.showid);
    console.log("Converted Show ID:", showId);

    const performances = await prisma.ep_songperformances.findMany({
      where: { showid: showId },
    });

    if (!performances) {
      console.error("Error fetching performances.");
      return { props: { songsData: [], showId: null } };
    }

    const songsData = await Promise.all(
      performances.map(async (performance) => {
        const song = await prisma.ep_songs.findUnique({
          where: { id: performance.songid },
        });

        console.log("Fetched song:", song);

        if (!song || !song.name || !song.album) {
          console.error(
            `Incomplete song data for song ID ${performance.songid}:`,
            song
          );
          return {
            name: song?.name || "Unknown Song", // <-- Modified this line
            album: "",
            debutShow: -1,
            currentShow: showId,
          };
        }

        const previousPerformances = await prisma.ep_songperformances.findMany({
          where: { songid: performance.songid },
          orderBy: { showid: "asc" },
        });

        const debutShow = previousPerformances.length
          ? previousPerformances[0].showid
          : showId;

        return {
          name: song.name,
          album: song.album,
          debutShow: debutShow.showid,
          currentShow: showId,
        };
      })
    );

    await prisma.$disconnect();

    return {
      props: {
        songsData,
        showId,
      },
    };
  } catch (error) {
    console.error("An error occurred during data fetching:", error);
    return { props: { songsData: [], showId: null } };
  }
}

export default HistogramPage;
