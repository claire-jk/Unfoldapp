// 1. 修正匯入：必須包含 getAuth
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 這裡最重要，一定要匯入 auth 模組

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0bY26hq-zioV2-Nc27uzXVd3EJWmnFyw",
  authDomain: "unfoldprofile.firebaseapp.com",
  projectId: "unfoldprofile",
  storageBucket: "unfoldprofile.firebasestorage.app",
  messagingSenderId: "646322965592",
  appId: "1:646322965592:web:95603cf8b871f132094e2d",
  measurementId: "G-9YYSLJNZVS"
};

// 2. 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 3. 正確導出 auth 供其他頁面使用
export const auth = getAuth(app);

export default function FirebaseConfig() { return null; }

// 建議：暫時移除 Analytics，除非你在開發 Web 版，否則 Expo Go 可能會報錯
// const analytics = getAnalytics(app);