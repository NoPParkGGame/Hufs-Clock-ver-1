// background.js (API 버전)

console.log("[BG] 백그라운드 스크립트 로드됨 (API 버전)");

// Vercel API 엔드포인트
const API_ENDPOINT = "https://hufs-clock-api.vercel.app/api/data";

/**
 * API로부터 모든 데이터를 가져와서 chrome.storage.local에 저장하는 함수
 */
function fetchDataFromAPI() {
    console.log(`[BG] API로부터 데이터 가져오는 중: ${API_ENDPOINT}`);
    
    return fetch(API_ENDPOINT)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.timestamp) {
                throw new Error("API로부터 유효하지 않은 데이터를 받았습니다.");
            }
            console.log("[BG] API로부터 데이터 수신 성공");
            // 수신된 데이터를 각 캐시에 맞게 저장
            return chrome.storage.local.set({
                'schedule_cache': { timestamp: data.timestamp, schedule: data.schedule },
                'notice_cache': { timestamp: data.timestamp, notices: data.notices },
                'meal_cache': { timestamp: data.timestamp, meals: data.meals }
            });
        });
}

// Popup이나 다른 곳에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[BG] 메시지 수신:', request.action);

    // 'force_update' 요청을 받으면 API를 통해 데이터를 강제로 새로고침
    if (request.action === 'force_update') {
        fetchDataFromAPI()
            .then(() => {
                console.log('[BG] 데이터 강제 업데이트 및 저장 성공');
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('[BG] 데이터 강제 업데이트 실패:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // 비동기 응답을 위해 true 반환
    }
});

// 확장 프로그램이 처음 설치될 때 또는 업데이트될 때 데이터 가져오기
chrome.runtime.onInstalled.addListener((details) => {
    console.log('[BG] onInstalled 이벤트 발생:', details.reason);
    fetchDataFromAPI();
});

// 크롬이 시작될 때마다 데이터 가져오기
chrome.runtime.onStartup.addListener(() => {
    console.log('[BG] 크롬 시작됨. 데이터 업데이트 시도.');
    fetchDataFromAPI();
});
