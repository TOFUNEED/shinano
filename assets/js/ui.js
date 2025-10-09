/**
 * ui.js
 * 
 * ユーザーインターフェース（画面表示）の操作を全て担当する専門モジュール。
 * このファイルはDOM（HTML要素）に直接アクセスし、見た目を変更する。
 * 他のモジュール（main, auth, firestoreなど）は、このファイルに画面の変更を依頼する。
 * 
 * (ログイン任意化対応・最終確定版)
 */

// --- DOM要素のキャッシュ ---
// 頻繁にアクセスするHTML要素を、起動時に一度だけ取得して変数に入れておく。
// これにより、処理のたびにHTML内を探し回る必要がなくなり、パフォーマンスが向上する。
const mainScreen = document.getElementById('main-screen');
const authModal = document.getElementById('auth-modal');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('auth-error');
const coinDisplay = document.getElementById('coin-display');
const bonusPopup = document.getElementById('bonus-popup');
const stationNameElement = document.getElementById('station-name');
const nextTrainCard = document.querySelector('.next-train');
const followingTrainCard = document.querySelector('.following-train');
const userArea = document.getElementById('user-area');
const guestArea = document.getElementById('show-login-modal-button');
const userInfo = document.getElementById('user-info');


// --- UI操作を行う関数群 ---

/**
 * ログイン状態に応じてUI（主にヘッダー）を更新する
 * @param {object|null} user - Firebaseのユーザーオブジェクト (ログインしていなければnull)
 */
function updateUserUI(user) {
    if (user) {
        // ログインしている場合: ゲスト用ボタンを隠し、ユーザー情報エリアを表示
        guestArea.classList.add('hidden');
        userInfo.classList.remove('hidden');
    } else {
        // ゲストの場合: ユーザー情報エリアを隠し、ゲスト用ボタンを表示
        userInfo.classList.add('hidden');
        guestArea.classList.remove('hidden');
    }
}

/**
 * ログイン/新規登録モーダルを開く
 */
function openAuthModal() {
    authError.classList.add('hidden'); // エラーメッセージをリセット
    authModal.classList.remove('hidden');
}

/**
 * ログイン/新規登録モーダルを閉じる
 */
function closeAuthModal() {
    authModal.classList.add('hidden');
}

/**
 * 認証フォームから入力されたメールアドレスとパスワードを取得する
 * @returns {{email: string, password: string}}
 */
function getAuthInput() {
    return {
        email: emailInput.value,
        password: passwordInput.value
    };
}

/**
 * 認証エラーメッセージを表示する
 * @param {string} message - 表示するエラーメッセージ
 */
function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

/**
 * ログインボーナスのポップアップを表示する
 * @param {number} amount - 獲得したコインの量
 */
function showBonusPopup(amount) {
    const popupContent = bonusPopup.querySelector('.popup-content');
    popupContent.innerHTML = `<h2>ログインボーナス！</h2><p>+${amount} TOFUコイン GET！</p>`;
    bonusPopup.classList.remove('hidden');
    // 3秒後に自動でポップアップを閉じる
    setTimeout(() => {
        bonusPopup.classList.add('hidden');
    }, 3000);
}

/**
 * 画面上のコイン保有数を更新する
 * @param {number} totalCoins - 表示する合計コイン数
 */
function updateCoinDisplay(totalCoins) {
    if(coinDisplay) {
        coinDisplay.textContent = `${totalCoins} コイン`;
    }
}

/**
 * ヘッダーに表示する駅名を更新する
 * @param {string} stationName - 表示する駅名
 */
function updateStationName(stationName) {
    if (stationNameElement) {
        stationNameElement.textContent = `${stationName}駅`;
    }
}

/**
 * 時刻表カードの内容を更新する
 * @param {object|null} nextTrain - 次の電車の情報
 * @param {object|null} followingTrain - 次々の電車の情報
 */
function updateTimetable(nextTrain, followingTrain) {
    if (nextTrain) {
        nextTrainCard.querySelector('.time').textContent = nextTrain.time;
        nextTrainCard.querySelector('.destination').textContent = `${nextTrain.type} ${nextTrain.destination}行き`;
    } else {
        nextTrainCard.querySelector('.time').textContent = '--:--';
        nextTrainCard.querySelector('.destination').textContent = '本日の列車は終了しました';
    }

    if (followingTrain) {
        followingTrainCard.querySelector('.time').textContent = followingTrain.time;
        followingTrainCard.querySelector('.destination').textContent = `${followingTrain.type} ${followingTrain.destination}行き`;
    } else {
        followingTrainCard.querySelector('.time').textContent = '--:--';
        followingTrainCard.querySelector('.destination').textContent = '';
    }
}

/**
 * ローディング表示を行う（将来的な機能）
 * @param {string} message - 表示するメッセージ
 */
function showLoading(message) {
    console.log("UI: ローディング表示 -", message);
}

/**
 * ローディング表示を隠す
 */
function hideLoading() {
    console.log("UI: ローディング非表示");
}

/**
 * 一般的なエラーメッセージを表示する
 * @param {string} message - 表示するメッセージ
 */
function showError(message) {
    console.error("UI Error:", message);
    alert(message); // とりあえずalertで代用
}


// --- 最後に、定義した全ての関数を一つのオブジェクトにまとめてエクスポート ---
export const ui = {
    updateUserUI,
    openAuthModal,
    closeAuthModal,
    getAuthInput,
    showAuthError,
    showBonusPopup,
    updateCoinDisplay,
    updateStationName,
    updateTimetable,
    showLoading,
    hideLoading,
    showError
};