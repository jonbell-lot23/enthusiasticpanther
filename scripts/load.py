import requests
import time

# Maximum number of each type of item to fetch
MAX_SHOWS = 285  
MAX_HISTOGRAMS = 285
MAX_SONGS = 137

# Batch size
BATCH_SIZE = 10

def fetch_item(base_url, item_number):
    url = f"{base_url}{item_number}"  # Removed the extra space
    response = requests.get(url)

    if response.status_code == 200:
        print(f"Fetched and processed {url}")
    else:
        print(f"Failed to fetch {url}")

if __name__ == "__main__":
    show_counter = MAX_SHOWS
    histogram_counter = MAX_HISTOGRAMS
    song_counter = MAX_SONGS

    while show_counter > 0 or histogram_counter > 0 or song_counter > 0:
        # Fetch shows
        for _ in range(BATCH_SIZE):
            if show_counter <= 0:
                break
            fetch_item("https://www.enthusiasticpanther.com/show/", show_counter)
            show_counter -= 1
            time.sleep(1)

        # Fetch histograms
        for _ in range(BATCH_SIZE):
            if histogram_counter <= 0:
                break
            fetch_item("https://www.enthusiasticpanther.com/histogram/", histogram_counter)
            histogram_counter -= 1
            time.sleep(1)

        # Fetch songs
        for _ in range(BATCH_SIZE):
            if song_counter <= 0:
                break
            fetch_item("https://www.enthusiasticpanther.com/song/", song_counter)
            song_counter -= 1
            time.sleep(1)

