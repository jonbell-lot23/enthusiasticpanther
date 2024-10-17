import React from "react";
import Link from "next/link";
import prisma from "../prisma";
import NodeCache from "node-cache";
import { BandLayout } from "../components/HomeRedesignOctober2024";

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

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
        latestSetlist={latestSetlist}
      />
    </div>
  );
}

export async function getServerSideProps() {
  // Fetch latest shows and top 20 shows by quality if not cached
  const [latestShows, top20Shows] = await Promise.all([
    cache.get("latestShows") ||
      prisma.ep_shows
        .findMany({
          orderBy: { id: "desc" },
          take: 10,
        })
        .then((shows) => {
          cache.set("latestShows", shows);
          return shows;
        }),
    cache.get("top20Shows") ||
      prisma.ep_shows
        .findMany({
          orderBy: { quality: "desc" },
          take: 20,
        })
        .then((shows) => {
          cache.set("top20Shows", shows);
          return shows;
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
  };
}
