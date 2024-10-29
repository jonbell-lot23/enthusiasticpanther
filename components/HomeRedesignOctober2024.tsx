// components/HomeRedesignOctober2024.tsx
import Image from "next/image";
import React from "react";
import Link from "next/link";

export function BandLayout({ latestShows, highlyRatedShows, latestSetlist }) {
  // Separate the first show from the rest
  const [firstShow, ...otherShows] = latestShows;

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(
      "en-US",
      options as Intl.DateTimeFormatOptions
    );
  };

  // Inline component for show formatting
  const ShowCard = ({ show }) => {
    const city = show.location.split(",")[0].toLowerCase();
    return (
      <Link href={show.link} key={show.id}>
        <a className="overflow-hidden mx-2 md:mx-0 cursor-pointer group">
          <div className="relative">
            <Image
              src={`/show-art/show${show.id}.png`}
              alt={`${show.location} show`}
              layout="responsive"
              width={400}
              height={400}
              className="w-full h-48 object-cover rounded-lg transition-transform duration-300 ease-in-out group-hover:scale-105"
            />
          </div>
          <div className="p-4 text-center">
            <Link href={`/city/${city}`}>
              <a className="text-2xl md:text-lg mr-3 font-medium text-white hover:text-yellow-500">
                {city.toUpperCase()}
              </a>
            </Link>
            <span className="text-2xl md:text-lg text-gray-400 hover:text-yellow-500">
              {formatDate(show.date).toUpperCase()}
            </span>
          </div>
        </a>
      </Link>
    );
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <header className="max-w-4xl mx-auto rounded-lg p-4 md:p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wider">
          ENTHUSIASTIC PANTHER
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mt-2">
          IS A MADE UP BAND
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-0">
        <h2 className="text-lg md:text-xl font-bold mb-4">LATEST SHOW</h2>

        {/* Latest show section */}
        <section className="relative bg-black rounded-lg overflow-hidden mb-8 flex flex-col md:flex-row group">
          {/* Background with image */}
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-xl scale-110 transition-transform duration-300 ease-in-out group-hover:scale-125"
            style={{
              backgroundImage: `url('/show-art/show${firstShow.id}.png')`,
            }}
          ></div>

          <div className="relative w-full md:w-1/2">
            <Link href={firstShow.link}>
              <a>
                <Image
                  src={`/show-art/show${firstShow.id}.png`}
                  alt="Featured show artwork"
                  layout="responsive"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </a>
            </Link>
          </div>
          <div className="relative p-4 md:p-6 w-full md:w-1/2 bg-transparent bg-opacity-90">
            <p className="text-xl md:text-2xl mb-4">
              <Link
                href={`/city/${firstShow.location.split(",")[0].toLowerCase()}`}
              >
                <a className="text-5xl hover:text-yellow-500">
                  {firstShow.location.toUpperCase()}
                </a>
              </Link>
              <br />
              <Link href={`/show/${firstShow.id}`}>
                <a className="hover:text-yellow-500">{firstShow.date}</a>
              </Link>
            </p>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              <Link href={firstShow.link}>
                <a className="hover:text-yellow-500">SETLIST</a>
              </Link>
            </h3>
            <div className="text-2xl md:text-md">
              {latestSetlist.map((song, index) => (
                <React.Fragment key={index}>
                  <Link href={`/song/${song.id}`}>
                    <a className="hover:text-yellow-500">
                      {song.name.toUpperCase()}{" "}
                      {song.isDebut && <sup>DEBUT</sup>}
                    </a>
                  </Link>
                  {index < latestSetlist.length - 1 && <span> • </span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Recent shows section */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 mt-16">
            RECENT SHOWS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>

        {/* Highly rated shows section */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 mt-16">
            HIGHLY RATED SHOWS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlyRatedShows.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
