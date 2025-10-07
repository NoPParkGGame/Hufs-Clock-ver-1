# HUFS 종강시계 Chrome Extension

한국외대 종강/개강까지 남은 시간을 보여주는 Chrome Extension입니다.

## 기능
- 실시간 종강/개강까지 남은 시간 표시
- 최신 HUFS 공지사항 표시 (최근 10개)
- 테마 변경 (기본/다크)
- 유틸리티 버튼 (종정시, 홈페이지, 이클래스, 도서관)
- **새 탭 페이지 지원** - Chrome 새 탭을 열 때 HUFS 시계 표시
- **새로고침 버튼으로 자동 크롤링** (Native Messaging 방식)

## 설치 및 설정

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
- 새로고침 버튼 클릭 → 자동 크롤링 실행
- 공지사항과 학사일정이 실시간으로 갱신됨

## 수동 크롤링 (백업 방법)
자동 크롤링이 작동하지 않는 경우:
```bash
python update_cache.py
```

## 파일 구조
```
Hufs_Clock/
├── manifest.json              # 확장 프로그램 설정 (새 탭 오버라이드 포함)
├── popup.html                 # 팝업 UI
├── newtab.html                # 새 탭 UI (popup.html과 동일)
├── popup.js                   # 팝업/새 탭 로직
├── background.js              # Native Messaging 처리
├── native_messaging_host.py   # Python 네이티브 호스트
├── update_cache.py            # 데이터 크롤링 스크립트
├── native_messaging_host.json # 네이티브 호스트 설정
├── register_host.bat          # 호스트 등록 배치 파일
├── requirements.txt           # Python 패키지 목록
├── css/                       # 스타일시트
│   ├── main.css              # 메인 스타일
│   ├── newtab.css            # 새 탭 전용 스타일
│   ├── components/           # 컴포넌트별 스타일
│   ├── themes/               # 테마 관련 스타일
│   └── responsive.css        # 반응형 디자인
├── images/                    # 배경 이미지
├── icons/                     # 확장 프로그램 아이콘
└── README.md                  # 이 파일
```

## 크롤링 데이터
- **학사일정**: 1학기/2학기 개강/종강 일정
- **공지사항**: HUFS 공지사항 최근 10개
- **저장 위치**: `schedule_cache.json`, `notice_cache.json`

## 기술 스택
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (크롤링)
- **통신**: Chrome Native Messaging API
- **크롤링**: BeautifulSoup, requests

## 문제 해결
- **크롤링 실패**: `register_host.bat`를 관리자 권한으로 재실행
- **Extension ID 오류**: `native_messaging_host.json`의 allowed_origins 확인
- **새 탭 표시 안됨**: manifest.json의 chrome_url_overrides 확인

## 개발자 노트
- 새 탭 페이지는 팝업과 동일한 UI를 사용
- 크롤링은 Python subprocess로 실행되어 보안 유지
- 테마는 CSS 변수로 동적 변경 지원
