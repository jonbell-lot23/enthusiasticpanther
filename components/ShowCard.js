import React, { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "/styles/Home.module.css"; // Import the styles
import cardStyles from "./ShowCard.module.css"; // Import the new CSS module

function ShowCard({ showId, location, imageSize = "h-full", showScore }) {
  let qualityClass =
    showScore > 70
      ? cardStyles.excellent
      : showScore < 40
      ? cardStyles.poor
      : "";

  const canvasRef = useRef(null);

  useEffect(() => {
    if (
      showId <= 73 ||
      (showId >= 150 && showId <= 219) ||
      [74, 102, 141].includes(showId)
    ) {
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
    const hash = String(showId)
      .split("")
      .reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);

    // 25 colors
    const colors = [
      "#FFB6B6",
      "#FF8C8C",
      "#FF6262",
      "#FF3838", // Red
      "#FFDAA5",
      "#FFC078",
      "#FFA54C",
      "#FF8A20", // Orange
      "#FFFFB3",
      "#FFFF8D",
      "#FFFF66",
      "#FFFF3F", // Yellow
      "#BFFFAD",
      "#99FF80",
      "#66FF40",
      "#33FF00", // Green
      "#B3CCFF",
      "#8099FF",
      "#4D66FF",
      "#1A33FF", // Blue
      "#C2C3FF",
      "#A480FF",
      "#8652FF",
      "#6724FF", // Indigo
      "#F4B3FF",
      "#E880FF",
      "#DB52FF",
      "#CE24FF", // Violet
      "#B3B3B3",
      "#808080",
      "#4D4D4D",
      "#1A1A1A", // Black
      "#FFFFFF",
      "#E6E6E6",
      "#CCCCCC",
      "#B3B3B3", // White
    ];

    // Select 4 colors based on the hash
    const selectedColors = [
      colors[hash % 32],
      colors[(hash >> 2) % 32],
      colors[(hash >> 4) % 32],
      colors[(hash >> 6) % 32],
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
    <div className={cardStyles.cardContainer}>
      <Link href={`/show/${showId}`}>
        <div className={cardStyles.linkContainer}>
          {showId <= 73 ||
          (showId >= 150 && showId <= 235) ||
          [74, 102, 141].includes(showId) ? (
            <img
              src={`/show-art/show${showId}.png`}
              alt={location}
              className={cardStyles.imageContainer}
            />
          ) : (
            <canvas ref={canvasRef} className={cardStyles.imageContainer} />
          )}
          <div className={cardStyles.infoContainer}>
            <div className={cardStyles.locationText}>{location}</div>
            <div className={`${cardStyles.scoreText} ${qualityClass}`}>
              {showScore}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ShowCard;
