import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import prisma from "/prisma";
import { useRouter } from "next/router";

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

  const buffer = 5;
  const adjustedMin = min - buffer < 0 ? 0 : min - buffer;
  const adjustedMax = max + buffer > 100 ? 100 : max + buffer;

  const totalRange = adjustedMax - adjustedMin;
  const averageWidth = ((highMid - lowMid) / totalRange) * 100;
  const averageStart = ((lowMid - adjustedMin) / totalRange) * 100;

  let scorePosition = ((currentScore - adjustedMin) / totalRange) * 100;
  scorePosition = Math.min(scorePosition, 100);

  const dotMargin = 3;
  const adjustedScorePosition =
    scorePosition === 100 ? scorePosition - dotMargin : scorePosition;

  let dotColor = "bg-black";
  if (currentScore === 100) {
    dotColor = "bg-green-500";
  } else if (currentScore < 40) {
    dotColor = "bg-red-500";
  }

  return (
    <div className="relative w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
      <div
        className="absolute h-full bg-gray-300"
        style={{ left: `${averageStart}%`, width: `${averageWidth}%` }}
      />
      <div
        className={`absolute w-2 h-2 ${dotColor} rounded-full top-1/2 transform -translate-y-1/2`}
        style={{ left: `${adjustedScorePosition}%` }}
      />
    </div>
  );
};

export default function SetlistPage({ show, songs, prevShowId, nextShowId }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" && prevShowId) {
        router.push(`/show/${prevShowId}`);
      } else if (event.key === "ArrowRight" && nextShowId) {
        router.push(`/show/${nextShowId}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevShowId, nextShowId, router]);

  const averageScore = Math.round(
    songs.reduce((sum, song) => sum + song.quality, 0) / songs.length
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <Link href="/">
        <a className="text-white text-lg mb-4 inline-block">← Back</a>
      </Link>
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="relative bg-black rounded-lg overflow-hidden mb-8 flex flex-col md:flex-row">
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-xl scale-110"
            style={{
              backgroundImage: `url('/show-art/show${show.id}.png')`,
            }}
          ></div>
          <div className="relative w-full md:w-1/3">
            <Image
              src={`/show-art/show${show.id}.png`}
              alt="Concert artwork"
              layout="responsive"
              width={400}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative p-4 md:p-6 w-full md:w-2/3 bg-transparent bg-opacity-90">
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
            <Card className="bg-transparent border-none text-white m-0">
              <div className="text-2xl space-y-2 pt-4">
                <p>Total Songs: {songs.length}</p>
                <p>Average Score: {averageScore}</p>
                <p>
                  Highest Rated:{" "}
                  {Math.max(...songs.map((song) => song.quality))}
                </p>
              </div>
            </Card>
          </div>
        </header>

        <div className="flex justify-between items-center mb-8">
          <Link href={`/show/${prevShowId}`}>
            <a
              className={`text-lg ${
                prevShowId ? "text-white" : "text-gray-500 pointer-events-none"
              }`}
            >
              ← Previous Show
            </a>
          </Link>
          <Link href={`/show/${nextShowId}`}>
            <a
              className={`text-lg ${
                nextShowId ? "text-white" : "text-gray-500 pointer-events-none"
              }`}
            >
              Next Show →
            </a>
          </Link>
        </div>

        <div className="space-y-4">
          {songs.map((song) => (
            <div key={song.id} className="flex items-center space-x-4">
              <div className="w-1/2">
                <ScoreVisualization
                  songScores={song.allScores}
                  currentScore={song.quality}
                />
              </div>
              <div className="w-1/2 text-xl">
                <Link href={`/song/${song.id}`}>
                  <a>{song.name}</a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const shows = await prisma.ep_shows.findMany({
    select: { id: true },
  });

  const paths = shows.map((show) => ({
    params: { showid: show.id.toString() },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const showId = Number(params.showid);

  if (isNaN(showId)) {
    return { notFound: true };
  }

  const show = await prisma.ep_shows.findUnique({
    where: { id: showId },
  });

  if (!show) {
    return { notFound: true };
  }

  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
    select: {
      songid: true,
      quality: true,
    },
  });

  const songs = await prisma.ep_songs.findMany();

  const allPerformances = await prisma.ep_songperformances.findMany({
    select: {
      songid: true,
      quality: true,
    },
  });

  const songPerformanceMap = allPerformances.reduce((acc, performance) => {
    if (!acc[performance.songid]) {
      acc[performance.songid] = [];
    }
    acc[performance.songid].push(performance.quality);
    return acc;
  }, {});

  const songsWithQuality = performances.map((performance) => {
    const song = songs.find((s) => s.id === performance.songid);
    return {
      id: song.id,
      name: song.name,
      quality: performance.quality,
      allScores: songPerformanceMap[performance.songid] || [],
    };
  });

  const allShows = await prisma.ep_shows.findMany({
    orderBy: { id: "asc" },
    select: { id: true },
  });

  const currentIndex = allShows.findIndex((s) => s.id === showId);
  const prevShowId = currentIndex > 0 ? allShows[currentIndex - 1].id : null;
  const nextShowId =
    currentIndex < allShows.length - 1 ? allShows[currentIndex + 1].id : null;

  return {
    props: {
      show: {
        id: show.id,
        date: show.date || "",
        location: show.location || "",
      },
      songs: songsWithQuality,
      prevShowId,
      nextShowId,
    },
    revalidate: 600,
  };
}
