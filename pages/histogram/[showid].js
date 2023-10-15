import React from "react";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import Subnav from "../../components/Subnav";

const HistogramPage = ({ songsData, showId }) => {
  const eras = [
    { era: 1, start: 0, end: 14 },
    { era: 2, start: 15, end: 26 }, // the missoula show
    { era: 3, start: 27, end: 53 }, // the halifax show
    { era: 4, start: 54, end: 57 }, // the tel-aviv show
    { era: 5, start: 58, end: 59 }, // the kyoto show
    { era: 6, start: 60, end: 101 }, // the tokyo show
    { era: 7, start: 102, end: 121 }, // the el paso show
    { era: 8, start: 122, end: 182 }, // the winston-salem show
    { era: 9, start: 183, end: 232 }, // the charlotte show
    { era: 10, start: 233, end: 300 }, // the new york show
  ];

  console.log("Props received in HistogramPage:", { songsData, showId });

  if (!songsData) {
    return <div>Error: Song data is not available.</div>;
  }

  const groupedByEra = eras.reduce((acc, era) => {
    acc[era.era] = { count: 0, shows: [], debutDates: [] };
    return acc;
  }, {});

  songsData.forEach((song) => {
    const era = eras.find(
      (era) => song.debutShow >= era.start && song.debutShow <= era.end
    );
    if (era) {
      groupedByEra[era.era].count += 1;
      groupedByEra[era.era].shows.push(song.currentShow);
      groupedByEra[era.era].debutDates.push(song.debutShow);
    }
  });

  return (
    <div>
      <Subnav showId={showId} />
      <div className="w-full max-w-2xl p-4 mx-auto prose prose-lg bg-white rounded-lg shadow-lg">
        {eras.map((era) => (
          <div key={era.era}>
            Era {era.era}: {groupedByEra[era.era].count} (
            {groupedByEra[era.era].debutDates.join(", ")})
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
