/**
 * main.js
 * 
 * アプリケーション全体のエントリーポイント（司令塔）。
 * 各モジュール（専門家）をインポートし、以下の役割を担う。
 * 
 * 1. アプリケーションの初期化
 * 2. ユーザーの認証状態（ログイン/ゲスト）を常に監視
 * 3. 認証状態に応じて、UIの表示を切り替えたり、専門処理を呼び出す
 * 4. ユーザー操作（クリックなど）のイベントリスナーをセットアップし、
 *    各専門モジュールに対応する処理を命令する。
 * 
 * (ログイン任意化対応・最終確定版)
 */

// --- 専門家モジュールのインポート ---
// Firebaseから「認証状態の変更を監視する」関数をインポート
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
// 自分の設定ファイルから、初期化済みの「auth」オブジェクトをインポート
import { auth } from './firebase-config.js'; 
// 各専門モジュールをインポート
import { ui } from './ui.js';
import { authModule } from './auth.js';
import { firestore } from './firestore.js';
import { timetable } from './timetable.js';


// --- アプリケーションの起動 ---
// HTMLの読み込みが完了した瞬間に、initializeApp関数を実行する
document.addEventListener('DOMContentLoaded', initializeApp);


/**
 * アプリケーションを初期化するメイン関数
 */
function initializeApp() {
    console.log('しなの鉄道アプリ、起動開始...');
    
    // ステップ1: ログイン状態に関わらず、常に時刻表の初期化を試みる
    timetable.init(); 
    
    // ステップ2: 認証状態の監視を開始する
    setupAuthListener();
    
    // ステップ3: クリックなどのユーザー操作を待ち受ける準備をする
    setupEventListeners();
}

/**
 * Firebaseの認証状態の変化を監視するリスナーをセットアップする。
 * ログイン、ログアウト、初回起動時に自動で呼び出される。
 */
function setupAuthListener() {
    onAuthStateChanged(auth, user => {
        // UIモジュールに、現在のユーザー状態に合わせた画面表示を命令
        ui.updateUserUI(user);

        if (user) {
            // --- ユーザーがログインしている場合の処理 ---
            console.log('ログイン状態:', user.email);
            
            // Firestoreモジュールに、ログインボーナスのチェックと付与を命令
            firestore.handleLoginBonus(user.uid);
            
            // TODO: ユーザーの着せ替え設定を読み込む処理を後で追加
            // firestore.loadUserTheme(user.uid);

        } else {
            // --- ユーザーがログインしていない（ゲスト）場合の処理 ---
            console.log('ゲスト状態です');
            // ゲストは何もしない
        }
    });
}

/**
 * アプリ内のクリックイベントなどを監視するリスナーをまとめてセットアップする
 */
function setupEventListeners() {
    console.log('イベントリスナーをセットアップ中...');

    // --- 各ボタン要素を取得 ---
    const signupButton = document.getElementById('signup-button');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const showLoginModalButton = document.getElementById('show-login-modal-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const tabs = document.querySelector('.tabs');

    // --- イベントリスナーを登録 ---
    // 新規登録ボタンが押されたら...
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            // authモジュールに新規登録処理を命令
            authModule.handleSignup();
        });
    }

    // ログインボタンが押されたら...
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            // authモジュールにログイン処理を命令
            authModule.handleLogin();
        });
    }

    // ログアウトボタンが押されたら...
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // authモジュールにログアウト処理を命令
            authModule.handleLogout();
        });
    }

    // 「ログイン/新規登録」ボタンが押されたら...
    if (showLoginModalButton) {
        showLoginModalButton.addEventListener('click', () => {
            // uiモジュールにモーダル表示を命令
            ui.openAuthModal();
        });
    }

    // モーダルの閉じるボタンが押されたら...
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            // uiモジュールにモーダルを閉じるよう命令
            ui.closeAuthModal();
        });
    }
    
    // 方面切り替えタブが押されたら...
    if (tabs) {
        tabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('tab-button')) {
                const direction = event.target.dataset.direction;
                // uiモジュールにタブの見た目切り替えを命令
                // TODO: ui.switchTab(event.target);
                // timetableモジュールに時刻表の再表示を命令
                timetable.displayCurrentTimetable(direction);
            }
        });
    }
}