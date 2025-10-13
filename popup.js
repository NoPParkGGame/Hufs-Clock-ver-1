let schedule = null;
let notices = [];
let meals = [];

// ===============================================================================
// 1. 데이터 관리 (로딩 및 업데이트)
// ===============================================================================

function loadDataAndRender() {
    console.log("[POPUP] Attempting to load data from local storage...");
    const keys = ['schedule_cache', 'notice_cache', 'meal_cache'];
    chrome.storage.local.get(keys, (result) => {
        let hasData = false;
        let latestTimestamp = 0;

        if (result.schedule_cache?.schedule) {
            schedule = result.schedule_cache.schedule;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.schedule_cache.timestamp).getTime());
            hasData = true;
        }
        if (result.notice_cache?.notices) {
            notices = result.notice_cache.notices;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.notice_cache.timestamp).getTime());
            hasData = true;
        }
        if (result.meal_cache?.meals) {
            meals = result.meal_cache.meals;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.meal_cache.timestamp).getTime());
            hasData = true;
        }

        if (hasData) {
            const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
            const cacheUpdateDate = result.schedule_cache?.updateDate || result.notice_cache?.updateDate || result.meal_cache?.updateDate;

            if (cacheUpdateDate === todayDate) {
                console.log(`[POPUP] Valid cache from today (${cacheUpdateDate}) found. Rendering UI.`);
                renderAllUI(new Date(latestTimestamp));
            } else {
                console.log(`[POPUP] Cache is outdated (cache date: ${cacheUpdateDate}, today: ${todayDate}). Forcing update.`);
                forceUpdate();
            }
        } else {
            console.log("[POPUP] No data in storage. Forcing update.");
            forceUpdate();
        }
    });
}

function forceUpdate() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) lastUpdateElement.textContent = "업데이트 중...";

    console.log("[POPUP] Sending 'force_update' message to background script.");
    chrome.runtime.sendMessage({ action: 'force_update' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("[POPUP] Failed to send message:", chrome.runtime.lastError);
            if (lastUpdateElement) lastUpdateElement.textContent = "업데이트 실패 (연결 오류)";
            return;
        }
        if (response?.success) {
            console.log("[POPUP] Background update successful. Reloading data in 500ms.");
            setTimeout(loadDataAndRender, 500);
        } else {
            console.error("[POPUP] Background update failed:", response?.error || "No response");
            if (lastUpdateElement) lastUpdateElement.textContent = "업데이트 실패";
        }
    });
}

// ===============================================================================
// 2. UI 렌더링
// ===============================================================================

function renderAllUI(latestTimestamp) {
    renderCountdownUI();
    renderNoticesUI();
    renderMealsUI();

    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement && latestTimestamp > 0) {
        lastUpdateElement.textContent = `최근 업데이트: ${latestTimestamp.toLocaleString('ko-KR')}`;
        lastUpdateElement.classList.remove('highlight');
        void lastUpdateElement.offsetWidth;
        lastUpdateElement.classList.add('highlight');
    }
}

function renderCountdownUI() {
    const periodTypeElement = document.getElementById('period-type');
    const countdownElement = document.getElementById('countdown-timer');
    document.getElementById('currentTime').textContent = new Date().toLocaleString('ko-KR');

    if (!schedule || !schedule.first_start || !schedule.second_start) {
        if (countdownElement) countdownElement.textContent = "학사일정 정보 없음";
        if (periodTypeElement) periodTypeElement.textContent = "새로고침 버튼을 눌러보세요.";
        return;
    }

    const now = new Date();
    const parseDate = (dateStr, yearOffset = 0) => {
        const [month, day] = dateStr.split('.').map(n => parseInt(n, 10));
        return new Date(new Date().getFullYear() + yearOffset, month - 1, day, 23, 59, 59);
    };
    
    const firstSemesterStart = parseDate(schedule.first_start);
    const firstSemesterEnd = parseDate(schedule.first_end);
    const secondSemesterStart = parseDate(schedule.second_start);
    const secondSemesterEnd = parseDate(schedule.second_end);

    let targetDate, periodType;
    if (now < firstSemesterStart) { targetDate = firstSemesterStart; periodType = "1학기 개강까지"; }
    else if (now < firstSemesterEnd) { targetDate = firstSemesterEnd; periodType = "1학기 종강까지"; }
    else if (now < secondSemesterStart) { targetDate = secondSemesterStart; periodType = "2학기 개강까지"; }
    else if (now < secondSemesterEnd) { targetDate = secondSemesterEnd; periodType = "2학기 종강까지"; }
    else { targetDate = parseDate(schedule.first_start, 1); periodType = "다음 학기 개강까지"; }

    const timeDiff = targetDate - now;
    if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        countdownElement.textContent = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
        periodTypeElement.textContent = `${periodType} (${(targetDate.getMonth() + 1).toString().padStart(2, '0')}.${targetDate.getDate().toString().padStart(2, '0')})`;
    } else {
        countdownElement.textContent = "종강을 축하합니다!";
        periodTypeElement.textContent = "학기 종료";
    }
}

function renderNoticesUI() {
    const noticeTbody = document.querySelector('.notice-table tbody');
    if (!noticeTbody) return;
    noticeTbody.innerHTML = (notices || []).slice(0, 20).map(notice => `
        <tr class="notice-row" data-link="${notice.link}">
            <td class="notice-title-cell">
                <div class="notice-content">
                    <span class="notice-date">${notice.date}</span>
                    <span class="notice-title-text">${notice.title}</span>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderMealsUI() {
    const mealTbody = document.querySelector('.meal-table tbody');
    if (!mealTbody || !meals) return;

    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;

    mealTbody.innerHTML = meals.map(meal => {
        const todayMenuItem = meal.menus[dayIndex];
        const menuName = todayMenuItem?.name || '';
        const price = todayMenuItem?.price || '';
        const isAvailable = menuName && menuName.trim() !== '' && !menuName.includes('등록된 메뉴가 없습니다');
        const displayMenu = isAvailable ? `${menuName} ${price ? `(${price})` : ''}` : '운영하지 않음';

        return `
            <tr class="meal-row ${isAvailable ? '' : 'no-menu'}">
                <td class="meal-time-cell">
                    <div class="meal-content">
                        <span class="meal-time">⦁ ${meal.time}</span>
                        <div class="meal-info-row">
                            <span class="meal-menu">${displayMenu}</span>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ===============================================================================
// 3. 테마 관리 및 이벤트 리스너
// ===============================================================================

function initializeTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
    const defaultBg = document.querySelector('.background.default');
    const darkBg = document.querySelector('.background.dark');
    defaultBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/background_picture.jpg')})`;
    darkBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/night_background.jpg')})`;
    defaultBg.style.opacity = theme === 'default' ? '1' : '0';
    darkBg.style.opacity = theme === 'dark' ? '1' : '0';
}

function changeTheme(theme) {
    if (document.body.className.replace('theme-', '') === theme) return;
    const defaultBg = document.querySelector('.background.default');
    const darkBg = document.querySelector('.background.dark');
    if (theme === 'default') {
        darkBg.style.opacity = '0';
        defaultBg.style.opacity = '1';
    } else {
        defaultBg.style.opacity = '0';
        darkBg.style.opacity = '1';
    }
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
    loadDataAndRender();

    if (!window.countdownInterval) {
        window.countdownInterval = setInterval(renderCountdownUI, 1000);
    }

    const savedTheme = localStorage.getItem('theme') || 'default';
    initializeTheme(savedTheme);

    document.querySelector('.refresh-btn')?.addEventListener('click', forceUpdate);
    document.getElementById('meal-toggle')?.addEventListener('click', () => {
        const mealContainer = document.querySelector('.meal-container');
        const isHidden = mealContainer.classList.toggle('hidden');
        mealContainer.classList.toggle('show', !isHidden);
        document.getElementById('meal-toggle').textContent = isHidden ? '🍽️ 학식 보기' : '🍽️ 학식 닫기';
        document.getElementById('meal-toggle').classList.toggle('active', !isHidden);
    });
    document.querySelectorAll('.theme-btn').forEach(button => {
        button.addEventListener('click', () => changeTheme(button.dataset.theme));
    });
    document.querySelectorAll('.glass-button, .small-glass-button').forEach(button => {
        button.addEventListener('click', () => { if (button.dataset.url) chrome.tabs.create({ url: button.dataset.url }); });
    });
    document.querySelector('.notice-table')?.addEventListener('click', (event) => {
        const row = event.target.closest('.notice-row');
        if (row?.dataset.link) chrome.tabs.create({ url: row.dataset.link });
    });
    document.getElementById('shortcut-toggle')?.addEventListener('click', () => {
        document.querySelectorAll('.small-glass-button').forEach(btn => btn.classList.toggle('hidden'));
    });
});