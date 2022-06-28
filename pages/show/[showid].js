import Head from "next/head";
import styles from "../../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const [show, setshow] = useState();
  const router = useRouter();
  const { showid } = router.query; // Destructuring our router object
  
  
  // Function to collect data
  const getApiData = async () => {
    const showResponse = await fetch(      
      "https://lot23.com/play/enthusiasticpanther/json/show.php?showid=" + showid
    ).then((response) => response.json());      
    
    setshow(showResponse);
    console.log(showResponse);
  };
  
  useEffect(() => {
    getApiData();
  }, []);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Enthusiastic Panther is a made-up band</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>enthusiastic panther, your favourite made-up band from New Zealand</header>                                    
      <div className="mt-4">
        
        <p>
        Show #{showid} had these songs:
        </p>
        
        {show &&
        show.map((song) => (
          <span>
          {song.name}{" "}
          </span>
        ))}
        
      </div>
                         
                         
                          

    </div>
  );
}
