import prisma from "/prisma";
import ShowCard from "../components/ShowCard";
import React from "react";
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

import NodeCache from "node-cache";

export default function Home({ latestShows, highlyRatedShows }) {
  return (
    <div className="min-h-screen py-12 bg-gray-100">
      <main className="container p-4 mx-auto">
        <section className="mb-12">
          <h2 className="pl-4 mb-4 text-xl font-bold">Latest shows</h2>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
            {latestShows &&
              latestShows.map((show) => (
                <ShowCard
                  showId={show.id}
                  location={show.location}
                  showScore={show.quality}
                  key={show.id}
                />
              ))}
          </div>
        </section>
        <section className="mx-0 mb-12">
          <h2 className="pl-4 mb-4 text-xl font-bold">Highly rated shows</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {highlyRatedShows &&
              highlyRatedShows.map((show) => (
                <ShowCard
                  showId={show.id}
                  location={show.location}
                  showScore={show.quality}
                  key={show.id}
                />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  let latestShows = cache.get("latestShows");
  if (!latestShows) {
    latestShows = await prisma.ep_shows.findMany({
      orderBy: { id: "desc" },
      take: 8,
    });
    cache.set("latestShows", latestShows);
  }

  // Get the top 20 shows by quality
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
  const highlyRatedShows = shuffledTop20Shows.slice(0, 8);

  console.log("Latest Shows:", latestShows);
  console.log("Highly Rated Shows:", highlyRatedShows);

  // Close the database connection
  await prisma.$disconnect();

  return { props: { latestShows, highlyRatedShows } };
}
