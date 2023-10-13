import React from "react";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import ShowCard from "../../components/ShowCard";
import cardStyles from "../../components/ShowCard.module.css";
import Subnav from "../../components/Subnav";

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
      <Subnav showId={showId} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {songsData.map((song) => (
          <div key={song.name} className="flex flex-col items-center">
            <div>{song.name || "Unknown Song"}</div>
            <ShowCard showId={song.debutShow} location={`${song.debutShow}`} />
          </div>
        ))}
      </div>
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

        // Assume an empty album if not provided
        const album = song?.album || "";

        const previousPerformances = await prisma.ep_songperformances.findMany({
          where: { songid: performance.songid, showid: { lt: showId } }, // fetch performances before the current show
          orderBy: { showid: "asc" },
        });

        const debutShow = previousPerformances.length
          ? previousPerformances[0].showid
          : showId;

        return {
          name: song?.name || "Unknown Song",
          album: album,
          debutShow: debutShow, // Corrected this line
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
