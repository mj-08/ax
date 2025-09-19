// api/flights.js
export default async function handler(req, res) {
  // CORS 허용 (GitHub Pages에서 호출 가능하도록)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { origin, destination, departDate, returnDate } = req.query;

  try {
    // 1) Amadeus 토큰 발급
    const tokenRes = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_API_KEY}&client_secret=${process.env.AMADEUS_API_SECRET}`,
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.error_description || "Amadeus 토큰 실패");

    // 2) 항공 검색
    const url = new URL("https://test.api.amadeus.com/v2/shopping/flight-offers");
    url.searchParams.set("originLocationCode", origin);
    url.searchParams.set("destinationLocationCode", destination);
    url.searchParams.set("departureDate", departDate);
    url.searchParams.set("returnDate", returnDate);
    url.searchParams.set("adults", "1");
    url.searchParams.set("currencyCode", "KRW");
    url.searchParams.set("max", "3");

    const flightRes = await fetch(url, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const flights = await flightRes.json();
    if (!flightRes.ok) throw new Error(flights?.errors?.[0]?.detail || "Amadeus 항공 검색 실패");

    res.status(200).json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message || "서버 오류" });
  }
}
