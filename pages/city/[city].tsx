import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/prisma";

// Add this function to calculate days between dates
function daysBetween(date1, date2) {
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const differenceMs = Math.abs(date2 - date1);
  return Math.round(differenceMs / ONE_DAY);
}

export default function CityPage({
  cityName,
  showDates,
  topSongs,
  cityImage,
  // Add new props for statistics
  daysSinceLastShow,
  totalShows,
  songsPerformed,
  totalSongs,
}: {
  cityName: string;
  showDates: Array<{ date: string; id: number }>;
  topSongs: Array<{ id: number; name: string; playCount: number }>;
  cityImage: string;
  daysSinceLastShow: number;
  totalShows: number;
  songsPerformed: number;
  totalSongs: number;
}) {
  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <Link href="/">← Back</Link>
      <main className="max-w-4xl mx-auto space-y-8">
        <header className="relative rounded-lg overflow-hidden mb-8">
          <img
            src={cityImage}
            alt={`${cityName} image`}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider text-white drop-shadow-lg mb-4">
              {cityName.toUpperCase()}
            </h1>
            <div className="flex space-x-4 text-xl text-white">
              <div>DAYS SINCE LAST SHOW: {daysSinceLastShow}</div>
              <div>TOTAL SHOWS: {totalShows}</div>
              <div>
                SONGS PERFORMED: {songsPerformed}/{totalSongs}
              </div>
            </div>
          </div>
        </header>

        <Card className="bg-gray-800 text-white border-black">
          <CardHeader>
            <CardTitle className="text-2xl">Show Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {showDates.map((show) => (
                <Link key={show.id} href={`/show/${show.id}`}>
                  <a className="block">
                    <div className="relative aspect-square">
                      <Image
                        src={`/show-art/show${show.id}.png`}
                        alt={`Show on ${show.date}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-sm mt-2 text-center">{show.date}</p>
                  </a>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 text-white border-black">
          <CardHeader>
            <CardTitle className="text-2xl">Songs Played</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {topSongs.map((song) => (
                <li key={song.id} className="flex justify-between items-center">
                  <span className="text-xl">{song.name}</span>
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

export async function getStaticPaths() {
  const cities = await prisma.ep_shows.findMany({
    select: { location: true },
    distinct: ["location"],
  });

  const paths = cities.map((city) => ({
    params: { city: city.location.toLowerCase().replace(/\s+/g, "-") },
  }));

  return { paths, fallback: "blocking" };
}

export async function getStaticProps({ params }) {
  const cityName = params.city.replace(/-/g, " ");

  const shows = await prisma.ep_shows.findMany({
    where: {
      location: {
        contains: cityName,
        mode: "insensitive",
      },
    },
    select: { id: true, date: true },
    orderBy: { date: "desc" },
  });

  const showDates = shows.map((show) => ({
    id: show.id,
    date: new Date(show.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));

  const showIds = shows.map((show) => show.id);

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

  // Fetch city image from Unsplash only for the most recent 50 shows
  let cityImage = "";
  if (shows.length <= 50) {
    try {
      const query = `${cityName} venue`.replace(/\s+/g, "+");
      const unsplashResponse = await fetch(
        `https://api.unsplash.com/photos/random?query=${query}&client_id=r3F4wrZA6lUpBIXATEiLpZ0r2w89uDiG-GGARD62Wmg`
      );

      if (unsplashResponse.ok) {
        const unsplashData = await unsplashResponse.json();
        cityImage = unsplashData?.urls?.regular || "";

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
  }

  // Calculate days since last show
  const mostRecentShowDate = new Date(shows[0].date);
  const daysSinceLastShow = daysBetween(mostRecentShowDate, new Date());

  // Count total shows
  const totalShows = shows.length;

  // Fetch total number of songs
  const totalSongsResponse = await prisma.ep_songs.count();
  const totalSongs = totalSongsResponse;

  // Count songs performed
  const songsPerformed = Object.keys(songCounts).length;

  return {
    props: {
      cityName,
      showDates,
      topSongs,
      cityImage,
      // Add new props for statistics
      daysSinceLastShow,
      totalShows,
      songsPerformed,
      totalSongs,
    },
    revalidate: 3600, // Revalidate every hour
  };
}
