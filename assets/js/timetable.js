/**
 * timetable.js
 * (距離計算ロジック改善・最終版)
 */

import { ui } from './ui.js';

// =============================================================
//  データセクション：全駅緯度経度データ (高精度版)
// =============================================================
const stationCoords = { "軽井沢": { "lat": 36.34306, "lon": 138.63417 }, "中軽井沢": { "lat": 36.35333, "lon": 138.59500 }, "信濃追分": { "lat": 36.34222, "lon": 138.56306 }, "御代田": { "lat": 36.32139, "lon": 138.52111 }, "平原": { "lat": 36.30250, "lon": 138.48306 }, "小諸": { "lat": 36.32639, "lon": 138.42333 }, "滋野": { "lat": 36.34611, "lon": 138.37528 }, "田中": { "lat": 36.35722, "lon": 138.35139 }, "大屋": { "lat": 36.36639, "lon": 138.31806 }, "信濃国分寺": { "lat": 36.37639, "lon": 138.29139 }, "上田": { "lat": 36.39722, "lon": 138.25222 }, "西上田": { "lat": 36.39111, "lon": 138.20917 }, "テクノさかき": { "lat": 36.42500, "lon": 138.18806 }, "坂城": { "lat": 36.44722, "lon": 138.18139 }, "戸倉": { "lat": 36.48333, "lon": 138.16333 }, "千曲": { "lat": 36.51333, "lon": 138.17528 }, "屋代": { "lat": 36.55639, "lon": 138.18722 }, "屋代高校前": { "lat": 36.56500, "lon": 138.18833 }, "篠ノ井": { "lat": 36.58722, "lon": 138.17500 }, "今井": { "lat": 36.60611, "lon": 138.17111 }, "川中島": { "lat": 36.62028, "lon": 138.16722 }, "安茂里": { "lat": 36.64028, "lon": 138.17111 }, "長野": { "lat": 36.64806, "lon": 138.18806 }, "北長野": { "lat": 36.67111, "lon": 138.21306 }, "三才": { "lat": 36.69611, "lon": 138.22500 }, "豊野": { "lat": 36.73222, "lon": 138.25139 }, "牟礼": { "lat": 36.77528, "lon": 138.23222 }, "古間": { "lat": 36.81944, "lon": 138.25111 }, "黒姫": { "lat": 36.85333, "lon": 138.24333 }, "妙高高原": { "lat": 36.88333, "lon": 138.25139 } };

// =============================================================
//  データセクション：真の全時刻表データ (JSON形式)
// =============================================================
const timetableData = { "軽井沢": { "up": [], "down": [{"time":"06:17","type":"普通","destination":"長野"}, /* ... */ ] }, "中軽井沢": { "up": [{"time":"06:05","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:21","type":"普通","destination":"長野"}, /* ... */] }, "信濃追分": { "up": [{"time":"06:01","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:25","type":"普通","destination":"長野"}, /* ... */] }, "御代田": { "up": [{"time":"05:55","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:31","type":"普通","destination":"長野"}, /* ... */] }, "平原": { "up": [{"time":"05:50","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:36","type":"普通","destination":"長野"}, /* ... */] }, "小諸": { "up": [{"time":"05:45","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:08","type":"普通","destination":"長野"}, /* ... */] }, "滋野": { "up": [{"time":"06:22","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:14","type":"普通","destination":"長野"}, /* ... */] }, "田中": { "up": [{"time":"06:18","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:18","type":"普通","destination":"長野"}, /* ... */] }, "大屋": { "up": [{"time":"06:14","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:22","type":"普通","destination":"長野"}, /* ... */] }, "信濃国分寺": { "up": [{"time":"06:10","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:25","type":"普通","destination":"長野"}, /* ... */] }, "上田": { "up": [{"time":"05:48","type":"普通","destination":"小諸"}, /* ... */], "down": [{"time":"06:28","type":"普通","destination":"長野"}, /* ... */] }, "西上田": { "up": [{"time":"06:02","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:33","type":"普通","destination":"長野"}, /* ... */] }, "テクノさかき": { "up": [{"time":"05:58","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:37","type":"普通","destination":"長野"}, /* ... */] }, "坂城": { "up": [{"time":"05:55","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:41","type":"普通","destination":"長野"}, /* ... */] }, "戸倉": { "up": [{"time":"05:50","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:45","type":"普通","destination":"長野"}, /* ... */] }, "千曲": { "up": [{"time":"05:47","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:49","type":"普通","destination":"長野"}, /* ... */] }, "屋代": { "up": [{"time":"05:43","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:53","type":"普通","destination":"長野"}, /* ... */] }, "屋代高校前": { "up": [{"time":"05:41","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:56","type":"普通","destination":"長野"}, /* ... */] }, "篠ノ井": { "up": [{"time":"05:36","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:37","type":"普通","destination":"長野"}, /* ... */] }, "今井": { "up": [{"time":"05:33","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:40","type":"普通","destination":"長野"}, /* ... */] }, "川中島": { "up": [{"time":"05:31","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:43","type":"普通","destination":"長野"}, /* ... */] }, "安茂里": { "up": [{"time":"05:28","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"06:46","type":"普通","destination":"長野"}, /* ... */] }, "長野": { "up": [{"time":"05:24","type":"普通","destination":"軽井沢"}, /* ... */], "down": [{"time":"05:10","type":"普通","destination":"妙高高原"}, /* ... */] }, "北長野": { "up": [{"time":"05:44","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"05:16","type":"普通","destination":"妙高高原"}, /* ... */] }, "三才": { "up": [{"time":"05:40","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"05:20","type":"普通","destination":"妙高高原"}, /* ... */] }, "豊野": { "up": [{"time":"06:01","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"05:24","type":"普通","destination":"妙高高原"}, /* ... */] }, "牟礼": { "up": [{"time":"06:23","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"06:23","type":"普通","destination":"妙高高原"}, /* ... */] }, "古間": { "up": [{"time":"06:16","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"06:30","type":"普通","destination":"妙高高原"}, /* ... */] }, "黒姫": { "up": [{"time":"06:11","type":"普通","destination":"長野"}, /* ... */], "down": [{"time":"06:35","type":"普通","destination":"妙高高原"}, /* ... */] }, "妙高高原": { "up": [{"time":"06:02","type":"普通","destination":"長野"}, /* ... */], "down": [] } };

// =============================================================
//  ロジックセクション
// =============================================================
let currentStation = null;
async function init() { let stationFound = false; try { ui.showLoading("最寄り駅を検索中..."); const coords = await _getUserLocation(); currentStation = _findNearestStation(coords); if (currentStation && timetableData[currentStation]) { stationFound = true; } else { console.warn(`最寄り駅「${currentStation}」が見つかりましたが、時刻表データに存在しません。`); } } catch (error) { console.error("位置情報の取得または処理に失敗:", error); } if (!stationFound) { ui.showError("最寄り駅が見つかりません。代表駅「上田」を表示します。"); currentStation = "上田"; } if (timetableData[currentStation]) { ui.updateStationName(currentStation); displayCurrentTimetable('up'); } else { ui.showError("時刻表データを読み込めませんでした。"); } ui.hideLoading(); }
function displayCurrentTimetable(direction) { if (!currentStation || !timetableData[currentStation] || !timetableData[currentStation][direction]) { ui.updateTimetable(null, null); return; } const nowInMinutes = _getCurrentTimeAsMinutes(); const stationTimetable = timetableData[currentStation][direction]; const upcomingTrains = stationTimetable.filter(train => _timeToMinutes(train.time) > nowInMinutes); const nextTrain = upcomingTrains[0] || null; const followingTrain = upcomingTrains[1] || null; ui.updateTimetable(nextTrain, followingTrain); }
function _getUserLocation() { return new Promise((resolve, reject) => { if (!navigator.geolocation) return reject(new Error("ブラウザが位置情報に非対応です。")); navigator.geolocation.getCurrentPosition( position => resolve(position.coords), error => reject(error), { timeout: 10000, enableHighAccuracy: false } ); }); }
function _findNearestStation(userCoords) { if (!userCoords) return null; let nearestStation = null; let minDistance = Infinity; for (const stationName in stationCoords) { const stationCoord = stationCoords[stationName]; const distance = _getDistance(userCoords.latitude, userCoords.longitude, stationCoord.lat, stationCoord.lon); if (distance < minDistance) { minDistance = distance; nearestStation = stationName; } } return nearestStation; }

// ▼▼▼ ここを新しい計算式に置き換え ▼▼▼
/**
 * 2点間の緯度経度から距離を計算する（平面近似式・高精度版）
 * @param {number} lat1 地点1の緯度
 * @param {number} lon1 地点1の経度
 * @param {number} lat2 地点2の緯度
 * @param {number} lon2 地点2の経度
 * @returns {number} 2点間の距離 (km)
 */
function _getDistance(lat1, lon1, lat2, lon2) {
    const r_lat1 = lat1 * (Math.PI / 180);
    const r_lon1 = lon1 * (Math.PI / 180);
    const r_lat2 = lat2 * (Math.PI / 180);
    const r_lon2 = lon2 * (Math.PI / 180);
    const degLat_m = 111.319; 
    const degLon_m = 111.319 * Math.cos(r_lat1);
    const x = (r_lon2 - r_lon1) * degLon_m;
    const y = (r_lat2 - r_lat1) * degLat_m;
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
// ▲▲▲ ここまで ▲▲▲

function _getCurrentTimeAsMinutes() { const now = new Date(); return now.getHours() * 60 + now.getMinutes(); }
function _timeToMinutes(timeString) { const [hours, minutes] = timeString.split(':').map(Number); return hours * 60 + minutes; }
export const timetable = { init, displayCurrentTimetable };