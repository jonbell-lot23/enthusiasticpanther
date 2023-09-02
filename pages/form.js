import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../styles/Home.module.css";

export default function Home() {
  useEffect(() => {
    document.getElementById("mybutton3").focus();
  });

  return (
    <div className="my-4">
      Hello, I am practicing a form.
      <br />
      <br />
      <button
        id="mybutton1"
        className="p-2 mr-4 text-black bg-white rounded-sm hover:bg-gray-100"
      >
        Title
      </button>
      <button
        id="mybutton2"
        className="p-2 mr-4 text-black bg-white rounded-sm hover:bg-gray-100"
      >
        Title
      </button>
      <button
        id="mybutton3"
        className="p-2 mr-4 text-black bg-white rounded-sm hover:bg-gray-100"
      >
        Title
      </button>
    </div>
  );
}
