/**
 * auth.js
 * 
 * ユーザー認証（新規登録、ログイン、ログアウト）に関連する
 * 全ての処理を担当する専門モジュール。
 * 司令塔(main.js)からの命令を受け、Firebase Authenticationと通信する。
 * 
 * (ログイン任意化対応・最終確定版)
 */

// --- 専門家モジュールのインポート ---
// Firebase Authenticationから必要な関数をインポート
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
// 自分の設定ファイルから、初期化済みの「auth」オブジェクトをインポート
import { auth } from './firebase-config.js'; 
// UI操作を担当するモジュールをインポート
import { ui } from './ui.js';
// Firestore操作を担当するモジュールをインポート
import { firestore } from './firestore.js';


/**
 * 新規登録を処理する関数
 */
async function handleSignup() {
    // uiモジュールに依頼して、フォームから入力値を取得
    const { email, password } = ui.getAuthInput();

    // 入力が空でないかチェック
    if (!email || !password) {
        ui.showAuthError("メールアドレスとパスワードを入力してください。");
        return;
    }

    try {
        // Firebaseに「このメールアドレスとパスワードで新しいユーザーを作成して」と依頼
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("新規登録成功！ User UID:", user.uid);

        // ★重要★ 認証成功後、Firestoreモジュールに「このユーザーの初期データを作って」と依頼
        await firestore.createUserProfile(user.uid, { email: user.email });
        
        // UX向上のため、成功したらuiモジュールに「ログインモーダルを閉じて」と依頼
        ui.closeAuthModal();
        
    } catch (error) {
        // もしエラーが起きたら...
        console.error("新規登録エラー:", error.code, error.message);
        // 分かりやすい日本語のエラーメッセージをuiモジュールに表示依頼
        ui.showAuthError(getFirebaseAuthErrorMessage(error));
    }
}

/**
 * ログインを処理する関数
 */
async function handleLogin() {
    // uiモジュールに依頼して、フォームから入力値を取得
    const { email, password } = ui.getAuthInput();

    // 入力が空でないかチェック
    if (!email || !password) {
        ui.showAuthError("メールアドレスとパスワードを入力してください。");
        return;
    }

    try {
        // Firebaseに「このメールアドレスとパスワードでログインさせて」と依頼
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("ログイン成功！", userCredential.user.email);
        
        // UX向上のため、成功したらuiモジュールに「ログインモーダルを閉じて」と依頼
        ui.closeAuthModal();
        // ログイン成功後のメイン画面への遷移やUI更新は、main.jsのonAuthStateChangedが自動で行う

    } catch (error) {
        // もしエラーが起きたら...
        console.error("ログインエラー:", error.code, error.message);
        // 分かりやすい日本語のエラーメッセージをuiモジュールに表示依頼
        ui.showAuthError(getFirebaseAuthErrorMessage(error));
    }
}

/**
 * ログアウトを処理する関数
 */
async function handleLogout() {
    try {
        // Firebaseに「ログアウトさせて」と依頼
        await signOut(auth);
        console.log("ログアウト成功！");
        // ログアウト後のUI更新は、main.jsのonAuthStateChangedが自動で行う

    } catch (error) {
        console.error("ログアウトエラー:", error.code, error.message);
        // ここではUIにエラー表示をしない（ユーザーが気づきにくいため）
    }
}

/**
 * Firebase Authのエラーコードを日本語のメッセージに変換するヘルパー関数
 * @param {object} error - Firebaseから返されたエラーオブジェクト
 * @returns {string} - ユーザーに表示するためのエラーメッセージ
 */
function getFirebaseAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'メールアドレスの形式が正しくありません。';
        case 'auth/user-not-found':
            return 'このメールアドレスは登録されていません。';
        case 'auth/wrong-password':
            return 'パスワードが間違っています。';
        case 'auth/email-already-in-use':
            return 'このメールアドレスは既に使用されています。';
        case 'auth/weak-password':
            return 'パスワードは6文字以上で入力してください。';
        case 'auth/invalid-login-credentials':
            return 'メールアドレスまたはパスワードが間違っています。';
        default:
            return '認証に失敗しました。時間をおいて再度お試しください。';
    }
}


// --- 司令塔(main.js)から呼び出せるように、各関数をオブジェクトにまとめてエクスポート ---
export const authModule = {
    handleSignup,
    handleLogin,
    handleLogout
};