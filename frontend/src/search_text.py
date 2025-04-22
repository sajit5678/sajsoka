# import os

# def search_word_in_files(folder_path, search_word):
    # # Loop through all files in the folder and subfolders
    # for root, _, files in os.walk(folder_path):
        # for file in files:
            # file_path = os.path.join(root, file)
            
            # try:
                # # Open the file and read its content
                # with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    # content = f.read()
                    # # Check if the search word is in the file content
                    # if search_word in content:
                        # print(f"Found in: {file_path}")
            # except Exception as e:
                # print(f"Error reading file {file_path}: {e}")

# # Define the folder path and the search word
# folder_path = os.getcwd() # Replace this with the path to your folder
# search_word = 'com.google.cardboard.sdk.uxragl.UxrAglCtrl'

# # Call the function
# search_word_in_files(folder_path, search_word)




import os
import re

def search_word_in_files(folder_path, search_word):
    for root, dirs, files in os.walk(folder_path):  # Walk through all directories and subdirectories
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:  # Open each file in read mode
                    contents = f.read()
                    if re.search(rf'\b{re.escape(search_word)}\b', contents):  # Search for the word
                        print(f"Found '{search_word}' in: {file_path}")
            except (UnicodeDecodeError, PermissionError):
                print(f"Could not read {file_path}")

# Set the folder path to the current directory and call the function
folder_path = os.getcwd()  # Sets the folder path to the current directory
search_word = input("Enter text: ") #'className="unchecked"'

# Call the function
search_word_in_files(folder_path, search_word)
