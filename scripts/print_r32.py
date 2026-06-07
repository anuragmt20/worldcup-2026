import json

with open('2026/football.matches.json', 'r', encoding='utf-8') as f:
    matches = json.load(f)

print("--- ROUND OF 32 ---")
r32 = [m for m in matches if m.get('type') == 'r32']
for m in r32:
    print(f"Match {m['id']}: Home=\"{m.get('home_team_label')}\", Away=\"{m.get('away_team_label')}\"")
