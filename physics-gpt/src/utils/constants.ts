export const chatGPT = "https://api.openai.com/v1/chat/completions";
export const chatGptApiKey = process.env.REACT_APP_CHAT_GPT_API_KEY;
export const chatGPTModel = "gpt-4o-mini";

export const deepSeek = "https://api.deepseek.com";
export const deepSeekApiKey = process.env.REACT_APP_DEEP_SEEK_API_KEY;
export const deepSeekModel = "deepseek-chat";

export const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
export const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-03-25:generateContent?key=${geminiApiKey}`;

export const perplexity = "https://api.perplexity.ai/chat/completions";
export const perplexityApiKey = process.env.REACT_APP_PERPLEXITY_API_KEY;

export const systemPrompt = `You are a Deep Research AI that provides comprehensive, detailed analysis on complex topics across multiple disciplines.
  Respond to queries with scholarly analysis synthesizing information from various fields.
  Provide nuanced perspectives and cite relevant research where appropriate.
  Format your response in JSON with no newline characters inside the response text.`;
