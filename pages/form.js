import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "../styles/Home.module.css";

export default function Home() {
  
  console.log("yo");
  
  useEffect(() => {      
    document.getElementById("mybutton3").focus();
  });
  
  return (

      
            
      <div className="my-4">
       Hello, I am practicing a form.
       <br /><br />
       <button id="mybutton1" className="bg-white rounded-sm p-2 text-black hover:bg-gray-100 mr-4">Title</button>
       
       <button id="mybutton2" className="bg-white rounded-sm p-2 text-black hover:bg-gray-100 mr-4">Title</button>
       
       <button id="mybutton3" className="bg-white rounded-sm p-2 text-black hover:bg-gray-100 mr-4">Title</button>
       
      </div>
    
    

  );
}
