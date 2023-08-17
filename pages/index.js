import Head from "next/head";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

import React, { useEffect, useState } from "react";

function Show(props) {
  const showid = "show/" + props.showid;

  const [imageExists, setImageExists] = useState(null);

  useEffect(() => {
    fetch(`/api/checkImage?showId=${props.id}`)
      .then((res) => res.json())
      .then((data) => setImageExists(data.exists));
  }, [props.showid]);

  return (
    <div className="p-4">
      <Link href={showid}>
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
          <img
            src={
              imageExists === true
                ? `/show-art/show${props.id}.png`
                : `/show-art/placeholder.png`
            }
            alt={props.location}
            className="object-cover w-full h-40 rounded-t-lg"
          />
          <div className="p-4 text-gray-700">
            {props.location}
            <div>{props.date}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home({ latestShows, highlyRatedShows }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container p-4 mx-auto">
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">LATEST SHOWS</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {latestShows &&
              latestShows.map((show) => (
                <Show showid={show.id} {...show} key={show.id} />
              ))}
          </div>
        </section>
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">HIGHLY RATED SHOWS</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {highlyRatedShows &&
              highlyRatedShows.map((show) => (
                <Show showid={show.id} {...show} key={show.id} />
              ))}
          </div>
        </section>
      </main>

      {/* ... (rest of the code) */}
    </div>
  );
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  const latestShows = await prisma.ep_shows.findMany({
    orderBy: { id: "desc" },
    take: 8,
  });

  const highlyRatedShows =
    await prisma.$queryRaw`SELECT * FROM ep_shows ORDER BY RANDOM() LIMIT 8`;

  console.log("Latest Shows:", latestShows);
  console.log("Highly Rated Shows:", highlyRatedShows);

  // Close the database connection
  await prisma.$disconnect();

  return { props: { latestShows, highlyRatedShows } };
}
