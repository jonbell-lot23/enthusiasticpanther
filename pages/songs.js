import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../styles/Home.module.css";

function Song(props) {
  if (props.avg > 65) {
    var bgcolor =
      "item-container rounded-md mr-4 ml-0 text-green-500 p-1 pl-0 float-left";
    var bgcolor2 = "bg-red-400";
  } else if (props.avg > 45) {
    var bgcolor =
      "item-container rounded-md mr-4 ml-0 text-gray-800 p-1 pl-0 float-left";
    var bgcolor2 = "bg-red-400";
  } else if (props.avg < 46) {
    var bgcolor =
      "item-container rounded-md mr-4 ml-0 text-red-400 p-1 pl-0 float-left";
    var bgcolor2 = "bg-red-400";
  }
  return (
    <div className={bgcolor}>
      <div>{props.name}</div>
    </div>
  );
}

export default function Home() {
  const [shows, setshows] = useState();
  const [songs, setsongs] = useState();

  // Function to collect data
  const getApiData = async () => {
    const songResponse = await fetch(
      "https://lot23.com/play/enthusiasticpanther/json/9-connect.php"
    ).then((response) => response.json());
    setsongs(songResponse);

    const showResponse = await fetch(
      "https://lot23.com/play/enthusiasticpanther/json/10-shows.php"
    ).then((response) => response.json());
    setshows(showResponse);
  };

  useEffect(() => {
    getApiData();
  }, []);

  return (
    
    <div className={styles.container}>
   
    <div className="container">
      <Head>
        <title>Enthusiastic Panther Songs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

 <header>enthusiastic panther, your favourite made-up band from New Zealand</header>                                    
      <div className="my-4">
        <ul>
        <li><Link href="songs/">
           <a className="bg-blue-900 text-white">list of songs</a>
         </Link> </li> 
        <li>
        <Link href="shows/">
           <a>recent shows</a>
         </Link>         
        </li>
        </ul>
      </div>
      
      <main className="mb-12">

        <div className="app">

          {songs &&
            songs.map((song) => (
              <Song name={song.name} avg={Number(song.avg).toFixed()} />
            ))}
        </div>
      </main>

      </div>

      <style jsx>{`
        


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

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
