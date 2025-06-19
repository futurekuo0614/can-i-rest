// /api/translate.js
export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const { type, audioBase64, japanese } = await req.json();

  let apiUrl, apiBody;
  if (type === "transcribe") {
    apiUrl = "https://api.openai.com/v1/audio/transcriptions";
    apiBody = JSON.stringify({
      model: "gpt-4o",
      prompt: "請將以下語音內容辨識為日文文字",
      audio: audioBase64,
      response_format: "text"
    });
  } else if (type === "translate") {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    apiBody = JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "你是一個專業的日文到中文即時口譯。" },
        { role: "user", content: `請將下列日文翻譯成中文：\n${japanese}` }
      ],
      temperature: 0.2
    });
  } else {
    res.status(400).json({ error: "Invalid type" });
    return;
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: apiBody
  });

  const data = await response.json();
  res.status(200).json(data);
}
