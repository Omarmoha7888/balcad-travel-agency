import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const { prompt } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  res.status(200).json({ text });
}

