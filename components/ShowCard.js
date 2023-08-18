import React, { useEffect, useRef } from "react";
import Link from "next/link";

function ShowCard({ showId, location, imageSize = "h-40" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Same canvas drawing logic as before
    // ...
  }, [showId]);

  return (
    <div className="p-4">
      <Link href={`show/${showId}`}>
        <div className="bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
          {showId <= 73 || (showId >= 172 && showId <= 219) ? (
            <img
              src={`/show-art/show${showId}.png`}
              alt={location}
              className={`object-cover w-full ${imageSize} rounded-t-lg`}
            />
          ) : (
            <canvas
              ref={canvasRef}
              className={`w-full ${imageSize} rounded-t-lg`}
            />
          )}
          <div className="p-4 text-xs text-gray-700">{location}</div>
        </div>
      </Link>
    </div>
  );
}

export default ShowCard;
