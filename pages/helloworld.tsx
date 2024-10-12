// pages/HelloWorldPage.tsx
import React from "react";
import prisma from "../prisma";
import NodeCache from "node-cache";
import { BandLayout } from "../components/HomeRedesignOctober2024";

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export default function HelloWorldPage({ latestShows, highlyRatedShows, latestSetlist }) {
  return (
    <div>
      <BandLayout 
        latestShows={latestShows} 
        highlyRatedShows={highlyRatedShows}
        latestSetlist={latestSetlist} // Pass setlist data to the component
      />
    </div>
  );
}

export async function getServerSideProps() {
  // Fetch latest shows if not cached
  let latestShows = cache.get("latestShows");
  if (!latestShows) {
    latestShows = await prisma.ep_shows.findMany({
      orderBy: { id: "desc" },
      take: 10,
    });
    cache.set("latestShows", latestShows);
  }

  // Fetch the top 20 shows by quality if not cached
  let top20Shows = cache.get("top20Shows");
  if (!top20Shows) {
    top20Shows = await prisma.ep_shows.findMany({
      orderBy: { quality: "desc" },
      take: 20,
    });
    cache.set("top20Shows", top20Shows);
  }

  // Shuffle the top 20 shows
  const shuffledTop20Shows = top20Shows.sort(() => 0.5 - Math.random());

  // Take the first 8 from the shuffled list
  const highlyRatedShows = shuffledTop20Shows.slice(0, 9);

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
      const gap = isDebut ? 0 : latestShow.id - previousPerformances[0].showid - 1;

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
      latestSetlist, // Return the setlist as props
    },
  };
}
