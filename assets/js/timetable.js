/**
 * timetable.js
 * 
 * アプリケーションのコアロジックを担当する専門モジュール。
 * station-data.jsからデータをインポートし、計算処理に専念する。
 */

import { ui } from './ui.js';
// ★★★ 新しいデータファイルから、2つのデータをインポート ★★★
import { stationCoords, timetableData } from './station-data.js'; 


// =============================================================
//  ロジックセクション
// =============================================================
let currentStation = null;
async function init() { /* ... (ここのロジックは変更なし) ... */ }
function displayCurrentTimetable(direction) { /* ... (ここのロジックは変更なし) ... */ }
function _getUserLocation() { /* ... (ここのロジックは変更なし) ... */ }

/**
 * 取得した座標から最も近い駅名を見つける (デバッグモード)
 */
function _findNearestStation(userCoords) {
    if (!userCoords) return null;
    let nearestStation = null;
    let minDistance = Infinity;

    console.log("--- 最寄り駅の計算を開始 ---");
    console.log(`現在地 (緯度: ${userCoords.latitude}, 経度: ${userCoords.longitude})`);

    for (const stationName in stationCoords) {
        const stationCoord = stationCoords[stationName];
        const distance = _getDistance(userCoords.latitude, userCoords.longitude, stationCoord.lat, stationCoord.lon);
        console.log(` -> ${stationName}駅までの距離: ${distance.toFixed(3)} km`);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStation = stationName;
        }
    }
    console.log(`>> 最終判定: 最寄り駅は ${nearestStation}駅 です (距離: ${minDistance.toFixed(3)} km)`);
    console.log("--- 最寄り駅の計算を終了 ---");
    return nearestStation;
}

function _getDistance(lat1, lon1, lat2, lon2) { /* ... (Vincenty法の計算式は変更なし) ... */ }
function _getCurrentTimeAsMinutes() { /* ... (ここのロジックは変更なし) ... */ }
function _timeToMinutes(timeString) { /* ... (ここのロジックは変更なし) ... */ }

// --- エクスポート ---
export const timetable = { init, displayCurrentTimetable };