import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

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

async function getRandomSongs() {
  // Store the random songs
  const randomSongs = [];

  // Get the latest concert ID
  const latestConcert = await prisma.ep_shows.findFirst({
    orderBy: { id: "desc" },
  });
  if (!latestConcert) return randomSongs;

  // Determine the number of songs to fetch (between 11 and 15)
  const numberOfSongs = Math.floor(Math.random() * 5) + 11;

  // Fetch songs with bandid = 1 and weighting != 0
  const songs = await prisma.ep_songs.findMany({
    where: { bandid: 1, weighting: { not: 0 } },
  });

  // Shuffle the songs
  const shuffledSongs = songs.sort(() => 0.5 - Math.random());

  for (const song of shuffledSongs) {
    if (randomSongs.length >= numberOfSongs) break;

    // Calculate the gap
    const latestPerformance = await prisma.ep_songperformances.findFirst({
      where: { songid: song.id },
      orderBy: { id: "desc" },
    });

    if (!latestPerformance) continue;

    const gap = BigInt(latestConcert.id) - BigInt(latestPerformance.showid);

    // Ensure the gap is at least 4
    if (gap < 4) continue;

    // Ensure that the song is unique
    if (randomSongs.some((rSong) => rSong.id === song.id)) continue;

    // Add historical quality and gap to the song
    song.historicalQuality = await calculateHistoricalQuality(song.id);
    song.gap = gap; // Add the gap to the song object
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
