// Background script for HUFS Clock Extension

console.log("Background script loaded");

chrome.action.onClicked.addListener((tab) => {
    console.log("Action clicked, creating tab");
    const url = chrome.runtime.getURL('popup.html');
    console.log("URL:", url);
    chrome.tabs.create({ url: url });
});

// Native messaging으로 데이터 업데이트
function updateCacheData() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendNativeMessage(
            'com.hufs.clock.updater',
            { action: 'update_cache' },
            (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Native messaging error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('크롤링 응답:', response);
                    if (response.output) {
                        console.log('크롤링 출력:', response.output);
                    }
                    resolve(response);
                }
            }
        );
    });
}

// Popup에서 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'update_cache') {
        updateCacheData()
            .then((result) => {
                sendResponse({ success: true, data: result });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});