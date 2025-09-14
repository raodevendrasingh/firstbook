import { GoogleGenAI } from "@google/genai";
import Exa from "exa-js";

const googleAI = new GoogleGenAI({
	apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const exa = new Exa(process.env.EXASEARCH_API_KEY!);

export { googleAI, exa };
