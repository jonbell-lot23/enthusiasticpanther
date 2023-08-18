import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import ShowCard from "../components/ShowCard";
import React, { useEffect, useState } from "react";

function Show(props) {
  let bgcolor;
  if (!props.avg) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-black p-1 pl-0 float-left";
  } else if (props.avg > 65) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-green-500 p-1 pl-0 float-left";
  } else if (props.avg > 52) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-gray-800 p-1 pl-0 float-left";
  } else {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-red-400 p-1 pl-0 float-left";
  }

  const showid = "show/" + props.showid;

  const [imageExists, setImageExists] = useState(null);

  useEffect(() => {
    fetch(`/api/checkImage?showId=${props.showid}`)
      .then((res) => res.json())
      .then((data) => setImageExists(data.exists));
  }, [props.showid]);

  return (
    <div>
      <Link href={showid}>
        <div className={bgcolor}>
          <div className="w-48 cursor-pointer hover:bg-gray-100">
            <img
              src={
                imageExists === true
                  ? `/show-art/show${props.showid}.png`
                  : `/show-art/placeholder.png`
              }
              alt={props.location}
            />
            <div className="text-xs text-gray-400">{props.location}</div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home({ shows }) {
  return (
    <div className={styles.container}>
      <main className="mb-12">
        <div className="grid grid-cols-5 gap-4 app">
          {" "}
          {shows &&
            shows.map((show) => (
              <Show
                location={show.location}
                avg={show.quality}
                showid={show.id}
              />
            ))}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  const shows = await prisma.ep_shows.findMany({
    orderBy: {
      id: "desc",
    },
  });

  // Log the results to the console
  console.log("Shows data:", shows);

  // Check if the shows array is empty
  if (shows.length === 0) {
    console.log("No shows found in the database.");
  }

  // Close the database connection
  await prisma.$disconnect();

  return { props: { shows } };
}
