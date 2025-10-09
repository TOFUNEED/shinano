/**
 * timetable.js
 * 
 * アプリケーションのコアロジックを担当する専門モジュール。
 * ユーザーの現在地から最寄り駅を特定し、
 * 対応する時刻表データを読み込んで表示する。
 */

import { ui } from './ui.js';
import { stationCoords, stationFileNames } from './station-data.js'; 

// --- モジュール内変数 ---
let currentStationName = null; // 現在表示している駅名
let currentTimetableData = null; // 現在表示している駅の時刻表データ
let currentDirection = 'up'; // 現在選択されている方面 ('up' or 'down')
let countdownInterval = null; // カウントダウン用のタイマーID

/**
 * 時刻表モジュールの初期化処理
 */
async function init() {
    ui.showLoading("現在地から最寄り駅を探しています...");
    try {
        const userCoords = await _getUserLocation();
        currentStationName = _findNearestStation(userCoords);
        
        if (currentStationName) {
            await _loadTimetableFor(currentStationName);
            displayCurrentTimetable(currentDirection); // 初期表示は 'up'
        } else {
            ui.showError("駅が見つかりませんでした。");
        }
    } catch (error) {
        console.error("初期化エラー:", error);
        ui.showError(error.message);
        // 位置情報が取得できない場合、デフォルト駅（例：上田駅）を表示
        currentStationName = "上田";
        await _loadTimetableFor(currentStationName);
        displayCurrentTimetable(currentDirection);
    } finally {
        ui.hideLoading();
    }
}

/**
 * 指定された方面の時刻表を表示する
 * @param {string} direction - 'up' (軽井沢方面) または 'down' (長野方面)
 */
function displayCurrentTimetable(direction) {
    if (!currentTimetableData) {
        ui.showError("時刻表データが読み込まれていません。");
        return;
    }
    currentDirection = direction; // 現在の方面を更新

    // UIのタブ表示を更新
    document.querySelector('.tab-button.active').classList.remove('active');
    document.querySelector(`.tab-button[data-direction="${direction}"]`).classList.add('active');

    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

    // これから来る電車をリストアップ
    const upcomingTrains = currentTimetableData[direction].departures.filter(train => {
        const [hour, minute] = train.time.split(':').map(Number);
        const trainTimeInMinutes = hour * 60 + minute;
        return trainTimeInMinutes >= currentTimeInMinutes;
    });

    const nextTrain = upcomingTrains[0] || null;
    const followingTrain = upcomingTrains[1] || null;
    
    // UIに時刻表の更新を依頼
    ui.updateTimetable(nextTrain, followingTrain, direction);
    
    // カウントダウンを開始
    _startCountdown(nextTrain);
}

/**
 * 指定された駅の時刻表JSONを読み込む
 * @param {string} stationName - 日本語の駅名
 */
async function _loadTimetableFor(stationName) {
    const fileName = stationFileNames[stationName];
    if (!fileName) {
        throw new Error("対応する時刻表ファイルが見つかりません。");
    }

    try {
        // 推奨構成に合わせてパスを修正
        const response = await fetch(`assets/data/${fileName}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        currentTimetableData = await response.json();
        ui.updateStationName(stationName);
    } catch (error) {
        console.error(`時刻表ファイル(${fileName}.json)の読み込みに失敗:`, error);
        ui.showError(`${stationName}駅の時刻表データ読み込みに失敗しました。`);
        currentTimetableData = null;
    }
}


/**
 * 次の電車までのカウントダウンを開始/更新する
 * @param {object|null} nextTrain - 次の電車の情報
 */
function _startCountdown(nextTrain) {
    // 既存のタイマーがあれば停止
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    if (!nextTrain) {
        ui.updateCountdown(null); // 電車がない場合は表示をクリア
        return;
    }

    countdownInterval = setInterval(() => {
        const now = new Date();
        const [trainHour, trainMinute] = nextTrain.time.split(':').map(Number);
        
        const trainTime = new Date();
        trainTime.setHours(trainHour, trainMinute, 0, 0);

        if (trainTime < now) {
            // 時刻を過ぎていたら、表示を更新してタイマー停止
            displayCurrentTimetable(currentDirection); 
            clearInterval(countdownInterval);
            return;
        }

        const diffInSeconds = Math.floor((trainTime - now) / 1000);
        const minutes = Math.floor(diffInSeconds / 60);
        const seconds = diffInSeconds % 60;
        
        ui.updateCountdown({ minutes, seconds });

    }, 1000);
}

/**
 * ブラウザのGeolocation APIを使い、ユーザーの現在地（緯度経度）を取得する
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
function _getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("お使いのブラウザは位置情報機能に対応していません。"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error("位置情報の利用が許可されていません。"));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error("現在地を取得できませんでした。"));
                        break;
                    case error.TIMEOUT:
                        reject(new Error("位置情報の取得がタイムアウトしました。"));
                        break;
                    default:
                        reject(new Error("原因不明のエラーで位置情報を取得できませんでした。"));
                        break;
                }
            }
        );
    });
}

/**
 * 全駅の座標リストとユーザーの座標を比較し、最も距離が近い駅名を見つける
 * @param {{latitude: number, longitude: number}} userCoords - ユーザーの座標
 * @returns {string|null} 最も近い駅の日本語名
 */
function _findNearestStation(userCoords) {
    if (!userCoords) return null;
    let nearestStation = null;
    let minDistance = Infinity;

    for (const stationName in stationCoords) {
        const stationCoord = stationCoords[stationName];
        const distance = _getDistance(userCoords.latitude, userCoords.longitude, stationCoord.lat, stationCoord.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = stationName;
        }
    }
    console.log(`最寄り駅は ${nearestStation} です (距離: ${minDistance.toFixed(3)} km)`);
    return nearestStation;
}

/**
 * 2点間の緯度経度から距離を計算する（ヒュベニの公式）
 * @returns {number} 2点間の距離 (km)
 */
function _getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球の半径 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


// --- エクスポート ---
export const timetable = {
    init,
    displayCurrentTimetable
};