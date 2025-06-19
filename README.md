# 日文 → 中文即時語音翻譯工具

## 使用方式
1. 將本專案上傳至 GitHub
2. 在 Vercel 新建專案並連接 GitHub Repo
3. 在 Vercel 設定環境變數：`OPENAI_API_KEY`
4. 完成部署，點擊開始即可使用麥克風進行日→中翻譯

## 注意事項
- 本工具會擷取麥克風語音並透過 OpenAI API 進行辨識與翻譯
- 不使用 Whisper，完全依賴 GPT-4o 模型辨識與翻譯
