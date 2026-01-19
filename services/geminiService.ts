
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function explainRulesAI(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Jawab pertanyaan user tentang aturan komunitas basket Beach Ivory berdasarkan konteks: Aturan denda cancel hari H adalah 25rb (Reguler) / 50rb (Event), biaya main 50rb. Pertanyaan: ${query}`,
      config: {
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    return "Maaf, tanyakan ke admin langsung ya.";
  }
}

export async function generateReminderMessage(name: string, amount: number, isFine: boolean) {
  try {
    const type = isFine ? "denda pembatalan hari H" : "biaya session";
    const prompt = `Buat pesan pengingat pembayaran yang sangat ramah, santai, dan persuasif dalam Bahasa Indonesia untuk member basket Beach Ivory bernama ${name}. 
    Dia belum membayar ${type} sebesar Rp ${amount.toLocaleString()}. 
    Gunakan istilah basket seperti 'rebound', 'slam dunk', atau 'defense'. 
    Sertakan instruksi untuk segera konfirmasi ke bendahara. Maksimal 3 kalimat.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 150,
      }
    });
    return response.text?.trim() || `Halo ${name}, jangan lupa ya untuk menyelesaikan pembayaran ${type} sebesar Rp ${amount.toLocaleString()}. Yuk amankan slotmu!`;
  } catch (error) {
    console.error("Gemini Reminder Error:", error);
    return `Halo ${name}, yuk selesaikan pembayaranmu untuk Beach Ivory!`;
  }
}
