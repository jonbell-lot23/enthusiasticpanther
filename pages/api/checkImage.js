export default function handler(req, res) {
  const showId = parseInt(req.query.showId, 10);

  if (showId <= 73 || (showId >= 213 && showId <= 219)) {
    res.status(200).json({ exists: true });
  } else {
    res.status(200).json({ exists: false });
  }
}
