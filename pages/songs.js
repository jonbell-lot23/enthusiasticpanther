import React from "react";
import Head from "next/head";
import { useTable, useSortBy } from "react-table";
import prisma from "/prisma";

function getColor(value, min, max, columnName) {
  if (columnName === "name" || columnName === "debutDate") return "";
  const step = (max - min) / 5;
  if (value <= min + step) return "bg-blue-100";
  if (value <= min + 2 * step) return "bg-blue-100";
  if (value <= min + 3 * step) return "bg-blue-200";
  if (value <= min + 4 * step) return "bg-blue-300";
  return "bg-blue-400";
}

function Home({ songs }) {
  const data = React.useMemo(() => songs, [songs]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Song name",
        accessor: "name",
      },
      {
        Header: "Debut",
        accessor: "debutDate",
      },
      {
        Header: "Score",
        accessor: "avg",
      },
      {
        Header: "Frequency",
        accessor: "performances",
      },
      {
        Header: "Gap",
        accessor: "currentGap",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data }, useSortBy);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Head>
        <title>Enthusiastic Panther Songs</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <table {...getTableProps()} className="min-w-full border border-white">
          <thead className="text-white bg-gray-800">
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="text-center"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-2"
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="text-center">
                  {row.cells.map((cell) => {
                    return (
                      <td
                        {...cell.getCellProps()}
                        className={`px-4 py-2 border border-white ${
                          cell.column.id !== "name" &&
                          cell.column.id !== "debutDate"
                            ? getColor(
                                Number(cell.value),
                                Math.min(
                                  ...data.map((d) => Number(d[cell.column.id]))
                                ),
                                Math.max(
                                  ...data.map((d) => Number(d[cell.column.id]))
                                )
                              )
                            : ""
                        }`}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  // Fetch songs with weighting of 100
  const songs = await prisma.ep_songs.findMany({
    where: { weighting: 100 },
    orderBy: { id: "desc" },
  });

  // Fetch the latest concert
  const latestConcert = await prisma.ep_shows.findFirst({
    orderBy: { date: "desc" },
  });

  // Fetch all performances for the songs
  const performancesData = await prisma.ep_songperformances.findMany({
    where: { songid: { in: songs.map((song) => song.id) } },
    orderBy: { showid: "asc" },
  });

  // Fetch all shows related to the performances
  const showIds = performancesData.map((perf) => perf.showid);
  const shows = await prisma.ep_shows.findMany({
    where: { id: { in: showIds } },
  });

  // Create a map for showId to show for quick lookup
  const showsMap = shows.reduce((acc, show) => {
    acc[show.id] = show;
    return acc;
  }, {});

  // Enhance songs with additional data
  const enhancedSongs = songs.map((song) => {
    const songPerformances = performancesData.filter(
      (perf) => perf.songid === song.id
    );

    const totalQuality = songPerformances.reduce(
      (sum, perf) => sum + (perf.quality || 0),
      0
    );

    const debutPerformance = songPerformances[0];
    const debutDate = debutPerformance
      ? showsMap[debutPerformance.showid]?.date || "N/A"
      : "N/A";

    const numberOfPerformances = songPerformances.length;
    const avgQuality = totalQuality / numberOfPerformances || 0;

    const lastPerformance = songPerformances[songPerformances.length - 1];
    const currentGap = latestConcert
      ? latestConcert.id - (lastPerformance ? lastPerformance.showid : 0)
      : 0;

    return {
      ...song,
      debutDate,
      avg: avgQuality.toFixed(2),
      performances: numberOfPerformances,
      currentGap,
    };
  });

  return { props: { songs: enhancedSongs } };
}

export default Home;
