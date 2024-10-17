import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "/prisma";

const calculatePercentile = (scores, percentile) => {
  const sortedScores = scores.sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sortedScores.length) - 1;
  return sortedScores[index];
};

const ScoreVisualization = ({ songScores, currentScore }) => {
  const lowMid = calculatePercentile(songScores, 25);
  const highMid = calculatePercentile(songScores, 75);

  const min = Math.max(Math.min(...songScores), lowMid - (highMid - lowMid));
  const max = Math.min(Math.max(...songScores), highMid + (highMid - lowMid));

  // Add buffer for scores at the edges
  const buffer = 5; // 5% buffer
  const adjustedMin = min - buffer < 0 ? 0 : min - buffer;
  const adjustedMax = max + buffer > 100 ? 100 : max + buffer;

  const totalRange = adjustedMax - adjustedMin;
  const averageWidth = ((highMid - lowMid) / totalRange) * 100;
  const averageStart = ((lowMid - adjustedMin) / totalRange) * 100;
  const scorePosition = ((currentScore - adjustedMin) / totalRange) * 100;

  return (
    <div className="relative w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
      <div
        className="absolute h-full bg-gray-300"
        style={{ left: `${averageStart}%`, width: `${averageWidth}%` }}
      />
      <div
        className="absolute w-2 h-2 bg-gray-900 rounded-full top-1/2 transform -translate-y-1/2"
        style={{ left: `${scorePosition}%` }}
      />
    </div>
  );
};

export default function SetlistPage({ show, songs }) {
  const averageScore = Math.round(
    songs.reduce((sum, song) => sum + song.quality, 0) / songs.length
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2">
            {show.location.toUpperCase()}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400">
            {new Date(show.date)
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              .toUpperCase()}
          </p>
        </header>

        <Card className="bg-gray-800 border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold text-white">
              Setlist Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl space-y-2">
              <p>Total Songs: {songs.length}</p>
              <p>Average Score: {averageScore}</p>
              <p>
                Highest Rated: {Math.max(...songs.map((song) => song.quality))}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center space-x-4">
              <div className="w-1/2">
                <ScoreVisualization
                  songScores={song.allScores}
                  currentScore={song.quality}
                />
              </div>
              <div className="w-1/2 text-xl">{song.name}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const showId = Number(context.params?.showid);

  if (isNaN(showId)) {
    return { notFound: true };
  }

  const show = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  if (!show) {
    return { notFound: true };
  }

  // Fetch performances for the specific show
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
    select: {
      songid: true,
      quality: true,
    },
  });

  // Fetch all songs
  const songs = await prisma.ep_songs.findMany();

  // Fetch all performances to get historical data
  const allPerformances = await prisma.ep_songperformances.findMany({
    select: {
      songid: true,
      quality: true,
    },
  });

  // Create a map of all performances for each song
  const songPerformanceMap = allPerformances.reduce((acc, performance) => {
    if (!acc[performance.songid]) {
      acc[performance.songid] = [];
    }
    acc[performance.songid].push(performance.quality);
    return acc;
  }, {});

  // Combine the data
  const songsWithQuality = performances.map((performance) => {
    const song = songs.find((s) => s.id === performance.songid);
    return {
      id: song.id,
      name: song.name,
      quality: performance.quality,
      allScores: songPerformanceMap[performance.songid] || [],
    };
  });

  return {
    props: {
      show: {
        id: show.id,
        date: show.date || "",
        location: show.location || "",
      },
      songs: songsWithQuality,
    },
  };
}
