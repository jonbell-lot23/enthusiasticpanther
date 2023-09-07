import styles from "../styles/Home.module.css";
import prisma from "/prisma";
import ShowCard from "../components/ShowCard";
import React from "react";

export default function Home({ shows }) {
  // Group shows by year
  const showsByYear = shows.reduce((acc, show) => {
    const year = show.date ? show.date.split("-")[0] : "Unknown"; // Extract the year from the date string
    acc[year] = acc[year] || [];
    acc[year].push(show);
    return acc;
  }, {});

  // Sort shows within each year by ID in descending order
  Object.keys(showsByYear).forEach((year) => {
    showsByYear[year].sort((a, b) => b.id - a.id);
  });

  return (
    <div className={styles.container}>
      <main className="mb-12">
        {Object.keys(showsByYear)
          .sort((a, b) => b - a) // Sort years in descending order
          .map((year) => (
            <div key={year}>
              <h2 className="my-4 ml-4 text-2xl font-semibold">{year}</h2>{" "}
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
                {showsByYear[year].map((show) => (
                  <ShowCard
                    showId={show.id}
                    location={show.location}
                    key={show.id}
                    showScore={show.quality}
                  />
                ))}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const shows = await prisma.ep_shows.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return { props: { shows } };
}
