import google.generativeai as genai
import os
import sys
from PIL import Image

# Configure the Gemini API with your key
try:
    api_key = os.environ["GEMINI_API_KEY"]
except KeyError:
    print("Error: GEMINI_API_KEY environment variable not set.")
    print("Please set it to your Google AI Studio API key.")
    sys.exit(1)

genai.configure(api_key=api_key)

def extract_text_from_image(image_path):
    """
    Uses the Gemini API to extract text from a single image file.
    """
    try:
        img = Image.open(image_path)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(["You are an expert image to text AI model, give accurate and correct text only result from the image", img])
        if response.parts:
            return response.parts[0].text
        else:
            return response.text if hasattr(response, 'text') else "No text found or error in processing."
    except Exception as e:
        return f"An error occurred: {e}"

# def process_image_folder(folder_path, output_file, output_file):
def process_image_folder(folder_path, output_file):
    """
    Processes all images in a folder, writes extracted Unicode to text file.
    """
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp']

    if not os.path.isdir(folder_path):
        print(f"Error: The folder '{folder_path}' does not exist.")
        return
        
    # Check if the path has images or not.
    files = os.listdir(folder_path)
    has_images = any(os.path.splitext(f)[1].lower() in image_extensions for f in files)
    # print("Image cheker testing",has_images)
    if not has_images:
        print("The folder does not have any images.")
        return
    
    # Step 1: Extract text and write to the standard Unicode output file
    print(f"Processing images in: {folder_path}")
    print(f"Unicode output will be saved to: {output_file}")
    full_unicode_text = []

    with open(output_file, 'w', encoding='utf-8') as f:
        for filename in sorted(os.listdir(folder_path)):
            if any(filename.lower().endswith(ext) for ext in image_extensions):
                image_path = os.path.join(folder_path, filename)
                print(f"  - Processing {filename}...")

                extracted_text = extract_text_from_image(image_path)
                
                output_chunk = f"--- Text from: {filename} ---\n{extracted_text}\n\n{'='*80}\n\n"
                f.write(output_chunk)
                full_unicode_text.append(output_chunk)
                print(f"    ...Done.")

    print("Unicode text extraction complete.")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        folder_to_process = sys.argv[1]
    else:
        folder_to_process = '.'
        print("No folder path provided. Defaulting to the current directory.")

    # Define output file paths
    base_dir = os.path.dirname(folder_to_process) or '.'
    output_file_path = os.path.join(base_dir, 'output.txt')

    process_image_folder(folder_to_process, output_file_path)

