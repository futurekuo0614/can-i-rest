let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let transcript = "";
let lastSentence = "";

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const subtitlesDiv = document.getElementById('subtitles');

startBtn.onclick = async () => {
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
  const speechText = await fetchTranscriptionFromProxy(base64);
  if (!speechText) return;

  transcript += speechText;
  let sentences = transcript.split(/[。！？\n]/g).filter(Boolean);
  if (sentences.length > 1) {
    let latestSentence = sentences.slice(-2, -1)[0];
    const translated = await translateToChineseProxy(latestSentence);
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

