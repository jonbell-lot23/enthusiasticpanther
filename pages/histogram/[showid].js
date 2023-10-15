import React from "react";
import { PrismaClient } from "@prisma/client";
import Subnav from "../../components/Subnav";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const prisma = new PrismaClient();

const HistogramPage = ({ songsData, showId }) => {
  const eras = [
    { era: 1, start: 0, end: 14, name: "Early Days" },
    { era: 2, start: 15, end: 26, name: "Missoula" },
    { era: 3, start: 27, end: 53, name: "Halifax" },
    { era: 4, start: 54, end: 57, name: "Tel-Aviv" },
    { era: 5, start: 58, end: 59, name: "Kyoto" },
    { era: 6, start: 60, end: 101, name: "Tokyo" },
    { era: 7, start: 102, end: 121, name: "El Paso" },
    { era: 8, start: 122, end: 182, name: "Winston-Salem" },
    { era: 9, start: 183, end: 232, name: "Charlotte" },
    { era: 10, start: 233, end: 300, name: "New York" },
  ];

  const groupedByEra = eras.reduce((acc, era) => {
    acc[era.era] = { count: 0, shows: [], debutDates: [] };
    return acc;
  }, {});

  if (!songsData) {
    return <div>Error: Song data is not available.</div>;
  }

  songsData.forEach((song) => {
    const era = eras.find(
      (e) => song.debutShow >= e.start && song.debutShow <= e.end
    );
    if (era) {
      groupedByEra[era.era].count += 1;
      groupedByEra[era.era].shows.push(song.currentShow);
      groupedByEra[era.era].debutDates.push(song.debutShow);
    }
  });

  const eraLabels = eras.map((e) => e.name);
  const eraCounts = eras.map((e) => groupedByEra[e.era].count);

  const chartData = {
    labels: eraLabels,
    datasets: [
      {
        label: "Number of Songs",
        data: eraCounts,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };

  const verticalLine = {
    type: "line",
    label: "Current Show",
    borderColor: "#FF0000",
    borderWidth: 2,
    fill: false,
    data: [],
    pointRadius: 0,
  };

  const currentEraIndex = eras.findIndex(
    (era) => showId >= era.start && showId <= era.end
  );
  if (currentEraIndex !== -1) {
    verticalLine.data = Array(eraLabels.length).fill(null);
    verticalLine.data[currentEraIndex] = Math.max(...eraCounts);
  }
  chartData.datasets.push(verticalLine);

  return (
    <div>
      <Subnav showId={showId} />
      <div className="w-full max-w-2xl p-4 mx-auto prose prose-lg bg-white rounded-lg shadow-lg">
        <Bar data={chartData} />
        {eras.map((era) => (
          <div key={era.era} className="hidden">
            Era {era.era}: {groupedByEra[era.era].count} (
            {groupedByEra[era.era].debutDates.join(", ")})
          </div>
        ))}
      </div>
    </div>
  );
};

export async function getStaticProps(context) {
  const showId = Number(context.params.showid);
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
      const album = song?.album || "";
      const previousPerformances = await prisma.ep_songperformances.findMany({
        where: { songid: performance.songid, showid: { lt: showId } },
        orderBy: { showid: "asc" },
      });
      const debutShow = previousPerformances.length
        ? previousPerformances[0].showid
        : showId;

      return {
        name: song?.name || "Unknown Song",
        album: album,
        debutShow: debutShow,
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
}

export async function getStaticPaths() {
  const allShows = await prisma.ep_shows.findMany({
    select: {
      id: true,
    },
  });
  const paths = allShows.map((show) => ({
    params: { showid: show.id.toString() },
  }));

  await prisma.$disconnect();

  return {
    paths,
    fallback: false,
  };
}

export default HistogramPage;
