import Subnav from "../../components/Subnav";
 import { Bar } from "react-chartjs-2";
 import "chart.js/auto";
 const prisma = new PrismaClient();

 const HistogramPage = ({ songsData, showId }) => {
 @@ -90,57 +91,66 @@ const HistogramPage = ({ songsData, showId }) => {
   );
 };

 export async function getServerSideProps(context) {
   try {
     const showId = Number(context.params.showid);

     const performances = await prisma.ep_songperformances.findMany({
       where: { showid: showId },
     });

     if (!performances) {
       console.error("Error fetching performances.");
       return { props: { songsData: [], showId: null } };
     }

     const songsData = await Promise.all(
       performances.map(async (performance) => {
         const song = await prisma.ep_songs.findUnique({
           where: { id: performance.songid },
         });

         const album = song?.album || "";

         const previousPerformances = await prisma.ep_songperformances.findMany({
           where: { songid: performance.songid, showid: { lt: showId } },
           orderBy: { showid: "asc" },
         });

         const debutShow = previousPerformances.length
           ? previousPerformances[0].showid
           : showId;

         return {
           name: song?.name || "Unknown Song",
           album: album,
           debutShow: debutShow,
           currentShow: showId,
         };
       })
     );

     await prisma.$disconnect();

     return {
       props: {
         songsData,
         showId,
       },
     };
   } catch (error) {
     console.error("An error occurred during data fetching:", error);
     return { props: { songsData: [], showId: null } };
   }
 }

 export default HistogramPage;