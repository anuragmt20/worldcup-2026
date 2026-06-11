import urllib.request
import json

stadium_pages = {
    "1": "Estadio Azteca",
    "2": "Estadio Akron",
    "3": "Estadio BBVA",
    "4": "AT&T Stadium",
    "5": "NRG Stadium",
    "6": "Arrowhead Stadium",
    "7": "Mercedes-Benz Stadium",
    "8": "Hard Rock Stadium",
    "9": "Gillette Stadium",
    "10": "Lincoln Financial Field",
    "11": "MetLife Stadium",
    "12": "BMO Field",
    "13": "BC Place",
    "14": "Lumen Field",
    "15": "Levi's Stadium",
    "16": "SoFi Stadium"
}

results = {}

for s_id, page in stadium_pages.items():
    encoded_page = urllib.parse.quote(page)
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles={encoded_page}&prop=pageimages&format=json&pithumbsize=800"
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'WorldCupDashboard/1.0 (anuragmt20@gmail.com)'}
    )
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            pages = data.get("query", {}).get("pages", {})
            for pid, pdata in pages.items():
                thumb = pdata.get("thumbnail", {}).get("source")
                if thumb:
                    results[s_id] = thumb
                    print(f"Success for {page}: {thumb}")
                else:
                    print(f"No image found for {page}")
    except Exception as e:
        print(f"Error for {page}: {e}")

with open("stadium_images.json", "w") as f:
    json.dump(results, f, indent=2)
print("Finished writing to stadium_images.json")
