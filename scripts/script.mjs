import { PrismaClient } from "@prisma/client";

async function findLongestAndShortestSongs() {
  const prisma = new PrismaClient();

  try {
    const songs = await prisma.ep_songs.findMany({
      where: {
        name: {
          not: "NULL",
        },
        standard_duration: {
          gt: 0,
        },
      },
      orderBy: {
        standard_duration: "asc",
      },
    });

    const shortestSongs = songs.slice(0, 5).map((song) => ({
      name: song.name,
      duration: song.standard_duration / 60,
    }));
    const longestSongs = songs.slice(-5).map((song) => ({
      name: song.name,
      duration: song.standard_duration / 60,
    }));

    console.log("5 shortest songs:", shortestSongs);
    console.log("5 longest songs:", longestSongs);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

findLongestAndShortestSongs();
