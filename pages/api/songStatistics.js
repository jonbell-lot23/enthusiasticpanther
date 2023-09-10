import prisma from "/prisma"; // Adjust the import path according to your project structure

export default async (req, res) => {
  if (req.method === "GET") {
    if (req.query.songId) {
      // Case: Detailed statistics for a specific song
      const songId = Number(req.query.songId);

      // Fetch the song details
      const songDetails = await prisma.ep_songs.findUnique({
        where: { id: songId },
      });

      // Fetch the song performances
      const songPerformances = await prisma.ep_songperformances.findMany({
        where: { songid: songId },
        orderBy: { id: "desc" },
      });

      // Your logic to calculate detailed statistics for this song
      // For example, let's calculate the average score for this song
      const totalQuality = songPerformances.reduce(
        (sum, performance) => sum + Number(performance.quality || 0),
        0
      );
      const avgScore = totalQuality / songPerformances.length || 0;

      res.status(200).json({
        song: {
          ...songDetails,
          avgScore: avgScore.toFixed(2),
        },
      });
    } else {
      // Case: General statistics for all songs

      // Fetch all songs
      const songs = await prisma.ep_songs.findMany({
        where: {
          weighting: 100,
        },
        orderBy: {
          id: "desc",
        },
      });

      // Your logic to calculate statistics for all songs
      // For example, let's calculate the average score for each song
      const enhancedSongs = await Promise.all(
        songs.map(async (song) => {
          const performances = await prisma.ep_songperformances.findMany({
            where: { songid: song.id },
          });

          const totalQuality = performances.reduce(
            (sum, performance) => sum + Number(performance.quality || 0),
            0
          );

          const avg = totalQuality / performances.length || 0;

          return {
            ...song,
            avg: avg.toFixed(2),
          };
        })
      );

      res.status(200).json({ songs: enhancedSongs });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};
