# Sajilo Type

Extract text from images using Google Gemini AI. Point it at a folder of images and get a single `output.txt` with all the extracted text.

## Requirements

```
google-generativeai
Pillow
```

Install with:

```
pip install -r requirements.txt
```

## Setup

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/) and set it as an environment variable:

```bash
# Linux / macOS
export GEMINI_API_KEY=your_key_here

# Windows
set GEMINI_API_KEY=your_key_here
```

## Usage

**Python:**
```bash
python transcribe.py /path/to/images
```

**Windows batch file:**
```bash
run.bat /path/to/images
```

If no path is given, defaults to the current directory.

Output is saved as `output.txt` in the parent directory of the folder you pass in.

## Supported Formats

`.jpg` `.jpeg` `.png` `.bmp` `.gif` `.webp`
