const OPENAI_API_KEY = process.env.OPENAI_API_KEY || window.OPENAI_API_KEY || "";

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let transcript = "";
let lastSentence = "";

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const subtitlesDiv = document.getElementById('subtitles');

startBtn.onclick = async () => {
  if (!OPENAI_API_KEY) {
    alert("請設定 OPENAI_API_KEY（Vercel 環境變數）");
    return;
  }
  startBtn.disabled = true;
  stopBtn.disabled = false;
  subtitlesDiv.innerText = "開始錄音...";
  transcript = "";
  audioChunks = [];
  isRecording = true;
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start(400); // 0.4 秒

  mediaRecorder.ondataavailable = async (e) => {
    if (!isRecording) return;
    audioChunks.push(e.data);
    if (audioChunks.length >= 1) { // 0.4秒
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];
      await processAudio(audioBlob);
    }
  };
};

stopBtn.onclick = () => {
  isRecording = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  mediaRecorder?.stop();
};

async function processAudio(audioBlob) {
  const base64 = await blobToBase64(audioBlob);
  const speechText = await fetchTranscriptionFromOpenAI(base64);
  if (!speechText) return;

  transcript += speechText;
  // 修正：正則表達式不能換行
  let sentences = transcript.split(/[。！？\n]/g).filter(Boolean);
  if (sentences.length > 1) {
    let latestSentence = sentences.slice(-2, -1)[0];
    const translated = await translateToChinese(latestSentence);
    subtitlesDiv.innerText += "\n" + translated;
    lastSentence = sentences[sentences.length - 1];
    transcript = lastSentence;
  }
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

async function fetchTranscriptionFromOpenAI(audioBase64) {
  try {
    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        prompt: "請將以下語音內容辨識為日文文字",
        audio: audioBase64,
        response_format: "text"
      })
    });
    const data = await resp.json();
    return data.text || "";
  } catch (e) {
    console.error(e);
    return "";
  }
}

async function translateToChinese(japanese) {
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "你是一個專業的日文到中文即時口譯。" },
          { role: "user", content: `請將下列日文翻譯成中文：\n${japanese}` }
        ],
        temperature: 0.2
      })
    });
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (e) {
    console.error(e);
    return "";
  }
}

