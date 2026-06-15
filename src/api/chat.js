import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;
    
    // Fadlan hubi in KEY-gaaga uu yahay mid sax ah
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI-gu wuu ka jawaabi waayay" });
  }
}
