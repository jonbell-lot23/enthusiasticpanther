import Link from "next/link";
import { PrismaClient } from "@prisma/client";

import React, { useEffect, useRef } from "react";

function Show(props) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (props.id <= 73 || (props.id >= 213 && props.id <= 219)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    const displaySize = 400; // Display size
    const renderSize = 800; // Rendering size
    const scale = renderSize / displaySize; // Scale factor
    const bandWidth = 50; // Width of each band

    // Set the canvas display size
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Scale the context to match the rendering size
    ctx.scale(scale, scale);

    // Hash the ID to get a pattern
    const hash = String(props.id)
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

    // 25 colors
    const colors = [
      "#1E88E5",
      "#1976D2",
      "#1565C0",
      "#0D47A1",
      "#039BE5",
      "#0288D1",
      "#0277BD",
      "#01579B",
      "#80DEEA",
      "#4DD0E1",
      "#26C6DA",
      "#00BCD4",
      "#FFC107",
      "#FFB300",
      "#FFA000",
      "#FF8F00",
      "#FF6F00",
      "#FF4081",
      "#F50057",
      "#C51162",
      "#FF80AB",
      "#FF4081",
      "#F50057",
      "#C51162",
      "#FF80AB",
    ];

    // Select 4 colors based on the hash
    const selectedColors = [
      colors[hash % 25],
      colors[(hash >> 2) % 95],
      colors[(hash >> 4) % 25],
      colors[(hash >> 6) % 25],
    ];

    // Clear the canvas
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Pick a random background color from the selected colors
    const backgroundColor = selectedColors[hash % 4];

    // Fill the background with the random color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, displaySize, displaySize);

    // Rotate by 90 degrees based on the hash
    const rotationAngles = [0, 90, 180, 270];
    const rotation = rotationAngles[hash % 4];
    ctx.translate(displaySize / 2, displaySize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-displaySize / 2, -displaySize / 2);

    // Draw pattern based on the hash
    for (let i = 0; i < displaySize / bandWidth; i++) {
      // Skip the background color
      ctx.fillStyle = selectedColors[(i + 1) % 4];
      ctx.fillRect(i * bandWidth, 0, bandWidth, displaySize);
    }

    // Restore the context to its original state
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [props.id]);

  return (
    <div className="p-4">
      <Link href={`show/${props.id}`}>
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
          {props.id <= 73 || (props.id >= 211 && props.id <= 219) ? (
            <img
              src={`/show-art/show${props.id}.png`}
              alt={props.location}
              className="object-cover w-full h-40 rounded-t-lg"
            />
          ) : (
            <canvas ref={canvasRef} className="w-full h-40 rounded-t-lg" />
          )}
          <div className="p-4 text-xs text-gray-700">{props.location}</div>
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
          <h2 className="pl-4 mb-4 text-xl font-semibold ">LATEST SHOWS</h2>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4">
            {latestShows &&
              latestShows.map((show) => (
                <Show showid={show.id} {...show} key={show.id} />
              ))}
          </div>
        </section>
        <section className="mx-0 mb-12">
          <h2 className="pl-4 mb-4 text-xl font-semibold">
            HIGHLY RATED SHOWS
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {highlyRatedShows &&
              highlyRatedShows.map((show) => (
                <Show showid={show.id} {...show} key={show.id} />
              ))}
          </div>
        </section>
      </main>
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
