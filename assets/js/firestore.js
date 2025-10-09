/**
 * firestore.js
 * 
 * Firebase Firestoreデータベースとの全てのやり取りを担当する専門モジュール。
 * 司令塔(main.js)や認証担当(auth.js)からの命令を受け、以下の役割を担う。
 * 
 * 1. 新規ユーザーのプロフィールデータ（器）を作成する
 * 2. ログインボーナスをチェックし、条件を満たせばコイン数を更新する
 * 3. (将来機能) 着せ替えテーマの購入処理や、ユーザー設定の保存など
 * 
 * (最終確定版)
 */

// --- 専門家モジュールのインポート ---
// Firestoreから必要な関数 (ドキュメントの参照、作成、取得、更新) をインポート
import { doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
// 自分の設定ファイルから、初期化済みの「db」オブジェクトをインポート
import { db } from './firebase-config.js'; 
// UI操作を担当するモジュールをインポート
import { ui } from './ui.js';


/**
 * 新規ユーザーのプロフィールデータをFirestoreに作成する関数
 * (auth.jsの新規登録成功時に呼び出される)
 * @param {string} uid - 新規登録したユーザーのID
 * @param {object} userData - 保存するユーザーデータ (例: { email: '...' })
 */
async function createUserProfile(uid, userData) {
    // 'users'というコレクションの中に、ユーザーIDと同じ名前のドキュメントへの参照を作成
    const userDocRef = doc(db, 'users', uid);

    try {
        // setDocを使って、ドキュメントに初期データを書き込む
        await setDoc(userDocRef, {
            email: userData.email,
            tofuCoin: 0,           // 初期コインは0枚
            lastLoginDate: null,   // 初回ログインボーナスを必ず付与するためnullに設定
            createdAt: new Date(), // アカウント作成日時を記録
            currentTheme: 'default'// (将来機能) デフォルトの着せ替えテーマ
        });
        console.log("Firestoreにユーザープロファイルを作成しました:", uid);
    } catch (error) {
        console.error("ユーザープロファイル作成エラー:", error);
        // このエラーはユーザーには直接見せない (バックグラウンドのエラーのため)
    }
}

/**
 * ログインボーナスを処理する関数
 * (main.jsのログイン検知時に呼び出される)
 * @param {string} uid - ログインしたユーザーのID
 */
async function handleLoginBonus(uid) {
    // ログインしたユーザーのドキュメントへの参照を作成
    const userDocRef = doc(db, 'users', uid);
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"形式の今日の日付

    try {
        // getDocを使って、データベースからユーザーデータを取得
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // まず、現在のコイン数をUIに表示するよう命令
            ui.updateCoinDisplay(userData.tofuCoin);

            // 最後にボーナスを受け取った日付と今日の日付を比較
            if (userData.lastLoginDate !== today) {
                // --- 日付が違う場合 (ボーナス付与) ---
                const newCoinTotal = (userData.tofuCoin || 0) + 10;

                // updateDocを使って、データベースのコイン数と最終ログイン日を更新
                await updateDoc(userDocRef, {
                    tofuCoin: newCoinTotal,
                    lastLoginDate: today
                });
                
                console.log('ログインボーナスを付与しました！');
                
                // UIモジュールに、ポップアップ表示とコイン数表示の更新を命令
                ui.showBonusPopup(10);
                ui.updateCoinDisplay(newCoinTotal);

            } else {
                // --- 日付が同じ場合 (ボーナスなし) ---
                console.log('本日のログインボーナスは既に付与されています。');
            }
        } else {
            // このエラーは、認証後にDB作成が失敗した場合など、稀なケースで発生
            console.error("Firestoreにユーザーデータが見つかりません:", uid);
        }
    } catch (error) {
        console.error("ログインボーナス処理エラー:", error);
    }
}


// --- 司令塔(main.js)や認証担当(auth.js)から呼び出せるように、各関数をエクスポート ---
export const firestore = {
    createUserProfile,
    handleLoginBonus
};