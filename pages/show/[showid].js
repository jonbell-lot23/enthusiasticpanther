import Head from "next/head";
import styles from "../../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

function Song(props) {
  return (
    <>
      <div className="w-96 columns-2">
        <div className="w-96">{props.name}</div>
        <div className="text-right">{props.quality}</div>
      </div>
    </>
  );
}

function Page({ data }) {
  console.log("loading...");
  // console.log(data);

  // Render data...
  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Shows</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header>
          Enthusiastic Panther, your favourite made-up band from New Zealand
        </header>
        <div className="my-4">
          <ul>
            <li>
              <Link href="songs/">
                <a>list of songs</a>
              </Link>{" "}
            </li>
            <li>
              <Link href="shows/">
                <a className="text-white bg-blue-900">recent shows</a>
              </Link>
            </li>
          </ul>
        </div>

        <main className="mb-12">
          <div className="app">
            {data &&
              data.map((song) => (
                <Song name={song.name} quality={song.quality} />
              ))}
          </div>
        </main>
      </div>

      <style jsx>{`
        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{``}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();
  const showId = Number(context.query.showid);

  // Fetch the song performances for the given show ID
  const performances = await prisma.ep_songperformances.findMany({
    where: { showid: showId },
  });

  // Map the performances into the desired format for the page
  const data = await Promise.all(
    performances.map(async (performance) => {
      // Fetch song details for each performance
      const song = await prisma.ep_songs.findUnique({
        where: { id: performance.songid },
      });

      return {
        name: song.name,
        quality: performance.quality,
      };
    })
  );

  await prisma.$disconnect();

  return { props: { data } };
}

export default Page;
