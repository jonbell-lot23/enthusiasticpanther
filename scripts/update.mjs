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

async function calculateAndUpdateShowQuality(showId) {
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
  });

  let totalQuality = 0;

  for (const performance of performances) {
    const songQuality = await calculateHistoricalQuality(performance.songid);
    totalQuality += songQuality;
  }

  const averageQuality = performances.length
    ? Math.floor(totalQuality / performances.length)
    : 0;

  // Update the quality of the show with the calculated average quality
  await prisma.ep_shows.update({
    where: { id: showId },
    data: { quality: averageQuality },
  });

  console.log(
    `Quality score for show ID ${showId} updated to ${averageQuality}`
  );
}

async function main() {
  const shows = await prisma.ep_shows.findMany({
    select: {
      id: true,
    },
  });

  for (const show of shows) {
    await calculateAndUpdateShowQuality(show.id);
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
