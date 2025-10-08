# HUFS 종강시계 Chrome Extension

한국외대 종강/개강까지 남은 시간을 보여주는 Chrome Extension입니다.

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

### Native Messaging 오류
- **"Access to the specified native messaging host is forbidden"**
  - **원인**: Extension ID가 native_messaging_host.json에 등록되지 않음
  - **해결**: `register_host.bat`를 관리자 권한으로 재실행
  - **확인**: Chrome Web Store 버전은 자동으로 설정되어 있음

### 크롤링 관련 오류
- **크롤링 실패**: `register_host.bat`를 관리자 권한으로 재실행
- **Extension ID 오류**: `native_messaging_host.json`의 allowed_origins 확인
- **새 탭 표시 안됨**: manifest.json의 chrome_url_overrides 확인

### 설치 관련 오류
- **Python 설치 오류**: `python --version`으로 Python 3.8+ 설치 확인
- **패키지 설치 실패**: `pip install -r requirements.txt` 재실행
- **호스트 등록 실패**: 관리자 권한으로 `register_host.bat` 실행
- **Extension ID 오류**: `native_messaging_host.json`의 allowed_origins 확인
- **새 탭 표시 안됨**: manifest.json의 chrome_url_overrides 확인

## 개발자 노트
- 새 탭 페이지는 팝업과 동일한 UI를 사용
- 크롤링은 Python subprocess로 실행되어 보안 유지
- 테마는 CSS 변수로 동적 변경 지원