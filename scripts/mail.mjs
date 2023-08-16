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

async function createNewShow(location = "Wellington, NZ") {
  // Fetch the latest show ID
  const latestShow = await prisma.ep_shows.findFirst({
    orderBy: { id: "desc" },
  });

  // Increment the latest show ID by one to create a new unique ID
  const newShowId = latestShow ? Number(latestShow.id) + 1 : 1;

  // Get the current date and format it as YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  // Create the new show with the generated ID and formatted date
  return await prisma.ep_shows.create({
    data: {
      id: newShowId,
      location: location,
      quality: 100,
      date: formattedDate, // Assuming the field name is 'date' in the database
    },
  });
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
    console.log(
      `Latest performance for song ID ${song.id}:`,
      latestPerformance
    );

    console.log(
      `Latest performance showid for song ${song.name}: ${latestPerformance.showid}`
    );

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
