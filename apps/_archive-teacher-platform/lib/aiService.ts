// lib/aiService.ts

// 1. PASTE YOUR KEY HERE
const API_KEY = 'AIzaSyB7PFd24PFfhJTwKIbVHeVgKiPdT50btwY'; 

// 2. We are using the model found in your list: 'gemini-2.0-flash'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export const sendMessageToAI = async (userMessage: string) => {
  try {
    console.log("Sending message to Gemini 2.0 Flash...");

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: userMessage } 
          ]
        }]
      }),
    });

    const data = await response.json();

    // Log the result
    console.log("Gemini Response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API Error:", data.error.message);
      return `Error: ${data.error.message}`;
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!answer) {
      return "I got a response, but it was empty. Try again.";
    }

    return answer;

  } catch (error) {
    console.error("Network Error:", error);
    return "Network error. Please check your internet.";
  }
};