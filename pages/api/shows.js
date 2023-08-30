import prisma from "../../prisma";

export default async function handler(req, res) {
  let latestShows = await prisma.ep_shows.findMany({
    orderBy: { id: "desc" },
    take: 8,
  });

  let top20Shows = await prisma.ep_shows.findMany({
    orderBy: { quality: "desc" },
    take: 20,
  });

  const shuffledTop20Shows = top20Shows.sort(() => 0.5 - Math.random());
  const highlyRatedShows = shuffledTop20Shows.slice(0, 8);

  await prisma.$disconnect();

  res.status(200).json({ latestShows, highlyRatedShows });
}
