import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  // Get the total count of songs with bandid = 1
  const totalSongs = await prisma.ep_songs.count({
    where: { bandid: 1 },
  });

  // Determine the number of songs to fetch (between 11 and 15)
  const numberOfSongs = Math.floor(Math.random() * 5) + 11;

  // Store the random songs
  const randomSongs = [];

  for (let i = 0; i < numberOfSongs; i++) {
    // Generate a random index
    const randomIndex = Math.floor(Math.random() * totalSongs);

    // Fetch a random song with bandid = 1 using the "skip" argument
    const randomSong = await prisma.ep_songs.findFirst({
      skip: randomIndex,
      where: { bandid: 1 },
    });

    // Ensure that the song is unique
    if (!randomSongs.some((song) => song.id === randomSong.id)) {
      // Add historical quality to the song
      randomSong.historicalQuality = await calculateHistoricalQuality(
        randomSong.id
      );
      randomSongs.push(randomSong);
    } else {
      i--; // Decrement counter to try again
    }
  }

  return randomSongs;
}

async function main() {
  const songs = await getRandomSongs();
  let totalPerformanceScore = 0;

  console.log("Playlist:");
  songs.forEach((song) => {
    console.log(`* ${song.name} (${song.historicalQuality})`);
    totalPerformanceScore += song.historicalQuality;
  });

  const averagePerformanceScore = totalPerformanceScore / songs.length;
  console.log(`\nAverage Performance Score: ${averagePerformanceScore}`);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
