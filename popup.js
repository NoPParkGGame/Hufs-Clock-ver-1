let schedule = null; // 학사일정 데이터를 저장할 변수

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
    const utilityButtons = document.querySelectorAll('.glass-button');
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

            try {
                const response = await chrome.runtime.sendMessage({ action: 'update_cache' });
                if (response.success) {
                    console.log("크롤링 성공");
                    await loadLocalData();
                } else {
                    console.log("크롤링 실패:", response.error);
                    await loadLocalData();
                }
            } catch (error) {
                console.log("크롤링 실패:", error.message);
                await loadLocalData();
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

        const noticeTbody = document.querySelector('.notice-table tbody');
        if (noticeTbody) {
            noticeTbody.innerHTML = notices.slice(0, 10).map(notice => `
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
            // refresh 버튼을 누를 때마다 현재 시간을 표시 (마지막 확인 시간)
            const currentTime = new Date().toLocaleString('ko-KR');
            lastUpdateElement.textContent = `최근 업데이트: ${currentTime}`;
            // 점프 효과
            lastUpdateElement.classList.remove('highlight');
            void lastUpdateElement.offsetWidth;
            lastUpdateElement.classList.add('highlight');
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

