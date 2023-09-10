import React from "react";
export default function About() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full max-w-2xl p-4 mx-auto prose prose-lg bg-white rounded-lg shadow-lg">
        <h1 className="mb-6 text-4xl ">About Enthusiastic Panther</h1>

        <p>
          I have a lot of explaining to do, don't I? I should explain what in
          the world a make-believe band is. I should explain why I'm doing it.
          And I should explain why it's so dang fun!
        </p>

        <p>
          But the thing is, I've written those posts before. Multiple times, in
          fact! The best place to start is here:
        </p>

        <a
          className="text-blue-500 underline"
          href="https://jonbell.medium.com/an-open-letter-to-my-weirdo-friends-i-made-a-make-believe-band-399a4619ae59"
          target="_blank"
          rel="noopener noreferrer"
        >
          An Open Letter to My Weirdo Friends: I Made a Make-Believe Band
        </a>

        <p>
          That's long, but it explains the motivations and excitement. If you
          read that, you have everything you need. I'll recap those details
          later, but you can start there to get a head start.
        </p>

        <p>
          And then there are four more posts you could read if you want to learn
          more:
        </p>

        <ul className="list-disc list-inside">
          <li>
            <a
              className="text-blue-500 underline"
              href="https://jonbell.medium.com/my-make-believe-band-is-on-tour-e90b681c314a"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Make-Believe Band is On Tour
            </a>
          </li>
          <li>
            <a
              className="text-blue-500 underline"
              href="https://jonbell.medium.com/designing-a-concert-playlist-popularity-algorithm-70deab44e9cd"
              target="_blank"
              rel="noopener noreferrer"
            >
              Designing a Concert Playlist Popularity Algorithm
            </a>
          </li>
          <li>
            <a
              className="text-blue-500 underline"
              href="https://jonbell.medium.com/i-am-excited-about-this-pattern-ea297bb0cbf?source=your_stories_page-------------------------------------"
              target="_blank"
              rel="noopener noreferrer"
            >
              I Am Excited About This Pattern
            </a>
          </li>
          <li>
            <a
              className="text-blue-500 underline"
              href="https://jonbell.medium.com/pattern-making-ac2936f96bc9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visualising the Performances of Invented Songs
            </a>
          </li>
        </ul>
        <p>That should be enough to get started!</p>
      </div>
    </div>
  );
}
