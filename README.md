# HUFS 종강시계 Chrome Extension

한국외대 종강/개강까지 남은 시간을 보여주는 Chrome Extension입니다.

## 주요 기능

실시간 학사일정, 공지사항, 급식 정보 표시
자동 캐시 관리 (12시간 유효기간)
토글 기능, 반응형 디자인, 다중 테마 지원

## Chrome Web Store 설치

1. HUFS 종강시계에서 설치
2. Chrome에 자동 추가됨
3. 바로 사용 가능

문제가 발생하면 register_host.bat를 관리자 권한으로 실행

## 로컬 개발용 설치

1. 패키지 설치
   pip install -r requirements.txt

2. Native Messaging Host 등록
   register_host.bat를 관리자 권한으로 실행

3. Extension ID 설정
   - chrome://extensions/에서 ID 복사
   - native_messaging_host.json의 allowed_origins 수정

4. Chrome Extension 로드
   - chrome://extensions/에서 개발자 모드 활성화
   - 압축해제된 확장 프로그램 로드 선택
   - Hufs_Clock 폴더 선택

## 사용법

- 팝업: 확장 프로그램 아이콘 클릭
- 새로고침 버튼: 공지사항 즉시 크롤링
- 캐시 만료 시 자동 백그라운드 크롤링

## 캐시 및 크롤링

- 유효기간: 12시간
- 수동 크롤링: python update_cache.py (전체) 또는 python update_cache.py notices (공지사항만)

## 파일 구조

Hufs_Clock/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── native_messaging_host.py
├── update_cache.py
├── native_messaging_host.json
├── register_host.bat
├── requirements.txt
├── css/
│   ├── main.css
│   ├── responsive.css
│   ├── components/
│   └── themes/
├── fonts/
├── icons/
├── images/
└── README.md

## 크롤링 데이터

학사일정, 공지사항, 급식 정보
저장: schedule_cache.json, notice_cache.json, meal_cache.json

## 기술 스택

Frontend: HTML, CSS, JavaScript
Backend: Python (크롤링)
통신: Chrome Native Messaging API
크롤링: BeautifulSoup, requests, Selenium

## 공지사항 기능

- 일반 공지사항 + 학사 공지사항 통합 표시
- 날짜 내림차순 정렬 (최신 공지 우선)
- 최대 20개 표시
- 모바일 최적화 (세로 배치, 중앙 정렬)

## 문제 해결

Native Messaging 오류
- register_host.bat 관리자 권한 재실행

크롤링 오류
- register_host.bat 재실행
- Extension ID 확인

설치 오류
- Python 3.8+ 설치 확인
- pip install -r requirements.txt 재실행

## 개발자 노트

캐시 전략: 12시간 유효기간
병렬 크롤링: 속도 향상
DOM 최적화: 성능 개선
모듈화: 유지보수성 향상
모바일 반응형: 세로 레이아웃 적용