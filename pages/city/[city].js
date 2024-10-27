import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "/prisma";

export default function CityPage({
  cityName,
  totalShows,
  topSongs,
  cityImage,
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <Link href="/">
        <a className="text-white text-lg mb-4 inline-block">← Back</a>
      </Link>
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="bg-black rounded-lg overflow-hidden mb-8">
          <img
            src={cityImage}
            alt={`${cityName} image`}
            className="w-full h-64 object-cover"
          />
          <div className="p-4 md:p-6 bg-transparent bg-opacity-90">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2">
              {cityName.toUpperCase()}
            </h1>
          </div>
        </header>

        <Card className="bg-gray-800 text-white border-black">
          <CardHeader>
            <CardTitle className="text-2xl">Show Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl">Total Shows: {totalShows}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white border-black">
          <CardHeader>
            <CardTitle className="text-2xl">Songs Played</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topSongs.map((song, index) => (
                <li key={song.id} className="flex justify-between items-center">
                  <span className="text-xl">
                    {index + 1}. {song.name}
                  </span>
                  <span className="text-lg text-gray-400">
                    {song.playCount} {song.playCount === 1 ? "time" : "times"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const cityName = context.params.city;

  // Fetch shows by city name
  const shows = await prisma.ep_shows.findMany({
    where: {
      location: {
        contains: cityName,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  const showIds = shows.map((show) => show.id);
  const totalShows = showIds.length;

  const songPerformances = await prisma.ep_songperformances.findMany({
    where: {
      showid: { in: showIds },
    },
    select: {
      songid: true,
    },
  });

  const songCounts = songPerformances.reduce((acc, performance) => {
    acc[performance.songid] = (acc[performance.songid] || 0) + 1;
    return acc;
  }, {});

  const songDetails = await prisma.ep_songs.findMany({
    where: {
      id: { in: Object.keys(songCounts).map(Number) },
    },
    select: { id: true, name: true },
  });

  const topSongs = songDetails
    .map((song) => ({
      id: song.id,
      name: song.name,
      playCount: songCounts[song.id] || 0,
    }))
    .sort((a, b) => b.playCount - a.playCount || a.name.localeCompare(b.name));

  // Fetch city image from Unsplash
  let cityImage = "";
  try {
    const query = `${cityName} city skyline`.replace(/\s+/g, "+");
    const unsplashResponse = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&client_id=r3F4wrZA6lUpBIXATEiLpZ0r2w89uDiG-GGARD62Wmg`
    );

    // Check for successful response
    if (unsplashResponse.ok) {
      const unsplashData = await unsplashResponse.json();
      cityImage = unsplashData?.urls?.regular || "";

      // Log data if image is missing
      if (!cityImage) {
        console.warn(`Image URL missing for city: ${cityName}`, unsplashData);
      }
    } else {
      console.error(
        "Unsplash API Error:",
        unsplashResponse.status,
        unsplashResponse.statusText
      );
    }
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
  }

  return {
    props: {
      cityName,
      totalShows,
      topSongs,
      cityImage,
    },
  };
}
