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
  const songs = await prisma.ep_songs.findMany({
    where: {
      weighting: 100,
    },
    orderBy: {
      id: "desc",
    },
  });

  const latestConcert = await prisma.ep_shows.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const enhancedSongs = await Promise.all(
    songs.map(async (song) => {
      const performances = await prisma.ep_songperformances.findMany({
        where: { songid: song.id },
        orderBy: {
          showid: "asc",
        },
      });

      const totalQuality = performances.reduce(
        (sum, performance) => sum + Number(performance.quality || 0),
        0
      );

      const debutPerformance = performances[0];
      const debutDate = debutPerformance
        ? await prisma.ep_shows.findUnique({
            where: { id: debutPerformance.showid },
          })
        : null;

      const numberOfPerformances = performances.length;
      const avg = totalQuality / numberOfPerformances || 0;
      const lastPerformance = performances[performances.length - 1];
      const currentGap = latestConcert
        ? latestConcert.id - (lastPerformance ? lastPerformance.showid : 0)
        : 0;

      return {
        ...song,
        debutDate: debutDate ? debutDate.date : "N/A",
        avg: avg.toFixed(2),
        performances: numberOfPerformances,
        currentGap,
      };
    })
  );

  return {
    props: { songs: enhancedSongs },
  };
}

export default Home;
