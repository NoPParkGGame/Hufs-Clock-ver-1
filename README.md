# HUFS 종강시계 Chrome Extension

한국외대 종강/개강까지 남은 시간을 보여주는 Chrome Extension입니다.

## 주요 기능

- **실시간 학사일정**: 1학기/2학기 개강/종강까지 남은 시간 표시
- **공지사항**: HUFS 공지사항 최근 10개 실시간 표시
- **급식 정보**: 학식 메뉴 및 가격 정보 (요일별)
- **자동 캐시 관리**: 12시간 유효기간으로 자동 데이터 갱신
- **토글 기능**: 급식/단축키 표시 토글
- **반응형 디자인**: 다양한 화면 크기 지원
- **다중 테마**: 라이트/다크 테마 지원

## Chrome Web Store 설치 (권장)

Chrome Web Store에서 다운로드하여 설치하는 방법입니다.

### 1. Extension 설치
- [HUFS 종강시계](https://chromewebstore.google.com/detail/hufs-%EC%A2%85%EA%B0%95%EC%8B%9C%EA%B3%84/pgfecnhkdopaheeiipmfikblmjmiiojj)에서 설치
- Chrome에 자동으로 추가됩니다

### 2. Native Messaging 설정 (중요!)
Chrome Web Store 버전은 자동으로 설정되어 있으니 바로 사용 가능합니다.

**문제가 발생하는 경우:**
1. `register_host.bat`를 **관리자 권한으로** 실행
2. 크롤링이 작동하는지 확인

## 로컬 개발용 설치

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. Native Messaging Host 등록
`register_host.bat`를 **관리자 권한으로** 실행:
```bash
# 관리자 권한으로 실행
register_host.bat
```

### 3. Extension ID 확인 및 설정
- Chrome에서 `chrome://extensions/` 열기
- "HUFS 종강시계 v2" 확장 프로그램의 ID 복사
- `native_messaging_host.json` 파일 열기
- `"chrome-extension://YOUR_EXTENSION_ID/"` 부분을 실제 ID로 변경:
  ```json
  "allowed_origins": [
      "chrome-extension://복사한ID/"
  ]
  ```

### 4. Chrome Extension 로드
- Chrome에서 `chrome://extensions/` 접속
- 개발자 모드 활성화
- "압축해제된 확장 프로그램 로드" 선택 후 `Hufs_Clock` 폴더 선택

### 5. Extension 사용
- **팝업 사용**: 확장 프로그램 아이콘 클릭
- **새 탭 사용**: 새 탭 열기 (chrome://newtab)
- 새로고침 버튼 클릭 → 공지사항 즉시 크롤링
- 캐시 만료 시 자동 백그라운드 크롤링

## 캐시 및 크롤링

### 자동 캐시 관리
- **유효기간**: 12시간
- **동작 방식**: 팝업 열 때 캐시 확인 → 만료 시 백그라운드 자동 크롤링
- **장점**: 빠른 로딩 + 최신 데이터 유지

### 수동 크롤링 (백업 방법)
자동 크롤링이 작동하지 않는 경우:
```bash
# 전체 크롤링
python update_cache.py

# 공지사항만 크롤링
python update_cache.py notices
```

## 파일 구조
```
Hufs_Clock/
├── manifest.json              # 확장 프로그램 설정
├── popup.html                 # 팝업 UI
├── popup.js                   # 팝업 로직 (캐시 관리, 이벤트 처리)
├── background.js              # Native Messaging 및 백그라운드 처리
├── native_messaging_host.py   # Python 네이티브 호스트
├── update_cache.py            # 데이터 크롤링 및 캐시 관리
├── native_messaging_host.json # 네이티브 호스트 설정
├── register_host.bat          # 호스트 등록 배치 파일
├── requirements.txt           # Python 패키지 목록
├── css/                       # 스타일시트
│   ├── main.css              # 메인 스타일
│   ├── responsive.css        # 반응형 디자인
│   ├── components/           # 컴포넌트별 스타일
│   │   ├── current-time.css
│   │   ├── meal.css
│   │   ├── notice-board.css
│   │   └── timer.css
│   └── themes/               # 테마 관련 스타일
│       ├── layout.css
│       ├── themes.css
│       └── transitions.css
├── fonts/                     # 폰트 파일
├── icons/                     # 확장 프로그램 아이콘
├── images/                    # 배경 이미지
├── cache/                     # 캐시 파일들
│   ├── schedule_cache.json   # 학사일정 캐시
│   ├── notice_cache.json     # 공지사항 캐시
│   └── meal_cache.json       # 급식 정보 캐시
└── README.md                  # 이 파일
```

## 크롤링 데이터

- **학사일정**: 1학기/2학기 개강/종강 일정 (schedule_cache.json)
- **공지사항**: HUFS 공지사항 최근 10개 (notice_cache.json)
- **급식 정보**: 학식 메뉴 및 가격 정보 (meal_cache.json)
- **크롤링 방식**: 병렬 처리로 속도 최적화

## 기술 스택

- **Frontend**: HTML, CSS, JavaScript (ES6+)
- **Backend**: Python 3.8+ (크롤링)
- **통신**: Chrome Native Messaging API
- **크롤링**: BeautifulSoup, requests, Selenium (급식용)
- **병렬 처리**: concurrent.futures
- **캐시 관리**: JSON 기반 로컬 캐시

## UI 기능

### 토글 버튼
- **급식 토글**: 급식 정보 표시/숨김
- **단축키 토글**: 추가 버튼 표시/숨김

### 반응형 디자인
- 모바일/태블릿/데스크톱 지원
- CSS Grid/Flexbox 활용

### 테마 시스템
- CSS 변수 기반 동적 테마 변경
- 라이트/다크 모드 지원

## 문제 해결

### Native Messaging 오류
- **"Access to the specified native messaging host is forbidden"**
  - **원인**: Extension ID가 native_messaging_host.json에 등록되지 않음
  - **해결**: `register_host.bat`를 관리자 권한으로 재실행

### 크롤링 관련 오류
- **크롤링 실패**: `register_host.bat`를 관리자 권한으로 재실행
- **캐시 로드 실패**: cache 폴더 권한 확인
- **백그라운드 크롤링 실패**: background.js 로그 확인

### UI 관련 오류
- **토글 버튼 동작 안함**: popup.js 이벤트 리스너 확인
- **스타일 적용 안됨**: CSS 파일 로드 확인
- **반응형 깨짐**: responsive.css 확인

### 설치 관련 오류
- **Python 설치 오류**: `python --version`으로 Python 3.8+ 설치 확인
- **패키지 설치 실패**: `pip install -r requirements.txt` 재실행
- **호스트 등록 실패**: 관리자 권한으로 `register_host.bat` 실행
- **Extension ID 오류**: `native_messaging_host.json`의 allowed_origins 확인

## 개발자 노트

- **캐시 전략**: 12시간 유효기간으로 성능/신선도 균형
- **병렬 크롤링**: concurrent.futures로 크롤링 속도 향상
- **DOM 최적화**: DocumentFragment로 렌더링 성능 개선
- **이벤트 위임**: 효율적인 이벤트 처리
- **모듈화**: 상수/함수 분리로 유지보수성 향상
- **에러 처리**: try-catch와 폴백 데이터로 안정성 확보

## 버전 히스토리

- **v2.0**: 캐시 자동 관리, UI 최적화, 토글 기능 추가
- **v1.0**: 기본 기능 구현 (크롤링, 팝업 표시)