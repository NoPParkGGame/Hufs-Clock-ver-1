let schedule = null;
let notices = [];
let meals = [];

// --- 데이터 로딩 및 렌더링 ---

/**
 * 두 Date 객체가 같은 날짜인지 확인하는 도우미 함수
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

/**
 * chrome.storage.local에서 모든 캐시 데이터를 가져와 화면에 렌더링합니다.
 * 캐시가 오늘 날짜가 아니면 강제로 업데이트를 요청합니다.
 */
function loadDataAndRender() {
    const keys = ['schedule_cache', 'notice_cache', 'meal_cache'];
    chrome.storage.local.get(keys, (result) => {
        console.log("[POPUP] 스토리지에서 데이터를 가져왔습니다.", result);

        let hasData = false;
        let latestTimestamp = 0;

        if (result.schedule_cache && result.schedule_cache.schedule) {
            schedule = result.schedule_cache.schedule;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.schedule_cache.timestamp).getTime());
            hasData = true;
        }
        if (result.notice_cache && result.notice_cache.notices) {
            notices = result.notice_cache.notices;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.notice_cache.timestamp).getTime());
            hasData = true;
        }
        if (result.meal_cache && result.meal_cache.meals) {
            meals = result.meal_cache.meals;
            latestTimestamp = Math.max(latestTimestamp, new Date(result.meal_cache.timestamp).getTime());
            hasData = true;
        }

        if (hasData) {
            const isCacheFromToday = isSameDay(new Date(latestTimestamp), new Date());
            // 캐시가 오늘 날짜면 그냥 렌더링, 아니면 강제 업데이트
            if (isCacheFromToday) {
                console.log("[POPUP] 오늘자 캐시가 유효합니다. 데이터를 렌더링합니다.");
                renderAllUI(new Date(latestTimestamp));
            } else {
                console.log("[POPUP] 캐시가 최신이 아닙니다. 강제 업데이트를 요청합니다.");
                forceUpdate();
            }
        } else {
            console.log("[POPUP] 스토리지에 데이터가 없습니다. 강제 업데이트를 요청합니다.");
            forceUpdate(); // 데이터가 없으면 강제 업데이트
        }
    });
}

/**
 * 백그라운드에 데이터 강제 업데이트를 요청하는 함수
 */
function forceUpdate() {
    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = "업데이트 중...";
    }

    console.log("[POPUP] 백그라운드에 'force_update' 메시지를 보냅니다.");
    chrome.runtime.sendMessage({ action: 'force_update' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("[POPUP] 메시지 전송 실패:", chrome.runtime.lastError);
            if (lastUpdateElement) lastUpdateElement.textContent = "업데이트 실패 (연결 오류)";
            return;
        }

        if (response && response.success) {
            console.log("[POPUP] 백그라운드 업데이트 성공 응답 수신. 500ms 후 데이터 리로드.");
            // 백그라운드가 storage에 데이터를 쓸 시간을 약간 줌
            setTimeout(loadDataAndRender, 500);
        } else {
            console.error("[POPUP] 백그라운드 업데이트 실패:", response ? response.error : "응답 없음");
            if (lastUpdateElement) lastUpdateElement.textContent = "업데이트 실패";
        }
    });
}

/**
 * 가져온 데이터를 사용하여 모든 UI 컴포넌트를 렌더링합니다.
 */
function renderAllUI(latestTimestamp) {
    updateCountdownUI();
    renderNoticesUI();
    renderMealsUI();

    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement && latestTimestamp > 0) {
        lastUpdateElement.textContent = `최근 업데이트: ${latestTimestamp.toLocaleString('ko-KR')}`;
        lastUpdateElement.classList.remove('highlight');
        void lastUpdateElement.offsetWidth; // Reflow to restart animation
        lastUpdateElement.classList.add('highlight');
    }
}


// --- UI 렌더링 함수들 (기존 로직 재사용 및 수정) ---

function updateCountdownUI() {
    const periodTypeElement = document.getElementById('period-type');
    const countdownElement = document.getElementById('countdown-timer');
    const currentTimeElement = document.getElementById('currentTime');

    if (currentTimeElement) {
        currentTimeElement.textContent = new Date().toLocaleString('ko-KR');
    }

    // --- 방어 코드 시작 ---
    // schedule 객체 또는 주요 날짜 정보가 없으면 카운트다운을 중단하고 안내 메시지를 표시합니다.
    if (!schedule || !schedule.first_start || !schedule.second_start) {
        if (countdownElement) countdownElement.textContent = "학사일정 정보 없음";
        if (periodTypeElement) periodTypeElement.textContent = "새로고침 버튼을 눌러보세요.";
        return; // 함수 실행 중단
    }
    // --- 방어 코드 끝 ---

    const now = new Date();
    const parseDate = (dateStr, yearOffset = 0) => new Date(new Date().getFullYear() + yearOffset, ...dateStr.split('.').map(n => parseInt(n, 10) - 1), 23, 59, 59);
    
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

    const today = new Date().getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const dayIndex = today === 0 ? 6 : today - 1; // 월(0) ~ 일(6) 인덱스

    mealTbody.innerHTML = meals.map(meal => {
        const todayMenuItem = meal.menus[dayIndex];
        
        const menuName = todayMenuItem ? todayMenuItem.name : '';
        const price = todayMenuItem ? todayMenuItem.price : '';
        
        const isAvailable = menuName && menuName.trim() !== '' && !menuName.includes('등록된 메뉴가 없습니다');
        
        // 메뉴 이름과 가격을 합쳐서 표시. 가격이 있으면 괄호와 함께 추가
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

// --- 테마 및 이벤트 리스너 (기존 로직 재사용) ---

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

// --- DOMContentLoaded --- 

document.addEventListener('DOMContentLoaded', () => {
    // 1. 데이터 로드 및 렌더링
    loadDataAndRender();

    // 2. 카운트다운 타이머 시작
    if (!window.countdownInterval) {
        window.countdownInterval = setInterval(updateCountdownUI, 1000);
    }

    // 3. 테마 초기화
    const savedTheme = localStorage.getItem('theme') || 'default';
    initializeTheme(savedTheme);

    // 4. 모든 이벤트 리스너 등록
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
        if (row && row.dataset.link) chrome.tabs.create({ url: row.dataset.link });
    });
    document.getElementById('shortcut-toggle')?.addEventListener('click', () => {
        document.querySelectorAll('.small-glass-button').forEach(btn => btn.classList.toggle('hidden'));
    });
});
