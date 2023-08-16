import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import fetch from "node-fetch";

const prisma = new PrismaClient();
const resend = new Resend("re_7nsaGUMW_KVKi5vMNmwXgFWxS7QftNfph");

async function calculateHistoricalQuality(songId) {
  const performances = await prisma.ep_songperformances.findMany({
    where: { songid: songId },
  });

  const totalQuality = performances.reduce(
    (sum, performance) => sum + Number(performance.quality),
    0
  );

  const averageQuality = totalQuality / performances.length;

  return Math.floor(averageQuality);
}

async function getPastConcerts(prisma) {
  console.log(`Fetching past concerts`);
  const result = await prisma.ep_shows.findMany({
    orderBy: {
      date: "desc",
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

async function getTranslation(summaryText) {
  const instructions =
    "You are a helpful assistant that helps the band decide where to go next on a tour. Pick cities that are a reasonable distance from the previous show and that I haven't been to recently. Big cities are usually better. Only ever respond with a city and country. Nothing else.";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: summaryText },
      ],
      max_tokens: 60,
    }),
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
    const nextCityQuery = `These are the venues I've traveled to so far. Please suggest the next city for the tour in the format <City>, <Country>. For example, San Diego, USA. ${pastConcertsList}`;
    const nextCity = await getTranslation(nextCityQuery);

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

    // Insert the new show using the next city
    console.log(`Creating new show in: ${nextCity}`);
    const result = await prisma.ep_shows.create({
      data: {
        id: newId,
        location: nextCity,
        // Add other fields as needed
      },
    });
    console.log(`Finished creating new show: ${result.location}`);
    return result;
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

async function addSongsToPerformance(songs, showId) {
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
        showid: showId, // Now showId is an integer
        songid: song.id,
        quality: song.historicalQuality,
      },
    });
  }
}

async function getRandomSongs() {
  const randomSongs = [];
  const latestConcert = await prisma.ep_shows.findFirst({
    orderBy: { id: "desc" },
  });
  if (!latestConcert) return randomSongs;

  const numberOfSongs = Math.floor(Math.random() * 5) + 11;
  const songs = await prisma.ep_songs.findMany({
    where: { weighting: { not: 0 } },
  });

  const shuffledSongs = songs.sort(() => 0.5 - Math.random());

  for (const song of shuffledSongs) {
    if (randomSongs.length >= numberOfSongs) break;

    const latestPerformance = await prisma.ep_songperformances.findFirst({
      where: { songid: song.id },
      orderBy: { id: "desc" },
    });

    if (!latestPerformance) continue;
    /* console.log(
      `Latest performance for song ID ${song.id}:`,
      latestPerformance
    );*/

    /* console.log(
      `Latest performance showid for song ${song.name}: ${latestPerformance.showid}`
    ); */

    const gap = Number(latestConcert.id) - Number(latestPerformance.showid);

    if (gap < 4) continue;

    if (randomSongs.some((rSong) => rSong.id === song.id)) continue;

    song.historicalQuality = await calculateHistoricalQuality(song.id);
    song.gap = gap;
    randomSongs.push(song);
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
    console.log(`* ${song.name} (${song.historicalQuality}% Gap: ${song.gap})`);
    totalPerformanceScore += song.historicalQuality;
  });

  const averagePerformanceScore = totalPerformanceScore / songs.length;
  console.log(`\nAverage Performance Score: ${averagePerformanceScore}`);

  const newShow = await createNewShow();
  // console.log(`New show created with ID: ${newShow.id}`);

  await addSongsToPerformance(songs, newShow.id);
  // console.log("Songs added to performance successfully!");

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
