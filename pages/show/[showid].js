import Head from "next/head";
import styles from "../../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

function Page({ data }) {
  
  console.log("loading...");
  console.log(data);
  
  // Render data...
  return (
  
  <div>hi</div>
  
  );
}

// This gets called on every request
export async function getServerSideProps() {
  
  // const router = useRouter();
  // const { showid } = router.query; // Destructuring our router object
  
  
  
  // Fetch data from external API
  const res = await fetch("https://lot23.com/play/enthusiasticpanther/json/show.php?showid=100");
  const data = await res.json()

  console.log("loading...");

  // Pass data to the page via props
  return { props: { data } }
}

export default Page