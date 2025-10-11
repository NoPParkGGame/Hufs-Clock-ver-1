let schedule = null; // 학사일정 데이터를 저장할 변수
let meals = null; // 급식 데이터를 저장할 변수

// --- 전역 함수들 ---
function parseScheduleDate(dateStr, yearOffset = 0) {
    const currentYear = new Date().getFullYear() + yearOffset;
    const [month, day] = dateStr.split('.').map(Number);
    return new Date(currentYear, month - 1, day, 23, 59, 59);
}

function updateCountdown() {
    if (!schedule) return; // 학사일정 로드 전이면 실행하지 않음

    const now = new Date();
    const currentTimeElement = document.getElementById('currentTime');
    const periodTypeElement = document.getElementById('period-type');
    const countdownElement = document.getElementById('countdown-timer');

    if (currentTimeElement) {
        currentTimeElement.textContent = now.toLocaleString('ko-KR');
    }

    const firstSemesterStart = parseScheduleDate(schedule.first_start);
    const firstSemesterEnd = parseScheduleDate(schedule.first_end);
    const secondSemesterStart = parseScheduleDate(schedule.second_start);
    const secondSemesterEnd = parseScheduleDate(schedule.second_end);

    let targetDate, periodType;

    if (now < firstSemesterStart) {
        targetDate = firstSemesterStart;
        periodType = "1학기 개강까지";
    } else if (now < firstSemesterEnd) {
        targetDate = firstSemesterEnd;
        periodType = "1학기 종강까지";
    } else if (now < secondSemesterStart) {
        targetDate = secondSemesterStart;
        periodType = "2학기 개강까지";
    } else if (now < secondSemesterEnd) {
        targetDate = secondSemesterEnd;
        periodType = "2학기 종강까지";
    } else {
        // 학기가 끝난 경우 다음 학기 개강까지
        targetDate = parseScheduleDate(schedule.first_start, 1);
        periodType = "다음 학기 개강까지";
    }

    // 날짜 추가 (월.일 형식)
    const month = targetDate.getMonth() + 1;
    const day = targetDate.getDate();
    const dateStr = `(${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')})`;
    periodType = periodType.replace("까지", `${dateStr}까지`);

    if (periodTypeElement && countdownElement) {
        const timeDiff = targetDate - now;
        if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            countdownElement.textContent = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
            periodTypeElement.textContent = periodType;
        } else {
            countdownElement.textContent = "종강을 축하합니다!";
            periodTypeElement.textContent = "학기 종료";
        }
    }
}

function initializeTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);

    // 배경 이미지 즉시 설정 (초기 로드용)
    const backgroundContainer = document.querySelector('.background-container');
    if (backgroundContainer) {
        const defaultBg = backgroundContainer.querySelector('.background.default');
        const darkBg = backgroundContainer.querySelector('.background.dark');

        // 두 배경 모두 이미지 설정
        defaultBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/background_picture.jpg')})`;
        darkBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/night_background.jpg')})`;

        // 선택된 테마만 보이도록 opacity 설정
        if (theme === 'default') {
            defaultBg.style.opacity = '1';
            darkBg.style.opacity = '0';
        } else if (theme === 'dark') {
            darkBg.style.opacity = '1';
            defaultBg.style.opacity = '0';
        }
    }
}

function changeTheme(theme) {
    // 현재 테마와 같은 경우 무시
    const currentTheme = document.body.className.replace('theme-', '');
    if (currentTheme === theme) return;

    const backgroundContainer = document.querySelector('.background-container');
    if (!backgroundContainer) return;

    const defaultBg = backgroundContainer.querySelector('.background.default');
    const darkBg = backgroundContainer.querySelector('.background.dark');

    if (theme === 'default') {
        // 기본 테마로 전환: 다크 -> 기본
        darkBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/night_background.jpg')})`;
        defaultBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/background_picture.jpg')})`;

        // 디졸빙 효과: 다크는 1->0, 기본은 0->1
        darkBg.style.opacity = '1';
        defaultBg.style.opacity = '0';

        // 동시에 전환 시작
        requestAnimationFrame(() => {
            darkBg.style.opacity = '0';
            defaultBg.style.opacity = '1';
        });
    } else if (theme === 'dark') {
        // 다크 테마로 전환: 기본 -> 다크
        defaultBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/background_picture.jpg')})`;
        darkBg.style.backgroundImage = `url(${chrome.runtime.getURL('images/night_background.jpg')})`;

        // 디졸빙 효과: 기본은 1->0, 다크는 0->1
        defaultBg.style.opacity = '1';
        darkBg.style.opacity = '0';

        // 동시에 전환 시작
        requestAnimationFrame(() => {
            defaultBg.style.opacity = '0';
            darkBg.style.opacity = '1';
        });
    }

    // body 클래스 변경
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
    // 로컬 캐시 데이터 로드
    console.log("로컬 캐시 데이터 로드");
    loadLocalData();
    
    // 테마 초기화 (즉시 적용)
    const savedTheme = localStorage.getItem('theme') || 'default';
    initializeTheme(savedTheme);
    
    // 테마 버튼 이벤트 리스너 추가
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.getAttribute('data-theme');
            changeTheme(theme);
        });
    });
    
    // 유틸리티 버튼 이벤트 리스너 추가
    const utilityButtons = document.querySelectorAll('.glass-button, .small-glass-button');
    utilityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const url = button.getAttribute('data-url');
            if (url) {
                chrome.tabs.create({ url: url });
            }
        });
    });
    
    // 공지사항 행 클릭 이벤트 리스너 추가
    document.addEventListener('click', (event) => {
        if (event.target.closest('.notice-row')) {
            const row = event.target.closest('.notice-row');
            const link = row.getAttribute('data-link');
            if (link && link !== '#') {
                chrome.tabs.create({ url: link });
            }
        }
    });
    
    // 새로고침 버튼 이벤트 리스너 추가
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log("새로고침 버튼 클릭됨");

            // 크롤링 시작 시 메시지 변경
            const lastUpdateElement = document.getElementById('last-update');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = "업데이트 중...";
            }

            try {
                const response = await chrome.runtime.sendMessage({ action: 'update_notices' });
                if (response && response.success) {
                    console.log("크롤링 성공");
                    await loadLocalData();
                } else {
                    console.log("크롤링 실패:", response ? response.error : "응답 없음");
                    await loadLocalData();
                }
            } catch (error) {
                console.log("크롤링 실패:", error.message);
                await loadLocalData();
            }
        });
    }

    // 학식 토글 버튼 이벤트 리스너 추가
    const mealToggleBtn = document.getElementById('meal-toggle');
    if (mealToggleBtn) {
        mealToggleBtn.addEventListener('click', () => {
            const mealContainer = document.querySelector('.meal-container');
            if (mealContainer) {
                const isHidden = mealContainer.classList.contains('hidden');

                if (isHidden) {
                    // 급식 표시
                    mealContainer.classList.remove('hidden');
                    mealContainer.classList.add('show');
                    mealToggleBtn.textContent = '🍽️ 학식 닫기';
                    mealToggleBtn.classList.add('active');
                } else {
                    // 급식 숨기기
                    mealContainer.classList.remove('show');
                    mealContainer.classList.add('hidden');
                    mealToggleBtn.textContent = '🍽️ 학식 보기';
                    mealToggleBtn.classList.remove('active');
                }
            }
        });
    }
});

// 로컬 캐시 데이터 로딩 함수
async function loadLocalData() {
    try {
        const scheduleResponse = await fetch(chrome.runtime.getURL('schedule_cache.json'), { cache: 'no-cache' });
        const scheduleData = await scheduleResponse.json();
        schedule = scheduleData.schedule;
        console.log("학사일정 로드됨:", schedule);

        const noticeResponse = await fetch(chrome.runtime.getURL('notice_cache.json'), { cache: 'no-cache' });
        const noticeData = await noticeResponse.json();
        const notices = noticeData.notices || [];
        console.log(`공지사항 ${notices.length}개 로드됨`);

        const mealResponse = await fetch(chrome.runtime.getURL('meal_cache.json'), { cache: 'no-cache' });
        const mealData = await mealResponse.json();
        meals = mealData.meals || [];
        console.log(`학식 ${meals.length}개 로드됨`);

        // 캐시 유효성 확인 (12시간 이내)
        const now = new Date();
        const scheduleTimestamp = new Date(scheduleData.timestamp || 0);
        const noticeTimestamp = new Date(noticeData.timestamp || 0);
        const mealTimestamp = new Date(mealData.timestamp || 0);
        
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const isCacheValid = scheduleTimestamp > twelveHoursAgo && noticeTimestamp > twelveHoursAgo && mealTimestamp > twelveHoursAgo;
        
        if (!isCacheValid) {
            console.log("캐시가 오래되었어 전체 크롤링을 시작합니다.");
            // 백그라운드에서 크롤링 시작 (UI 블로킹 방지)
            chrome.runtime.sendMessage({ action: 'update_cache' }).then((response) => {
                if (response && response.success) {
                    console.log("백그라운드 크롤링 성공");
                    // 크롤링 완료 후 데이터 재로드
                    setTimeout(() => loadLocalData(), 1000);
                } else {
                    console.log("백그라운드 크롤링 실패");
                }
            }).catch((error) => {
                console.log("크롤링 메시지 전송 실패:", error);
            });
        }

        const noticeTbody = document.querySelector('.notice-table tbody');
        if (noticeTbody) {
            noticeTbody.innerHTML = notices.slice(0, 20).map(notice => `
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

        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            // 캐시가 유효하면 타임스탬프 표시, 아니면 업데이트 중 표시
            if (isCacheValid) {
                const latestTimestamp = new Date(Math.max(scheduleTimestamp, noticeTimestamp, mealTimestamp));
                lastUpdateElement.textContent = `최근 업데이트: ${latestTimestamp.toLocaleString('ko-KR')}`;
            } else {
                lastUpdateElement.textContent = "업데이트 중...";
            }
            // 점프 효과
            lastUpdateElement.classList.remove('highlight');
            void lastUpdateElement.offsetWidth;
            lastUpdateElement.classList.add('highlight');
        }

        // 급식 데이터 표시
        const mealTbody = document.querySelector('.meal-table tbody');
        if (mealTbody && meals) {
            const today = new Date().getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
            const dayIndex = today === 0 ? 6 : today - 1; // 월(0), 화(1), 수(2), 목(3), 금(4), 토(5), 일(6)

            mealTbody.innerHTML = meals.map(meal => {
                const todayMenu = meal.menus[dayIndex] || '메뉴 정보 없음';
                const isAvailable = todayMenu && !todayMenu.includes('등록된 메뉴가 없습니다');
                const prices = meal.prices[dayIndex] || '';

                return `
                    <tr class="meal-row ${isAvailable ? '' : 'no-menu'}">
                        <td class="meal-time-cell">
                            <div class="meal-content">
                                <span class="meal-time">⦁ ${meal.time}</span>
                                <div class="meal-info-row">
                                    <span class="meal-menu">${isAvailable ? todayMenu : '운영하지 않음'}</span><span class="meal-price">(${isAvailable ? prices : ''})</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 타이머 시작
        updateCountdown();
        setInterval(updateCountdown, 1000);

    } catch (error) {
        console.error("로컬 데이터 로드 실패:", error);
        mockLoadData();
    }
}

// --- Mock 데이터 함수 ---
function mockLoadData() {
    // Mock 학사일정 데이터
    schedule = {
        first_start: "03.01",
        first_end: "06.20",
        second_start: "09.01",
        second_end: "12.20"
    };

    // 타이머 시작
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Mock 공지사항 데이터
    const mockNotices = [
        { date: "2025-10-07", title: "Mock 공지사항 1", link: "#" },
        { date: "2025-10-06", title: "Mock 공지사항 2", link: "#" }
    ];

    const noticeTbody = document.querySelector('.notice-table tbody');
    if (noticeTbody) {
        noticeTbody.innerHTML = mockNotices.map(notice => `
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

    const lastUpdateElement = document.getElementById('last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `최종 업데이트: ${new Date().toLocaleString('ko-KR')}`;
        // 점프 효과
        lastUpdateElement.classList.remove('highlight');
        void lastUpdateElement.offsetWidth;
        lastUpdateElement.classList.add('highlight');
    }
}

// 전역 함수 등록
window.changeTheme = changeTheme;

document.getElementById('shortcut-toggle').addEventListener('click', () => {
    const buttons = document.querySelectorAll('.small-glass-button');
    buttons.forEach(btn => btn.classList.toggle('hidden'));
});