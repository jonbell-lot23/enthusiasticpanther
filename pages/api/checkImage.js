import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const showId = req.query.showId;
  const imagePath = path.join(
    process.cwd(),
    "public",
    "show-art",
    `show${showId}.png`
  );

  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(200).json({ exists: false });
    } else {
      res.status(200).json({ exists: true });
    }
  });
}
