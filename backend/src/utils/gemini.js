const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini Utility for Sentence Framing
 */
class GeminiUtility {
    constructor() {
        this.genAI = null;
        this.model = null;
    }

    /**
     * Lazy initialization of the Gemini API
     */
    init() {
        if (this.genAI) return true;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            console.warn("⚠️ GEMINI_API_KEY is not set or still uses the placeholder.");
            return false;
        }

        try {
            // Explicitly set apiVersion to v1 to avoid v1beta 404s common with some keys
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
            return true;
        } catch (error) {
            console.error("❌ Gemini Initialization Error:", error.message);
            return false;
        }
    }

    /**
     * Takes an array of sign language words and frames them into a natural sentence.
     * @param {string[]} words - Array of detected words
     * @returns {Promise<string>} - Framed sentence
     */
    async frameSentence(words) {
        if (!this.init()) return words.join(" ");
        if (!words || words.length === 0) return "";

        const prompt = `You are a translator for Sign Language. I will give you a list of words that were recognized from gestures. 
        Please frame them into a natural, grammatically correct, and polite sentence. 
        If the words already make sense, just fix the punctuation and capitalization. 
        Words: ${words.join(", ")}
        Return ONLY the framed sentence, nothing else.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            
            return text;
        } catch (error) {
            console.error("Gemini API Error:", error.message);
            
            // If 404, specifically try gemini-pro or flash-latest
            if (error.message.includes("404") || error.message.includes("not found")) {
                const alternateModels = ["gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
                for (const modelName of alternateModels) {
                    try {
                        console.log(`🔄 Retrying with ${modelName}...`);
                        const fallbackModel = this.genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });
                        const result = await fallbackModel.generateContent(prompt);
                        const response = await result.response;
                        return response.text().trim();
                    } catch (fallbackError) {
                        console.error(`Gemini Fallback (${modelName}) Error:`, fallbackError.message);
                    }
                }
            }
            
            return words.join(" ");
        }
    }
}

module.exports = new GeminiUtility();
