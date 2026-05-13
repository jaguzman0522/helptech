import json
import os

har_path = r'c:\Users\HDCO-HEALTH\Documents\helpdesk-tech\localhost.har'

with open(har_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

entries = data.get('log', {}).get('entries', [])

print(f"Total entries: {len(entries)}")

for entry in entries:
    request = entry.get('request', {})
    response = entry.get('response', {})
    url = request.get('url', '')
    status = response.get('status', 0)
    method = request.get('method', '')
    
    # Filter for interesting ones or just print first few
    if status >= 400:
        print(f"ERROR: {method} {url} -> {status}")
    
    # Look for console errors if they are somehow logged (rare in HAR but some tools add them)
    # Usually HAR doesn't have console logs unless it's a specialized format.
    
# Let's also check if there are any requests that stayed pending (no response)
# In HAR, they usually have status 0 or are missing.

# Print the last 10 requests to see what was the last thing tried
print("\nLast 10 requests:")
for entry in entries[-10:]:
    url = entry.get('request', {}).get('url', '')
    status = entry.get('response', {}).get('status', 0)
    print(f"{status} - {url}")
