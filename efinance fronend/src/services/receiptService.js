import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with API key from environment
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

/**
 * Scan Receipt using Google Gemini AI
 * @param {File} file - The receipt image file
 * @returns {Promise<Object>} - Extracted receipt data
 */
export async function scanReceipt(file) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file');
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      throw new Error('File size must be less than 4MB');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number, no currency symbols)
      - Date (in YYYY-MM-DD format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: Food, Transport, Housing, Utilities, Entertainment, Healthcare, Other)
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "YYYY-MM-DD",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If this is not a receipt or you cannot extract the information, return:
      {
        "error": "Not a valid receipt or unable to extract information"
      }
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to extract JSON
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      
      // Check if there's an error in the response
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate required fields
      if (!data.amount || !data.date || !data.description) {
        throw new Error('Unable to extract required information from receipt');
      }

      // Format the response
      return {
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || 'Receipt purchase',
        category: data.category || 'Other',
        merchantName: data.merchantName || 'Unknown Store'
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      console.error('Raw response:', text);
      throw new Error('Invalid response format from AI. Please try again.');
    }
  } catch (error) {
    console.error('Error scanning receipt:', error);
    
    // Handle specific error types
    if (error.message.includes('API key')) {
      throw new Error('AI service configuration error. Please contact support.');
    }
    
    if (error.message.includes('quota') || error.message.includes('limit')) {
      throw new Error('AI service temporarily unavailable. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to scan receipt. Please try again.');
  }
}

/**
 * Validate receipt file before processing
 * @param {File} file - The file to validate
 * @returns {boolean} - Whether the file is valid
 */
export function validateReceiptFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file (JPG, PNG, etc.)');
  }

  if (file.size > 4 * 1024 * 1024) {
    throw new Error('File size must be less than 4MB');
  }

  return true;
}
