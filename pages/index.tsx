import React from "react";
import Link from "next/link";
import prisma from "../prisma";
import { BandLayout } from "../components/HomeRedesignOctober2024";

export default function HelloWorldPage({
  latestShows,
  highlyRatedShows,
  latestSetlist,
}) {
  return (
    <div>
      <BandLayout
        latestShows={latestShows.map((show) => ({
          ...show,
          link: `/show/${show.id}`,
        }))}
        highlyRatedShows={highlyRatedShows.map((show) => ({
          ...show,
          link: `/show/${show.id}`,
        }))}
        latestSetlist={latestSetlist.map((song) => ({
          ...song,
          link: `/show/${latestShows[0].id}`,
        }))}
      />
    </div>
  );
}

export async function getStaticProps() {
  // Fetch latest shows and top 20 shows by quality
  const [latestShows, top20Shows] = await Promise.all([
    prisma.ep_shows.findMany({
      orderBy: { id: "desc" },
      take: 10,
    }),
    prisma.ep_shows.findMany({
      orderBy: { quality: "desc" },
      take: 20,
    }),
  ]);

  // Shuffle the top 20 shows and take the first 9
  const highlyRatedShows = Array.isArray(top20Shows)
    ? top20Shows.sort(() => 0.5 - Math.random()).slice(0, 9)
    : [];

  // Fetch the latest show’s setlist
  const latestShow = latestShows[0];
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: latestShow.id },
    orderBy: { showid: "asc" },
  });

  const latestSetlist = await Promise.all(
    performances.map(async (performance) => {
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      const previousPerformances = await prisma.ep_songperformances.findMany({
        where: { songid: performance.songid, showid: { lt: latestShow.id } },
        orderBy: { showid: "desc" },
      });

      const isDebut = previousPerformances.length === 0;
      const gap = isDebut
        ? 0
        : latestShow.id - previousPerformances[0].showid - 1;

      return {
        name: song.name,
        quality: performance.quality,
        isDebut,
        gap,
        id: song.id,
      };
    })
  );

  // Close the database connection
  await prisma.$disconnect();

  return {
    props: {
      latestShows,
      highlyRatedShows,
      latestSetlist,
    },
    revalidate: 3600, // Revalidate every hour
  };
}
