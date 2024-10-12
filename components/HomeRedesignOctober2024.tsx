// components/HomeRedesignOctober2024.tsx
import Image from 'next/image';
import React from 'react';

export function BandLayout({ latestShows, highlyRatedShows, latestSetlist }) {
  // Separate the first show from the rest
  const [firstShow, ...otherShows] = latestShows;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-bebas-neue">
      <header className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-4 md:p-6 mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-bold tracking-wider">ENTHUSIASTIC PANTHER</h1>
        <p className="text-xl md:text-2xl text-gray-400 mt-2">A MADE UP BAND</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-0">
        <h2 className="text-lg md:text-xl font-bold mb-4">LATEST SHOW</h2>

        {/* Latest show section */}
        <section className="relative bg-black rounded-lg overflow-hidden mb-8 flex flex-col md:flex-row">
          {/* Background with image */}
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-xl scale-110"
            style={{
              backgroundImage: `url('/show-art/show${firstShow.id}.png')`,
            }}
          ></div>

          <div className="relative w-full md:w-1/2">
            <Image
              src={`/show-art/show${firstShow.id}.png`}
              alt="Featured show artwork"
              layout="responsive"
              width={400}
              height={400}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="relative p-4 md:p-6 w-full md:w-1/2 bg-transparent bg-opacity-90">
            <p className="text-xl md:text-2xl mb-4">
              {firstShow.location.toUpperCase()}
              <br />
              {firstShow.date}
            </p>
            <h3 className="text-xl md:text-2xl font-bold mb-2">SETLIST</h3>
            <div className="text-sm md:text-md">
              {latestSetlist.map((song, index) => (
                <React.Fragment key={index}>
                  <span>
                    {song.name.toUpperCase()} {song.isDebut && <sup>DEBUT</sup>}
                  </span>
                  <span>• </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Recent shows section */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 mt-16">RECENT SHOWS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherShows.map((show) => (
              <div key={show.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mx-2 md:mx-0">
                <Image
                  src={`/show-art/show${show.id}.png`}
                  alt={`${show.location} show`}
                  layout="responsive"
                  width={400}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-2xl md:text-xl font-medium">{show.location.toUpperCase()}</p>
                  <p className="text-2xl md:text-lg text-gray-400">{show.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Highly rated shows section */}
        <section>
          <h2 className="text-lg md:text-xl font-bold mb-4 mt-16">HIGHLY RATED SHOWS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlyRatedShows.map((show) => (
              <div key={show.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden mx-2 md:mx-0">
                <Image
                  src={`/show-art/show${show.id}.png`}
                  alt={`${show.location} show`}
                  width={400}
                  height={400}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-md md:text-lg font-medium">{show.location.toUpperCase()}</p>
                  <p className="text-sm md:text-md text-gray-400">{show.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
