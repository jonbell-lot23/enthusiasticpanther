import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import React, { useEffect, useRef } from "react";

function Song(props) {
  return (
    <div className={styles.songContainer}>
      <div className={styles.songTitle}>{props.name}</div>
      <div className={styles.songQuality}>{props.quality}</div>
    </div>
  );
}

function Page({ data, showId }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (showId <= 73 || (showId >= 172 && showId <= 219)) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const displaySize = 512; // Display size
    const renderSize = 1024; // Rendering size
    const scale = renderSize / displaySize; // Scale factor
    const bandWidth = 50; // Width of each band

    // Set the canvas display size
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Scale the context to match the rendering size
    ctx.scale(scale, scale);

    // Hash the ID to get a pattern
    const hash = String(showId)
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
  }, [showId]);

  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Shows</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex my-4">
          <div className={styles.albumContainer}>
            {showId <= 73 || (showId >= 172 && showId <= 219) ? (
              <img
                src={`/show-art/show${showId}.png`}
                alt="Album Art"
                className={styles.albumImage}
              />
            ) : (
              <canvas ref={canvasRef} className={styles.albumCanvas} />
            )}
            <div className={styles.metadata}>
              <div className={styles.metadataTitle}></div>
            </div>
          </div>
          <div className="w-1/2">
            <main className="mb-12">
              <div className="app">
                {data &&
                  data.map((song) => (
                    <Song name={song.name} quality={song.quality} />
                  ))}
              </div>
            </main>
          </div>
        </div>
      </div>
      {/* Existing global styles */}
    </div>
  );
}

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const showId = Number(context.query.showid);

  // Fetch the song performances for the given show ID
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
  });

  // Map the performances into the desired format for the page
  const data = await Promise.all(
    performances.map(async (performance) => {
      // Fetch song details for each performance
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      return {
        name: song.name,
        quality: performance.quality,
      };
    })
  );

  await prisma.$disconnect();

  return { props: { data, showId } };
}

export default Page;
