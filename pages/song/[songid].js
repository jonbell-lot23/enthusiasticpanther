import React, { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import styles from "./Song.module.css";
import prisma from "/prisma";
import Link from "next/link";

ChartJS.register(...registerables);

function SongPage({ songDetails, performances }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (songDetails && songDetails.id) {
      fetch(`/api/songStatistics?songId=${songDetails.id}`)
        .then((res) => res.json())
        .then((data) => setStats(data.song));
    }
  }, [songDetails]);

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  const firstPerformance = performances.find((p) => p.played);
  const lastPerformance = [...performances].reverse().find((p) => p.played);
  const totalPerformances = performances.filter((p) => p.played).length;
  const showsSinceLastPerformance = lastPerformance
    ? performances.length -
      performances.findIndex((p) => p.showId === lastPerformance.showId) -
      1
    : "N/A";
  const averageQuality = stats
    ? parseFloat(stats.avgScore).toFixed(2)
    : "Loading...";

  return (
    <div
      className={`${styles.container} bg-gray-900 text-white min-h-screen p-4 md:p-8 md:w-1/2 mx-auto`}
    >
      <Link href="/">
        <a className="text-white text-lg mb-4 inline-block">← Back</a>
      </Link>
      <h2 className="text-4xl font-bold text-center mb-8">
        {songDetails.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-6xl font-medium">
            {firstPerformance ? `Show #${firstPerformance.showId}` : "N/A"}
          </p>
          <h3 className="text-lg font-light mt-2">First Performance</h3>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-6xl font-medium">
            {lastPerformance ? `Show #${lastPerformance.showId}` : "N/A"}
          </p>
          <h3 className="text-lg font-light mt-2">Most Recent Performance</h3>
          <p className="text-sm">
            {lastPerformance ? `(${showsSinceLastPerformance} shows ago)` : ""}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-6xl font-medium">{averageQuality}</p>
          <h3 className="text-lg font-light mt-2">Average Quality</h3>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-6xl font-medium">{totalPerformances}</p>
          <h3 className="text-lg font-light mt-2">Total Performances</h3>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <DotGraph performances={performances} />
      </div>
    </div>
  );
}

function DotGraph({ performances }) {
  return (
    <div className="flex flex-wrap items-center max-w-full space-x-1 space-y-1">
      {performances.map((performance, index) => {
        let fillClass = "bg-gray-500"; // Default for not played
        if (performance.played) {
          switch (true) {
            case performance.quality <= 25:
              fillClass = "bg-blue-300 quarter-fill";
              break;
            case performance.quality <= 49:
              fillClass = "bg-blue-300 half-fill";
              break;
            case performance.quality <= 74:
              fillClass = "bg-blue-300 three-quarters-fill";
              break;
            default:
              fillClass = "bg-blue-300 full-fill";
          }
        }
        return (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${fillClass}`}
            title={
              performance.played ? `Quality: ${performance.quality}` : "N/A"
            }
          />
        );
      })}
    </div>
  );
}

export async function getServerSideProps(context) {
  const songId = Number(context.params.songid);

  const allShows = await prisma.ep_shows.findMany({
    orderBy: { id: "asc" },
  });

  const songPerformances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
    select: { showid: true, quality: true },
  });

  const performances = allShows.map((show) => {
    const performance = songPerformances.find((sp) => sp.showid === show.id);
    return {
      showId: show.id,
      played: performance ? true : false,
      quality: performance ? performance.quality : null,
    };
  });

  const songDetails = await prisma.ep_songs.findUnique({
    where: { id: songId },
  });

  return { props: { songDetails, performances } };
}

export default SongPage;
