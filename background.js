// Background script for HUFS Clock Extension

console.log("[BG] 백그라운드 스크립트 로드됨");

chrome.action.onClicked.addListener((tab) => {
    console.log("[BG] 액션 클릭됨, 팝업 열기");
    const url = chrome.runtime.getURL('popup.html');
    console.log("[BG] 팝업 URL:", url);
    chrome.tabs.create({ url: url });
});

// Native messaging으로 전체 데이터 업데이트
function updateCacheData() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendNativeMessage(
            'com.hufs.clock.updater',
            { action: 'update_cache' },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[BG] 네이티브 메시징 오류:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('[BG] 캐시 업데이트 응답 수신');
                    if (response.output) {
                        console.log('[BG] 크롤링 출력:', response.output.substring(0, 100) + '...');
                    }
                    resolve(response);
                }
            }
        );
    });
}

// Native messaging으로 공지사항 데이터 업데이트
function updateNoticesData() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendNativeMessage(
            'com.hufs.clock.updater',
            { action: 'update_notices' },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('[BG] 네이티브 메시징 오류:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('[BG] 공지사항 업데이트 응답 수신');
                    if (response.output) {
                        console.log('[BG] 크롤링 출력:', response.output.substring(0, 100) + '...');
                    }
                    resolve(response);
                }
            }
        );
    });
}

// Popup에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[BG] 메시지 수신:', request.action);
    
    if (request.action === 'update_cache') {
        console.log('[BG] 캐시 업데이트 처리 중');
        updateCacheData()
            .then((result) => {
                console.log('[BG] 캐시 업데이트: 성공');
                sendResponse({ success: true, data: result });
            })
            .catch((error) => {
                console.log('[BG] 캐시 업데이트: 실패 -', error.message);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    if (request.action === 'update_notices') {
        console.log('[BG] 공지사항 업데이트 처리 중');
        updateNoticesData()
            .then((result) => {
                console.log('[BG] 공지사항 업데이트: 성공');
                sendResponse({ success: true, data: result });
            })
            .catch((error) => {
                console.log('[BG] 공지사항 업데이트: 실패 -', error.message);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
    
    console.log('[BG] 알 수 없는 액션:', request.action);
});