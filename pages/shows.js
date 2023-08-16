import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { PrismaClient } from "@prisma/client";

function Show(props) {
  let bgcolor;
  if (!props.avg) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-black p-1 pl-0 float-left";
  } else if (props.avg > 65) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-green-500 p-1 pl-0 float-left";
  } else if (props.avg > 52) {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-gray-800 p-1 pl-0 float-left";
  } else {
    bgcolor =
      "item-container rounded-md mr-4 ml-0 text-red-400 p-1 pl-0 float-left";
  }

  const showid = "show/" + props.showid;

  return (
    <div>
      <Link href={showid}>
        <div className={bgcolor}>
          <div className="cursor-pointer hover:bg-gray-100">
            {props.location}
          </div>
        </div>
      </Link>
    </div>
  );
}

function Home({ shows }) {
  return (
    <div className={styles.container}>
      <div className="container">
        <Head>
          <title>Enthusiastic Panther Shows!</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <header>
          Enthusiastic Panther, your favorite made-up band from New Zealand
        </header>
        <div className="my-4">
          <ul>
            <li>
              <Link href="songs/">
                <a>list of songs</a>
              </Link>
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
            {shows &&
              shows.map((show) => (
                <Show
                  location={show.location}
                  avg={show.quality}
                  showid={show.id}
                />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const prisma = new PrismaClient();

  const shows = await prisma.ep_shows.findMany({
    orderBy: {
      id: "desc",
    },
  });

  // Log the results to the console
  console.log("Shows data:", shows);

  // Check if the shows array is empty
  if (shows.length === 0) {
    console.log("No shows found in the database.");
  }

  // Close the database connection
  await prisma.$disconnect();

  return { props: { shows } };
}

export default Home;
