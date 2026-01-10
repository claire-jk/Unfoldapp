import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// 1. 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyB0bY26hq-zioV2-Nc27uzXVd3EJWmnFyw",
  authDomain: "unfoldprofile.firebaseapp.com",
  projectId: "unfoldprofile",
  storageBucket: "unfoldprofile.firebasestorage.app",
  messagingSenderId: "646322965592",
  appId: "1:646322965592:web:95603cf8b871f132094e2d",
  measurementId: "G-9YYSLJNZVS"
};

// 2. 初始化 Firebase 實例
const app = initializeApp(firebaseConfig);

// 3. 匯出給其他頁面使用的實例 (注意：不要在這裡 import 自己)
export const auth = getAuth(app);
export const db = getFirestore(app);

// 預設匯出 (選用)
export default app;