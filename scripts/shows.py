import requests
import time

def fetch_show(show_number):
    url = f"https://www.enthusiasticpanther.com/show/{show_number}"
    response = requests.get(url)
    
    if response.status_code == 200:
        # Do something with the content, e.g., parse it or analyze it
        print(f"Fetched and processed show {show_number}")
    else:
        print(f"Failed to fetch show {show_number}")

if __name__ == "__main__":
    for i in range(275, 0, -1):  # From 275 to 1
        fetch_show(i)
        time.sleep(1)  # Add a delay to avoid overwhelming the server

