import "../styles/globals.css";
import Header from "../components/Header"; // Import the Header component
import Head from "next/head"; // Import Head from next/head

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Header /> {/* Include the Header component */}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
