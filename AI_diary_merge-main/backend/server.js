const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ CORS와 JSON 파서 설정 (순서 중요)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ uploads 폴더가 없으면 자동 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📂 uploads 폴더 자동 생성됨');
}

// ✅ MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/diary', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ 업로드된 파일 접근 가능하게
app.use('/uploads', express.static(uploadDir));

// ✅ 모델 정의
const Image = mongoose.model('Image', new mongoose.Schema({
  url: String,
  type: { type: String, default: 'original' }, // original / analyzed
  createdAt: { type: Date, default: Date.now }
}));

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
}));

const Diary = mongoose.model('Diary', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  content: String,
  photos: [String],
  keywords: [String],
  emotion: String,
  createdAt: { type: Date, default: Date.now }
}));

// =======================================
// ✅ 이미지 업로드 (URL or base64)
// =======================================
app.post('/api/upload', async (req, res) => {
  try {
    console.log("📥 /api/upload 요청:", Object.keys(req.body));

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "⚠️ 'url' 필드가 비어 있습니다." });
    }

    // base64 → 파일 저장
    if (url.startsWith('data:image')) {
      const base64Data = url.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `upload_${Date.now()}.png`;
      const uploadPath = path.join(uploadDir, fileName);
      fs.writeFileSync(uploadPath, buffer);

      const fileUrl = `http://localhost:3001/uploads/${fileName}`;
      const img = new Image({ url: fileUrl, type: 'original' });
      await img.save();

      console.log(`✅ 저장된 이미지 URL: ${fileUrl}`);
      return res.json({ message: '✅ 업로드 완료 (base64)', img });
    }

    // 단순 URL이면 그대로 저장
    const img = new Image({ url, type: 'original' });
    await img.save();

    console.log(`✅ 저장된 URL: ${url}`);
    res.json({ message: '✅ 업로드 완료 (URL)', img });
  } catch (err) {
    console.error('❌ 업로드 오류:', err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 업로드 이미지 조회
// =======================================
app.get('/api/images', async (req, res) => {
  try {
    const imgs = await Image.find().sort({ createdAt: -1 });
    res.json(imgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 이미지 분석 (테스트용) + 결과 저장
// =======================================
app.post('/api/analyze-image', async (req, res) => {
  try {
    console.log("🧠 /api/analyze-image 요청 body:", Object.keys(req.body));

    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "⚠️ 'imageData'가 비어 있습니다." });
    }

    const analyzedFileName = `analyzed_${Date.now()}.png`;
    const analyzedPath = path.join(uploadDir, analyzedFileName);
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(analyzedPath, Buffer.from(base64Data, 'base64'));

    const analyzedUrl = `http://localhost:3001/uploads/${analyzedFileName}`;

    // DB에 분석 이미지 저장
    const analyzedImage = new Image({ url: analyzedUrl, type: 'analyzed' });
    await analyzedImage.save();

    console.log(`✅ 분석 결과 저장됨: ${analyzedUrl}`);

    res.json({
      message: "✅ AI 분석 완료 및 DB 저장됨",
      keywords: ["Nature", "Travel", "Adventure"],
      analyzedUrl
    });
  } catch (err) {
    console.error("❌ 분석 오류:", err);
    res.status(500).json({ error: "❌ 이미지 분석 실패", details: err.message });
  }
});

// =======================================
// ✅ 회원가입
// =======================================
app.post('/api/register', async (req, res) => {
  try {
    console.log("👤 /api/register 요청:", req.body);

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "⚠️ 누락된 필드가 있습니다." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "이미 등록된 이메일입니다." });

    const user = new User({ username, email, password });
    await user.save();

    console.log(`✅ 사용자 저장됨: ${username} (${email})`);
    res.json({ message: '✅ 사용자 등록 완료', user });
  } catch (err) {
    console.error("❌ 회원가입 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 로그인
// =======================================
app.post('/api/login', async (req, res) => {
  try {
    console.log("🔐 /api/login 요청:", req.body);

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.password !== password) return res.status(401).json({ error: "Invalid password" });

    console.log(`✅ 로그인 성공: ${email}`);
    res.json({ message: "✅ 로그인 성공", user });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 일기 저장
// =======================================
app.post('/api/diary', async (req, res) => {
  try {
    console.log("📔 /api/diary 요청:", req.body);

    const { userId, title, content, photos, keywords, emotion } = req.body;

    // ✅ 핵심: 로그인된 사용자 정보 검증
    if (!userId) {
      return res.status(400).json({ error: "⚠️ userId가 누락되었습니다. 로그인 상태를 확인하세요." });
    }

    // 제목, 내용 검증
    if (!title || !content) {
      return res.status(400).json({ error: "⚠️ 제목과 내용을 입력해야 합니다." });
    }

    const diary = new Diary({ userId, title, content, photos, keywords, emotion });
    await diary.save();

    console.log(`✅ 일기 저장 완료: ${title} (${userId})`);
    res.json({ message: '✅ 일기 저장 완료', diary });
  } catch (err) {
    console.error("❌ 일기 저장 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 특정 사용자(userId)의 일기 목록 조회
// =======================================
app.get('/api/diary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const diaries = await Diary.find({ userId }).sort({ createdAt: -1 });
    res.json(diaries);
  } catch (err) {
    console.error("❌ 일기 조회 오류:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================================
// ✅ 서버 실행
// =======================================
const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
