# requirements: pip install requests
import requests
import os

AMAD_CLIENT_ID = os.environ.get("AMADEUS_CLIENT_ID")
AMAD_CLIENT_SECRET = os.environ.get("AMADEUS_CLIENT_SECRET")

# 1) OAuth2 토큰 획득
def get_token():
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    data = {"grant_type":"client_credentials", "client_id":AMAD_CLIENT_ID, "client_secret":AMAD_CLIENT_SECRET}
    r = requests.post(url, data=data)
    r.raise_for_status()
    return r.json()["access_token"]

# 2) Flight Offers Search (간단한 예: ICN -> PAR)
def search_flights(token, origin="ICN", dest="CDG", depart="2025-10-10", ret="2025-10-20", adults=1):
    url = "https://test.api.amadeus.com/v2/shopping/flight-offers"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "originLocationCode": origin,
        "destinationLocationCode": dest,
        "departureDate": depart,
        "returnDate": ret,
        "adults": adults,
        "max": 5
    }
    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()
    return r.json()

if __name__ == "__main__":
    token = get_token()
    results = search_flights(token)
    # 결과를 정규화/요약해서 LLM에 전달하거나 프론트엔드에 보냄
    print(results)
