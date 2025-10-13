const API_ENDPOINT = "https://hufs-clock-api.vercel.app/api/data";

/**
 * API 서버로부터 모든 데이터를 가져와 chrome.storage.local에 저장합니다.
 */
function fetchDataFromAPI() {
    console.log("[BG] Starting data fetch from API...");
    return fetch(API_ENDPOINT)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.timestamp) {
                throw new Error("Invalid data received from API.");
            }
            return chrome.storage.local.set({
                'schedule_cache': { timestamp: data.timestamp, schedule: data.schedule },
                'notice_cache': { timestamp: data.timestamp, notices: data.notices },
                'meal_cache': { timestamp: data.timestamp, meals: data.meals }
            }).then(() => {
                console.log("[BG] Data successfully fetched and stored.");
            });
        })
        .catch(error => {
            console.error("[BG] Failed to fetch or store data:", error);
            throw error;
        });
}

/**
 * Popup 스크립트로부터 메시지를 수신합니다.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'force_update') {
        console.log("[BG] 'force_update' message received.");
        fetchDataFromAPI()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
    }
});

/**
 * 확장 프로그램이 설치/업데이트될 때 실행됩니다.
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log(`[BG] onInstalled event triggered (reason: ${details.reason}).`);
    fetchDataFromAPI();
});

/**
 * 크롬 브라우저가 시작될 때 실행됩니다.
 */
chrome.runtime.onStartup.addListener(() => {
    console.log("[BG] Chrome startup event triggered.");
    fetchDataFromAPI();
});