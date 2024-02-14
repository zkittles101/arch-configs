
import subprocess
import os
import string

try:
    import requests
    import re
    from mutagen.easyid3 import EasyID3
    from mutagen.id3 import APIC, ID3
    import ipywidgets as widgets

except ImportError:
    !pip install requests --quiet
    !pip install re --quiet
    !pip install mutagen --quiet
    !pip install ipywidgets --quiet
    # //after installation
    import requests
    import re
    from mutagen.easyid3 import EasyID3
    from mutagen.id3 import APIC, ID3
    import ipywidgets as widgets

def returnSPOT_ID(link):
        # # The 'returnSPOT_ID' function from your scraper code

        # Define the regular expression pattern for the Spotify playlist URL
        pattern = r"https://open\.spotify\.com/playlist/([a-zA-Z0-9]+)\?si=.*"

        # Try to match the pattern in the input text
        match = re.match(pattern, link)

        if not match:
            return False
        return True


# variables
CWD = os.getcwd()
LOCATION = os.path.join(CWD,'MUSIC')
if os.path.isdir(LOCATION)==False:
    os.mkdir(LOCATION)

from IPython.display import display, HTML, Javascript, Audio

import IPython

# Custom CSS styles
custom_css = HTML("""
<style>
    .input-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 10px;
    }
    .input-field {
        flex: 1;
        padding: 5px;
        font-size: 14px;
        border: 2px solid #007BFF;
        border-radius: 5px;
    }
    .submit-button {
        background-color: #007BFF;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    .submit-button:hover {
        background-color: #0056b3;
    }
</style>
""")

# Function to handle button click event
def handle_link_button_click(b):
    global SPOTIFY_PLAYLIST_LINK
    # Get the link from the input field
    if returnSPOT_ID(link_input.value) :
        SPOTIFY_PLAYLIST_LINK = link_input.value
         # Display the entered link as a clickable HTML link
        display(HTML(f"Playlist Link Entered : <a href='{SPOTIFY_PLAYLIST_LINK}' target='_blank'>{SPOTIFY_PLAYLIST_LINK}</a>"))

        # Store the entered link as a global variable
        IPython.get_ipython().run_line_magic('store', 'SPOTIFY_PLAYLIST_LINK')
    else:
        print('[*] Something Not Right about that link...  Try Again Please..')



# Create a text input widget for entering the link
link_input = widgets.Text(placeholder="Enter a link")

# Create a button widget
link_button = widgets.Button(description="Submit Link")

# Attach the button click event handler
link_button.on_click(handle_link_button_click)

print('[*] Please Enter Spotify Playlist Link :')
# Display the custom CSS styles, input field, and button
# display(custom_css)
display(widgets.VBox([link_input, link_button]))
