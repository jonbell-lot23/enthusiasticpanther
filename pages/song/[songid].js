import React from "react";

function DotGraph({ performances }) {
  return (
    <div className="flex flex-wrap items-center justify-center w-full gap-2">
      {performances.map((performance, index) => (
        <PerformanceDot key={index} performance={performance} />
      ))}
    </div>
  );
}

function PerformanceDot({ performance }) {
  const size = 36; // Size of the dot in pixels (3 times larger than before)
  const radius = size / 2;

  // Calculate the fill percentage and color based on the quality
  let fillPercentage = 0;
  let fillColor = "#FFFFFF"; // Default white color
  let outlineColor = "#4B5563"; // Default gray outline

  if (performance.played) {
    if (performance.quality <= 25) {
      fillPercentage = 0;
      outlineColor = "#EF4444"; // Red outline for 0-25%
    } else if (performance.quality <= 50) {
      fillPercentage = 25;
    } else if (performance.quality <= 75) {
      fillPercentage = 50;
    } else if (performance.quality < 100) {
      fillPercentage = 75;
    } else {
      fillPercentage = 100;
      fillColor = "#10B981"; // Green fill for 100%
    }
  }

  // Calculate the end angle for the arc (in radians)
  const endAngle = (fillPercentage / 100) * 2 * Math.PI;

  // Calculate the SVG arc path
  const path = calculateArcPath(radius, endAngle);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={radius}
        cy={radius}
        r={radius - 1} // Slightly smaller to show outline
        fill="#1F2937" // Dark background
        stroke={outlineColor}
        strokeWidth="2"
      />
      {/* Foreground partial circle (filled) */}
      <path
        d={path}
        fill={fillColor}
        transform={`translate(${radius}, ${radius}) rotate(-90)`} // Center and rotate to start from the top
      />
    </svg>
  );
}

function calculateArcPath(radius, endAngle) {
  const startX = radius;
  const startY = 0;
  const endX = radius * Math.cos(endAngle);
  const endY = radius * Math.sin(endAngle);
  const largeArcFlag = endAngle > Math.PI ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0 Z`;
}

export default function SongPage({ songDetails, performances }) {
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    if (songDetails && songDetails.id) {
      fetch(`/api/songStatistics?songId=${songDetails.id}`)
        .then((res) => res.json())
        .then((data) => setStats(data.song));
    }
  }, [songDetails]);

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  const firstPerformance = performances.find((p) => p.played);
  const lastPerformance = [...performances].reverse().find((p) => p.played);
  const totalPerformances = performances.filter((p) => p.played).length;
  const showsSinceLastPerformance = lastPerformance
    ? performances.length -
      performances.findIndex((p) => p.showId === lastPerformance.showId) -
      1
    : "N/A";
  const averageQuality = stats
    ? parseFloat(stats.avgScore).toFixed(2)
    : "Loading...";

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
      <a href="/" className="text-white text-lg mb-4 inline-block">
        ← Back
      </a>
      <h2 className="text-4xl font-bold text-center mb-8">
        {songDetails.name}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">First Performance</h3>
          <p>{firstPerformance ? `Show #${firstPerformance.showId}` : "N/A"}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Most Recent Performance</h3>
          <p>
            {lastPerformance
              ? `Show #${lastPerformance.showId} (${showsSinceLastPerformance} shows ago)`
              : "N/A"}
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Average Quality</h3>
          <p>{averageQuality}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold">Total Performances</h3>
          <p>{totalPerformances}</p>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <DotGraph performances={performances} />
      </div>
    </div>
  );
}
