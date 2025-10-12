# HUFS 종강시계

한국외대 학생들을 위한 실시간 학사일정, 공지사항, 학식 정보를 제공하는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

- 실시간 학기 개강/종강 카운트다운
- 통합 공지사항 표시 (일반 + 학사 공지)
- 실시간 학식 메뉴
- 다크/라이트 테마 지원
- 자동 데이터 캐싱 (12시간)

## 🚀 설치

### Chrome Web Store
1. [Chrome Web Store](https://chrome.google.com/webstore)에서 "HUFS 종강시계" 검색
2. 설치 후 새 탭 열기

### 로컬 개발
```bash
# 환경 확인
python --version  # 3.8+

# 의존성 설치
pip install -r requirements.txt

# 호스트 등록 (관리자 권한)
register_host.bat

# Chrome 확장 프로그램 로드
# chrome://extensions/ → 개발자 모드 → 압축해제된 확장 프로그램 로드 → Hufs_Clock 폴더 선택
```

##  사용법

- 아이콘 클릭 → 팝업 표시
- 테마 버튼 → 다크/라이트 모드 전환
- 학식 버튼 → 급식 메뉴 토글
- 새로고침 버튼 → 공지사항 업데이트

## 🔄 크롤링 시스템

```
사용자 액션 → 캐시 체크 → 크롤링 요청 → 병렬 처리 → 데이터 저장 → UI 업데이트
      ↓          ↓           ↓          ↓           ↓           ↓
   팝업 열기 → 12시간 검증 → background.js → update_cache.py → JSON 캐시 → 리로드
```

**주요 특징:**
- **12시간 자동 캐싱**: 불필요한 크롤링 방지
- **병렬 크롤링**: 학사일정 + 공지사항 + 급식 동시 처리
- **지능적 업데이트**: 캐시 유효시 요청 생략

## �️ 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업 및 접근성
- **CSS3**: Flexbox, Grid, CSS Variables, 반응형 디자인
- **Vanilla JavaScript**: ES6+ 모던 자바스크립트, 비동기 처리

### Backend
- **Python 3.8+**: 크롤링 및 데이터 처리
- **BeautifulSoup4**: HTML 파싱 및 데이터 추출
- **Requests**: HTTP 클라이언트 및 API 통신
- **Selenium**: 동적 웹페이지 처리 및 자동화

### Chrome Extension
- **Manifest V3**: 최신 확장 프로그램 표준
- **Native Messaging API**: Python ↔ JavaScript 안전 통신
- **Service Worker**: 백그라운드 작업 및 이벤트 처리
- **Storage API**: 로컬 데이터 및 설정 관리

## �🐛 문제 해결

### 설치 오류
```bash
# Python 버전 확인 (3.8+ 필요)
python --version

# 의존성 설치
pip install -r requirements.txt

# 호스트 등록 (관리자 권한 필수)
register_host.bat
```

### 크롤링 실패
```bash
# 전체 데이터 크롤링
python update_cache.py

# 공지사항만 업데이트
python update_cache.py notices
```

### 캐시 문제
```
# 캐시 파일들 삭제
rm *_cache.json

# 확장 프로그램 재시작
```

### 기타 문제
- **확장 프로그램이 작동하지 않음**: `chrome://extensions/`에서 재로드
- **데이터가 표시되지 않음**: 캐시 파일 삭제 후 재시작
- **네이티브 메시징 오류**: `register_host.bat` 재실행

---

