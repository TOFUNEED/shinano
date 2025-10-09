/**
 * firebase-config.js
 * 
 * Firebaseプロジェクトへの接続設定と、各種サービスの初期化を行います。
 * このファイルはアプリケーション内で最初に読み込まれ、
 * 他のモジュール（auth.js, firestore.jsなど）に初期化済みの
 * Firebaseサービス（auth, db）を提供します。
 * 
 * 最新のFirebase SDK v9 (モジュール形式) に対応しています。
 */

// Firebase SDKから、アプリケーションの初期化に必要な関数をインポートします。
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

// 使用するFirebaseの各サービス（認証、データベース）から、
// それぞれのサービスを取得するための関数をインポートします。
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";


// --------------------------------------------------------------------
//  ▼▼▼ Firebaseプロジェクトの設定オブジェクト ▼▼▼
//  Firebaseコンソールの[プロジェクトの設定]から取得した情報です。
// --------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAKqmEgddMFk9i08mrk_KrkxbND3ER3nxI",
  authDomain: "tofuneed-shinano.firebaseapp.com",
  projectId: "tofuneed-shinano",
  storageBucket: "tofuneed-shinano.appspot.com",
  messagingSenderId: "824106490413",
  appId: "1:824106490413:web:4be11920d93d3332e676a4",
  measurementId: "G-EKSG0RCQS7"
};
// --------------------------------------------------------------------
//  ▲▲▲ ここまでがプロジェクト固有の設定です ▲▲▲
// --------------------------------------------------------------------


// 上記の設定情報を使用して、Firebaseアプリケーションを初期化します。
const app = initializeApp(firebaseConfig);

// 初期化されたアプリケーションインスタンスから、
// 認証サービスとFirestoreデータベースへの参照を取得します。
const auth = getAuth(app);
const db = getFirestore(app);

// 初期化が完了したことをコンソールに出力して確認します。
console.log("Firebase (v9) has been initialized successfully.");


// --- 他のファイル (auth.js, firestore.jsなど) から参照できるように、---
// --- auth と db をエクスポートします。                             ---
export { auth, db };