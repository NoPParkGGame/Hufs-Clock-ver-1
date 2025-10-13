# HUFS 종강시계

한국외국어대학교 학생들을 위한 실시간 학사일정, 공지사항, 학식 정보를 제공하는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

- 실시간 학기 개강/종강 카운트다운
- 통합 공지사항 (일반 + 학사) 실시간 확인
- 오늘의 학식 메뉴 확인
- 다크/라이트 모드 테마 지원
- 하루 한 번, 최신 정보로 자동 업데이트

## 🚀 설치 방법

1. 이 GitHub 저장소의 코드를 다운로드합니다.
2. Chrome 브라우저에서 `chrome://extensions/` 주소로 이동합니다.
3. 오른쪽 상단의 **개발자 모드(Developer mode)**를 활성화합니다.
4. **압축해제된 확장 프로그램을 로드합니다(Load unpacked)** 버튼을 클릭하고, 다운로드한 `Hufs_Clock` 폴더를 선택하면 즉시 설치됩니다.

## 🔄 아키텍처

이 프로젝트는 사용자의 브라우저에 설치되는 **크롬 확장 프로그램(Frontend)**과, 실제 데이터 크롤링을 담당하는 **Vercel API 서버(Backend)**로 분리되어 있습니다.

- **Frontend:** 사용자가 보는 UI를 담당하며, 하루에 한 번 최신 데이터를 API 서버에 요청하여 내부 저장소(`chrome.storage`)에 캐시합니다.
- **Backend:** `Python (FastAPI)`으로 구현되었으며, HUFS 웹사이트의 데이터를 크롤링하여 확장 프로그램에 JSON 형태로 제공합니다. 서버 자체적으로도 12시간 캐시를 사용하여 HUFS 서버의 부하를 최소화합니다.

## 🛠️ 기술 스택

- **Frontend (Chrome Extension)**
  - HTML5 / CSS3 / Vanilla JavaScript (ES6+)
  - Chrome Extension Manifest V3

- **Backend (API Server)**
  - Python / FastAPI
  - BeautifulSoup4 / Requests
  - Vercel (Serverless Hosting)

## 🐛 문제 해결

- **데이터가 업데이트되지 않는 경우:**
  - 확장 프로그램 팝업의 새로고침 버튼을 눌러 강제로 데이터를 업데이트할 수 있습니다.
  - 만약 계속 실패한다면, API 서버가 호스팅된 Vercel의 상태를 확인하거나, HUFS 웹사이트 자체의 변경이 있었는지 확인해야 합니다.

- **화면이 제대로 표시되지 않는 경우:**
  - `chrome://extensions/`에서 확장 프로그램을 새로고침(리로드)하는 것으로 대부분 해결됩니다.
