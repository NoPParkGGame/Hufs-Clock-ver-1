# HUFS 종강시계

한국외대 학생들을 위한 실시간 학사일정, 공지사항, 학식 정보를 제공하는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

- 실시간 학기 개강/종강 카운트다운
- 통합 공지사항 표시 (일반 + 학사)
- 실시간 학식 메뉴
- 다크/라이트 테마 지원
- 하루 한 번 자동 데이터 업데이트

## 🚀 설치

### Chrome Web Store
1. [Chrome Web Store](https://chrome.google.com/webstore)에서 "HUFS 종강시계" 검색 (출시 후)
2. 설치 후 새 탭 열기

### 로컬에서 직접 설치
1. 이 GitHub 저장소의 코드를 다운로드합니다.
2. Chrome 브라우저에서 `chrome://extensions/` 주소로 이동합니다.
3. 오른쪽 상단의 **개발자 모드(Developer mode)**를 활성화합니다.
4. **압축해제된 확장 프로그램을 로드합니다(Load unpacked)** 버튼을 클릭하고, 다운로드한 `Hufs_Clock` 폴더를 선택합니다.

## 🔄 아키텍처

이 프로젝트는 크롬 확장 프로그램(Frontend)과 Vercel API 서버(Backend)로 분리되어 있습니다.

```
[사용자]          [Chrome 확장 프로그램]             [Vercel API 서버]              [HUFS 웹사이트]
   |                   |                            |
   |---(새 탭 열기)-->  | --(하루 한 번 API 요청)-->  | --(데이터 크롤링)--> |
   |                   |                            |                            |
   |                   | <----(JSON 데이터 응답)---- | <-------------------------- |
   |                   |
   | <----(UI 표시)---- |
```

- **Frontend (Chrome Extension):** 사용자가 보는 UI를 담당하며, `chrome.storage`에 캐시된 데이터를 보여줍니다.
- **Backend (Vercel API):** `Python (FastAPI)`로 구현되었으며, 12시간 주기로 HUFS 웹사이트의 데이터를 크롤링하여 캐시합니다. 확장 프로그램은 이 API를 통해 모든 데이터를 공급받습니다.

## 🛠️ 기술 스택

### Frontend (Chrome Extension)
- **HTML5 / CSS3**
- **Vanilla JavaScript (ES6+)**
- **Chrome Extension Manifest V3**
- **Service Worker** & **Storage API**

### Backend (API Server)
- **Python 3.9+**
- **FastAPI**: API 서버 구축
- **BeautifulSoup4**: HTML 파싱 및 데이터 추출
- **Requests**: HTTP 통신
- **Vercel**: 서버리스(Serverless) API 배포 및 호스팅

## 🧑‍💻 개발

이 프로젝트는 두 부분으로 나뉘어 개발됩니다.

### 1. API 서버 (`Hufs_Clock_API` 폴더)
백엔드 API 서버입니다. 로컬에서 테스트하려면:
```bash
# Hufs_Clock_API 폴더로 이동
cd Hufs_Clock_API

# 가상환경 생성 및 활성화 (권장)
python -m venv venv
source venv/bin/activate  # macOS/Linux
.\venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 로컬 서버 실행
uvicorn index:app --reload
```

### 2. 크롬 확장 프로그램 (`Hufs_Clock` 폴더)
사용자가 설치하는 프론트엔드입니다. 로컬에서 테스트하려면 `chrome://extensions/`에서 `Hufs_Clock` 폴더를 로드하면 됩니다.

**참고:** 로컬 개발 시, 확장 프로그램이 로컬 API 서버(`http://127.0.0.1:8000`)를 바라보게 하려면 `background.js`의 `API_ENDPOINT` 변수를 수정해야 할 수 있습니다.

## 🐛 문제 해결

- **데이터가 업데이트되지 않는 경우:**
  1. 확장 프로그램 팝업의 새로고침 버튼을 눌러 강제로 데이터를 업데이트합니다.
  2. Vercel 대시보드에서 API 서버의 로그를 확인하여 크롤링 오류가 없는지 확인합니다.

- **화면이 제대로 표시되지 않는 경우:**
  1. `chrome://extensions/`에서 확장 프로그램을 새로고침(리로드)합니다.
  2. 개발자 도구(F12)의 콘솔(Console) 탭에서 오류 메시지를 확인합니다.