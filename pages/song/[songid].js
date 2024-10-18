import React, { useState, useEffect } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
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

  const performanceData = performances
    .filter((p) => p.played)
    .map((p) => p.quality);
  const labels = performances
    .filter((p) => p.played)
    .map((_, index) => `Performance ${index + 1}`);

  const qualityDistribution = [0, 0, 0, 0, 0];
  performanceData.forEach((quality) => {
    if (quality > 0 && quality <= 5) qualityDistribution[quality - 1]++;
  });

  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: "Performance Quality",
        data: performanceData,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: ["1", "2", "3", "4", "5"],
    datasets: [
      {
        label: "Quality Distribution",
        data: qualityDistribution,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const pieChartData = {
    labels: ["Played", "Not Played"],
    datasets: [
      {
        data: [
          performances.filter((p) => p.played).length,
          performances.filter((p) => !p.played).length,
        ],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

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
      className={`${styles.container} bg-gray-900 text-white min-h-screen p-4 md:p-8`}
    >
      <Link href="/">
        <a className="text-white text-lg mb-4 inline-block">← Back</a>
      </Link>
      <h2 className="text-4xl font-bold text-center mb-8">
        {songDetails.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">First Performance</h3>
          <p>{firstPerformance ? `Show #${firstPerformance.showId}` : "N/A"}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Most Recent Performance</h3>
          <p>
            {lastPerformance
              ? `Show #${lastPerformance.showId} (${showsSinceLastPerformance} shows ago)`
              : "N/A"}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Average Quality</h3>
          <p>{averageQuality}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Total Performances</h3>
          <p>{totalPerformances}</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <BarGraph
          performances={performances.slice(
            0,
            Math.ceil(performances.length / 2)
          )}
        />
        <BarGraph
          performances={performances.slice(Math.ceil(performances.length / 2))}
        />
      </div>
    </div>
  );
}

function BarGraph({ performances }) {
  return (
    <div className="flex justify-center items-end space-x-0">
      {performances.map((performance, index) => {
        let barHeight = performance.played
          ? performance.quality
            ? performance.quality * 5
            : 20
          : 500;
        barHeight = Math.min(barHeight, 500);
        return (
          <div
            key={index}
            className={`w-1 ${
              performance.played ? "bg-blue-300" : "bg-gray-800"
            } rounded-t-lg`}
            style={{ height: `${barHeight}px` }}
            title={`Quality: ${performance.quality || "N/A"}`}
          >
            {performance.quality && (
              <span className="hidden">{performance.quality}</span>
            )}
          </div>
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
