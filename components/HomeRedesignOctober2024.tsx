'use client'

import Image from 'next/image'
import prisma from "../prisma";
import ShowCard from "../components/ShowCard";
import React from "react";
import NodeCache from "node-cache";

export function BandLayout() {
  const recentShows = [
    { city: 'Portland', date: 'OCT 5' },
    { city: 'San Francisco', date: 'OCT 4' },
    { city: 'Los Angeles', date: 'OCT 3' },
    { city: 'Las Vegas', date: 'OCT 2' },
    { city: 'Phoenix', date: 'OCT 1' },
    { city: 'Denver', date: 'SEP 29' },
    { city: 'Dallas', date: 'SEP 27' },
    { city: 'Chicago', date: 'SEP 25' },
    { city: 'New York', date: 'SEP 23' },
    { city: 'Boston', date: 'SEP 21' },
    { city: 'Miami', date: 'SEP 19' },
    { city: 'Atlanta', date: 'SEP 17' },
  ]

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-bebas-neue">
      <header className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-wider">ENTHUSIASTIC PANTHER</h1>
        <p className="text-2xl text-gray-400 mt-2">A MADE UP BAND</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <section className="bg-purple-900 rounded-lg overflow-hidden mb-8 flex">
          <div className="w-1/2">
            <Image
              src="/show-art/show324.png"
              alt="Featured show artwork"
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="w-1/2 p-6">
            <h2 className="text-3xl font-bold mb-2">LATEST SHOW</h2>
            <p className="text-2xl mb-4">SEATTLE, USA<br />OCTOBER 6, 2024</p>
            <h3 className="text-2xl font-bold mb-2">SETLIST</h3>
            <ul className="text-lg">
              <li>REPORTING LIVE</li>
              <li>FOUR TURTLES</li>
              <li>CRANBERRY CRYSTALS</li>
              <li>BOOKSHELF</li>
              <li>PATRICK SWAYZE</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4">RECENT SHOWS</h2>
          <div className="grid grid-cols-3 gap-4">
            {recentShows.map((show, index) => (
              <div key={show.city} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={`/show-art/show324.png`}
                  alt={`${show.city} show`}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover m-6"
                />
                <div className="p-4">
                  <p className="text-lg font-medium">{show.city.toUpperCase()}</p>
                  <p className="text-md text-gray-400">{show.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}