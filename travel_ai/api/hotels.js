// api/hotels.js
import crypto from "node:crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { city = "TYO", checkin, checkout } = req.query;

  try {
    // Hotelbeds Signature 생성
    const ts = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash("sha256")
      .update(`${process.env.HOTELBEDS_API_KEY}${process.env.HOTELBEDS_SECRET}${ts}`)
      .digest("hex");

    const url = new URL("https://api.test.hotelbeds.com/hotel-api/1.0/hotels");
    url.searchParams.set("destinationCode", city);
    url.searchParams.set("checkIn", checkin);
    url.searchParams.set("checkOut", checkout);
    url.searchParams.set("occupancies", "1");

    const hotelRes = await fetch(url, {
      headers: {
        "Api-key": process.env.HOTELBEDS_API_KEY,
        "X-Signature": signature,
        Accept: "application/json",
      },
    });

    const hotels = await hotelRes.json();
    if (!hotelRes.ok) throw new Error(hotels?.error?.message || "Hotelbeds 검색 실패");

    res.status(200).json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message || "서버 오류" });
  }
}
