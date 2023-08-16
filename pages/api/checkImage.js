import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const showId = req.query.showId;
  const imagePath = path.join(
    process.cwd(),
    "public",
    `show-art/show${showId}.png`
  );

  if (fs.existsSync(imagePath)) {
    res.status(200).json({ exists: true });
  } else {
    res.status(200).json({ exists: false });
  }
}
