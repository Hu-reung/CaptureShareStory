# ✨ Capture Share Story (CSS)

> 📸 AI 기반 여행 일기 생성 및 공유 플랫폼  
> 사진 업로드 → AI 분석 → 자동 일기 생성 → 출력 및 저장

---

## 🚀 프로젝트 개요

**Capture Share Story**는 AI를 활용해 사용자의 여행 사진을 분석하고,  
감정·장소·키워드에 맞는 감성적인 일기를 자동 생성하는 서비스입니다.  
개인 계정별로 데이터를 관리하며, MongoDB를 통해 기록이 저장됩니다.

---

## 🧩 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 로그인 / 회원가입 | Google 또는 이메일 기반 로그인 |
| 🖼️ 이미지 업로드 | 사진 업로드 시 AI 분석 자동 수행 |
| 🧠 AI 이미지 분석 | 이미지의 분위기와 키워드 자동 추출 |
| 📝 일기 생성 | 분석 결과 기반 자동 일기 생성 및 저장 |
| 📂 대시보드 | 사용자별 일기 목록 조회 |
| 📔 사이드바 | 로그인한 사용자의 일기만 표시 |
| 🖨️ 출력 | 생성된 일기 결과를 인쇄 또는 PDF로 저장 |

---

## 🧱 기술 스택

### ⚙️ Backend
- Node.js + Express
- MongoDB (Mongoose)
- RESTful API
- CORS 설정

### 💻 Frontend
- Next.js (App Router)
- TypeScript + React Hooks
- Tailwind CSS + shadcn/ui
- Lucide Icons
- Google OAuth / Custom Auth

---

## 🗂️ 폴더 구조
<img width="524" height="604" alt="image" src="https://github.com/user-attachments/assets/4408abed-27e7-4f87-b300-e693e867436b" />

---

## 🧠 실행 방법

### 🔹 1. 백엔드 실행
```bash
cd backend
npm install
node server.js

실행 결과
🚀 Server running on http://localhost:3001
✅ MongoDB connected

### 🔹 2. 프론트엔드 실행
cd frontend
npm install
npm run dev

브라우저에서 확인:
👉 http://localhost:3000
