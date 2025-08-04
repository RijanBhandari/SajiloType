import { getApiKey } from './apiKey';

const API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';
const VISION_MODEL = 'gemini-1.5-flash-latest';
const TEXT_MODEL = 'gemini-1.5-flash-latest';


// Function to convert image to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
});


export const generateOcrTranscript = async (imageFile: File) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('API key not found');
    }

    const base64Image = await toBase64(imageFile);

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: "Perform OCR on this image. The text is in Nepali or English. Provide only the transcript."
                    },
                    {
                        inline_data: {
                            mime_type: imageFile.type,
                            data: base64Image
                        }
                    }
                ]
            }
        ]
    };

    const response = await fetch(`${API_BASE_URL}${VISION_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to generate OCR transcript');
    }

    const data = await response.json();
    // Extract text from the response
    return data.candidates[0].content.parts[0].text;
};

export const correctTranscript = async (transcript: string) => {
    const apiKey = await getApiKey();
    if (!apiKey) {
        throw new Error('API key not found');
    }

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: `Check and correct spelling and errors in the following transcript. Provide only the corrected transcript as output.\n\nTranscript:\n${transcript}`
                    }
                ]
            }
        ]
    };

    const response = await fetch(`${API_BASE_URL}${TEXT_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || 'Failed to correct transcript');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

