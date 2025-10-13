const API_ENDPOINT = "https://hufs-clock-api.vercel.app/api/data";

/**
 * API 서버로부터 데이터를 가져옵니다. 콜드 스타트로 인한 첫 실패 시 자동으로 한 번 재시도합니다.
 * @param {number} retries - 남은 재시도 횟수
 */
function fetchDataFromAPI(retries = 1) {
    console.log(`[BG] Starting data fetch from API... (Retries left: ${retries})`);
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
            const updateDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
            return chrome.storage.local.set({
                'schedule_cache': { timestamp: data.timestamp, schedule: data.schedule, updateDate: updateDate },
                'notice_cache': { timestamp: data.timestamp, notices: data.notices, updateDate: updateDate },
                'meal_cache': { timestamp: data.timestamp, meals: data.meals, updateDate: updateDate }
            }).then(() => {
                console.log(`[BG] Data successfully fetched and stored with updateDate: ${updateDate}.`);
            });
        })
        .catch(error => {
            console.error(`[BG] Fetch attempt failed:`, error);
            if (retries > 0) {
                console.log("[BG] Retrying fetch in 2 seconds...");
                // 2초 후 재시도 (서버가 깨어날 시간을 줌)
                return new Promise(resolve => setTimeout(resolve, 2000))
                    .then(() => fetchDataFromAPI(retries - 1));
            } else {
                console.error("[BG] All fetch retries failed.");
                throw error; // 모든 재시도 실패 시 최종적으로 오류를 던짐
            }
        });
}

// --- 이벤트 리스너 ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'force_update') {
        console.log("[BG] 'force_update' message received.");
        fetchDataFromAPI()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // 비동기 응답을 위해 채널을 열어 둠
    }
});

chrome.runtime.onInstalled.addListener((details) => {
    console.log(`[BG] onInstalled event triggered (reason: ${details.reason}).`);
    fetchDataFromAPI();
});

chrome.runtime.onStartup.addListener(() => {
    console.log("[BG] Chrome startup event triggered.");
    fetchDataFromAPI();
});
