<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Schedule Map - AI-Powered Schedule Analyzer

This contains everything you need to run your schedule mapping application locally with AI insights.

## Features

- CSV schedule processing with AI analysis
- Attendance data correlation and mapping
- AI-powered insights, optimization suggestions, and attendance predictions
- Modern responsive UI with enhanced error handling
- Robust API retry logic for reliable AI processing

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Get your Gemini API key from: https://makersuite.google.com/app/apikey
   - Update the `VITE_GEMINI_API_KEY` in `.env` with your actual API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
