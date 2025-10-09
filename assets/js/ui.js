/**
 * ui.js
 * 
 * ユーザーインターフェース（画面表示）の操作を全て担当する専門モジュール。
 */

// --- DOM要素のキャッシュ ---
const stationNameElement = document.getElementById('station-name');
const nextTrainCard = document.querySelector('.train-card.next-train');
const followingTrainCard = document.querySelector('.train-card.following-train');
const guestArea = document.getElementById('show-login-modal-button');
const userInfo = document.getElementById('user-info');
const authModal = document.getElementById('auth-modal');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authError = document.getElementById('auth-error');
const coinDisplay = document.getElementById('coin-display');
const bonusPopup = document.getElementById('bonus-popup');

/**
 * ログイン状態に応じてUI（主にヘッダー）を更新する
 * @param {object|null} user - Firebaseのユーザーオブジェクト (ログインしていなければnull)
 */
function updateUserUI(user) {
    if (user) {
        guestArea.classList.add('hidden');
        userInfo.classList.remove('hidden');
    } else {
        userInfo.classList.add('hidden');
        guestArea.classList.remove('hidden');
        updateCoinDisplay(0); // ログアウト時はコイン表示をリセット
    }
}

/**
 * ログイン/新規登録モーダルを開く
 */
function openAuthModal() {
    authError.classList.add('hidden');
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
        email: emailInput.value.trim(),
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
    setTimeout(() => {
        bonusPopup.classList.add('hidden');
    }, 3000);
}

/**
 * 画面上のコイン保有数を更新する
 * @param {number} totalCoins - 表示する合計コイン数
 */
function updateCoinDisplay(totalCoins) {
    if (coinDisplay) {
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
 * @param {string} direction - 現在の方面 ('up' or 'down')
 */
function updateTimetable(nextTrain, followingTrain, direction) {
    const destinationText = direction === 'up' ? '軽井沢方面' : '長野方面';

    if (nextTrain) {
        nextTrainCard.querySelector('.time').textContent = nextTrain.time;
        nextTrainCard.querySelector('.destination').textContent = `${destinationText}行き`;
        nextTrainCard.querySelector('.countdown').classList.remove('hidden');
    } else {
        nextTrainCard.querySelector('.time').textContent = '--:--';
        nextTrainCard.querySelector('.destination').textContent = '本日の列車は終了しました';
        nextTrainCard.querySelector('.countdown').classList.add('hidden');
    }

    if (followingTrain) {
        followingTrainCard.classList.remove('hidden');
        followingTrainCard.querySelector('.time').textContent = followingTrain.time;
        followingTrainCard.querySelector('.destination').textContent = `${destinationText}行き`;
    } else {
        // 次々発がない場合はカードごと隠す
        followingTrainCard.classList.add('hidden');
    }
}

/**
 * 発車までの残り時間を更新する
 * @param {{minutes: number, seconds: number}|null} timeRemaining - 残り時間オブジェクト
 */
function updateCountdown(timeRemaining) {
    const countdownElement = nextTrainCard.querySelector('.countdown');
    if (timeRemaining) {
        // 0埋め処理
        const paddedMinutes = String(timeRemaining.minutes).padStart(2, '0');
        const paddedSeconds = String(timeRemaining.seconds).padStart(2, '0');
        countdownElement.textContent = `あと ${paddedMinutes}分${paddedSeconds}秒`;
    } else {
        countdownElement.textContent = '';
    }
}

function showLoading(message) { console.log("UI: ローディング表示 -", message); }
function hideLoading() { console.log("UI: ローディング非表示"); }
function showError(message) {
    console.error("UI Error:", message);
    alert(message); // とりあえずalertで代用
}

// --- 全てのUI操作関数をエクスポート ---
export const ui = {
    updateUserUI, openAuthModal, closeAuthModal, getAuthInput,
    showAuthError, showBonusPopup, updateCoinDisplay,
    updateStationName, updateTimetable, updateCountdown,
    showLoading, hideLoading, showError
};