import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import fetch from "node-fetch";
import { Random } from "random-js";
import crypto from "crypto";

const random = new Random();
const generateRandomValue = () => {
  return parseInt(crypto.randomBytes(4).toString("hex"), 16);
};

const prisma = new PrismaClient();
const resend = new Resend("re_7nsaGUMW_KVKi5vMNmwXgFWxS7QftNfph");

function generateRandomFloat(min, max) {
  const randomValue = generateRandomValue() / 0xffffffff;
  return min + (max - min) * randomValue;
}

async function calculateHistoricalQuality(songId) {
  const performances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
  });

  const totalQuality = performances.reduce(
    (sum, performance) => sum + Number(performance.quality),
    0
  );

  const averageQuality = totalQuality / performances.length;

  let lowerBound = 0; // Default lower bound
  let upperBound = 100; // Default upper bound

  // Apply the range only if the song has been played more than 5 times
  if (performances.length > 5) {
    lowerBound = averageQuality - 10;
    upperBound = averageQuality + 40;
  }

  // Generate a random quality score within the range
  const randomQualityScore = Math.round(
    generateRandomFloat(lowerBound, upperBound)
  );

  // Ensure the quality score is within the range of 0 to 100
  let finalQualityScore = Math.max(0, randomQualityScore);
  finalQualityScore = Math.min(100, finalQualityScore);

  console.log(
    `SongID: ${songId} | Avg: ${averageQuality} | Rand: ${randomQualityScore} | Final score: ${finalQualityScore}`
  );

  return finalQualityScore;
}

async function getPastConcerts(prisma) {
  console.log(`Fetching past concerts`);
  const result = await prisma.ep_shows.findMany({
    orderBy: {
      date: "asc",
    },
    select: {
      location: true,
      date: true,
    },
  });
  console.log(`Finished fetching past concerts`);
  return result
    .map((concert) => `${concert.location}, ${concert.date}`)
    .join("; ");
}

async function getCity(nextCityQuery) {
  const instructions =
    "You are a helpful assistant that helps the band decide where to go next on a tour. The next city should be geographically close to the previous one in the given list of cities. If you've recently left a country, don't return to it. Attempt to create a straight path between cities, rather than going south only to go north again. Avoid suggesting cities that are on different continents or extremely far apart. Please suggest the next city for the tour in the format <City>, <Country>. Never send any information other than that format. For example, San Diego, USA is a good answer. But 'based on your guidelines, I think San Diego, USA is the next stop in your tour' is a bad answer.";

  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: nextCityQuery },
    ],
    max_tokens: 600,
  };

  console.log("Request to OpenAI API:", JSON.stringify(requestBody, null, 2)); // Log the request body

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (
    !data.choices ||
    !data.choices[0].message ||
    !data.choices[0].message.content
  ) {
    console.error("Unexpected response from OpenAI API:", data);
    throw new Error("Unexpected response from OpenAI API");
  }

  return data.choices[0].message.content.trim();
}

async function createNewShow() {
  const prisma = new PrismaClient();

  try {
    // Fetch past concerts
    const pastConcertsList = await getPastConcerts(prisma);

    // Query for the next city
    const nextCityQuery = `These are the venues I've traveled to so far, from oldest to newest. Please suggest a new city to plan in. Don't repeat cities I've been to recently, and if I've recently switched countries, don't return to the previous country until I've visited the rest of the world first. ${pastConcertsList}`;
    const nextCity = await getCity(nextCityQuery);

    // Get the maximum existing ID
    const maxId = await prisma.ep_shows.findFirst({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
      },
    });
    const newId = (maxId ? maxId.id : 0) + 1;

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Insert the new show using the next city and date
    console.log(`Creating new show in: ${nextCity} on ${currentDate}`);
    const result = await prisma.ep_shows.create({
      data: {
        id: newId,
        location: nextCity,
        date: currentDate, // Add the date here
      },
    });
    console.log(
      `Finished creating new show: ${result.location} on ${result.date}`
    );
    return result;
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

async function addSongsToPerformance(songs, showId) {
  try {
    for (const song of songs) {
      // Fetch the latest song performance ID
      const latestPerformance = await prisma.ep_songperformances.findFirst({
        orderBy: { id: "desc" },
      });

      // Increment the latest performance ID by one to create a new unique ID
      const newPerformanceId = latestPerformance
        ? Number(latestPerformance.id) + 1
        : 1;

      await prisma.ep_songperformances.create({
        data: {
          id: newPerformanceId,
          showid: showId,
          songid: song.id,
          quality: song.historicalQuality,
        },
      });
    }
  } catch (err) {
    console.error("An error occurred while adding songs to performance:", err);
  }
}

async function getRandomSongs() {
  const randomSongs = [];
  const usedGaps = new Set();
  const latestConcert = await prisma.ep_shows.findFirst({
    orderBy: { id: "desc" },
  });
  if (!latestConcert) return randomSongs;

  // Fetch new songs and add them to the playlist
  const newSongs = await prisma.ep_songs.findMany({
    where: { id: { gte: 118, lte: 137 } }, // Adjust the range as needed
    orderBy: { id: "asc" },
  });
  for (const song of newSongs) {
    song.historicalQuality = await calculateHistoricalQuality(song.id);
    randomSongs.push(song);
  }

  // If the playlist is not full yet, fill it with old songs
  if (randomSongs.length < 30) {
    const numberOfSongs = 30 - randomSongs.length;
    const oldSongs = await prisma.ep_songs.findMany({
      where: { id: { lt: 118 }, weighting: { not: 0 } }, // Adjust the range as needed
    });

    function calculateThrillFactor(gap) {
      if (gap <= 10) return 0;
      return 6 * Math.log10(gap - 9);
    }

    const shuffledSongs = oldSongs.sort(() => 0.5 - Math.random());

    for (const song of shuffledSongs) {
      if (randomSongs.length >= 30) break;

      const latestPerformance = await prisma.ep_songperformances.findFirst({
        where: { songid: song.id },
        orderBy: { id: "desc" },
      });

      if (!latestPerformance) continue;

      const gap = Number(latestConcert.id) - Number(latestPerformance.showid);
      if (gap < 4 || usedGaps.has(gap)) continue; // Skip if gap is already used

      usedGaps.add(gap); // Add gap to the set of used gaps

      if (randomSongs.some((rSong) => rSong.id === song.id)) continue;

      const thrillFactor = calculateThrillFactor(gap);

      song.historicalQuality = await calculateHistoricalQuality(song.id);
      song.historicalQuality += thrillFactor;
      song.historicalQuality = Math.min(100, song.historicalQuality); // Cap at 100
      song.gap = gap;
      song.thrillFactor = thrillFactor; // Save this for logging

      randomSongs.push(song);
    }
  }

  return randomSongs;
}

async function sendPlaylistByEmail(songs) {
  const playlistHTML = songs
    .map(
      (song) =>
        `<li>${song.name} (${song.historicalQuality}% Gap: ${song.gap})</li>`
    )
    .join("");

  return resend.emails.send({
    from: "onboarding@resend.dev",
    to: "github@lot23.com",
    subject: "🎸 EP email",
    html: `<p>This is an automated message from Enthusiastic Panther</p><ul>${playlistHTML}</ul>`,
  });
}

async function main() {
  const songs = await getRandomSongs();
  let totalPerformanceScore = 0;

  console.log("Playlist:");
  songs.forEach((song) => {
    console.log(
      `* ${song.name} | Avg: ${song.averageQuality} | Rand: ${song.randomQualityScore} | Gap: ${song.gap} | Thrill: ${song.thrillFactor} | Final score: ${song.historicalQuality}`
    );

    totalPerformanceScore += song.historicalQuality;
  });

  const averagePerformanceScore = songs.length
    ? totalPerformanceScore / songs.length
    : 0;
  console.log(`\nAverage Performance Score: ${averagePerformanceScore}`);

  const newShow = await createNewShow();
  console.log(`New show created with ID: ${newShow.id}`);

  await addSongsToPerformance(songs, newShow.id);
  console.log("Songs added to performance successfully!");

  // Update the quality of the new show with the calculated average performance score
  await prisma.ep_shows.update({
    where: { id: newShow.id },
    data: { quality: averagePerformanceScore },
  });
  console.log(
    `Quality score for show ID ${newShow.id} updated to ${averagePerformanceScore}`
  );

  try {
    await sendPlaylistByEmail(songs);
    console.log("Playlist email sent successfully!");
  } catch (err) {
    console.error("An error occurred:", err);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
