# HUFS 종강시계 Chrome Extension

한국외대 종강/개강까지 남은 시간을 보여주는 Chrome Extension입니다.

## 기능
- 실시간 종강/개강까지 남은 시간 표시
- 최신 HUFS 공지사항 표시
- 테마 변경 (기본/다크)
- 유틸리티 버튼 (종정시, 홈페이지, 이클래스, 도서관)
- **새로고침 버튼으로 자동 크롤링**

## 자동 크롤링 설정 (권장) - Native Messaging 방식

새로고침 버튼을 누르면 자동으로 최신 데이터를 크롤링합니다. (권장)

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

### 4. Extension 사용
- Chrome에서 extension 로드 (`chrome://extensions/` → "압축해제된 확장 프로그램 로드")
- 새로고침 버튼 클릭 → 자동 크롤링 실행
- 공지사항과 업데이트 시간이 실시간으로 갱신됨

## 자동 크롤링 설정 (대안) - Flask 서버 방식

Flask 서버를 사용하는 대안 방법입니다.

### 1. 패키지 설치
```bash
pip install -r requirements.txt
```

### 2. Flask 서버 실행
`run_flask.bat`를 더블클릭하거나 터미널에서 실행:
```bash
python flask_server.py
```

서버가 `http://127.0.0.1:5000`에서 실행됩니다.

### 3. Extension 사용
- Chrome에서 extension 로드 (`chrome://extensions/` → "압축해제된 확장 프로그램 로드")
- 새로고침 버튼 클릭 → 자동 크롤링 실행
- 공지사항과 업데이트 시간이 실시간으로 갱신됨

## 수동 크롤링 (백업 방법)
자동 크롤링이 작동하지 않는 경우:
```bash
python update_cache.py
```

## Firebase 설정 (옵션)
기존 Firebase 동기화 기능을 사용하려면:
- [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성.
- Firestore 데이터베이스 활성화 (테스트 모드).
- 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성하여 `serviceAccountKey.json` 다운로드.
- `serviceAccountKey.json`을 `Hufs_Clock` 폴더에 배치.

### 2. 데이터 업로드
- Python 환경에서 `functions/requirements.txt` 설치:
  ```
  pip install -r functions/requirements.txt
  ```
- 데이터 업로드 실행:
  ```
  python upload_data.py
  ```

### 3. Chrome Extension 로드
- Chrome 브라우저에서 `chrome://extensions/` 접속.
- 개발자 모드 활성화.
- "압축해제된 확장 프로그램 로드" 선택 후 `Hufs_Clock` 폴더 선택.
- 확장 프로그램 아이콘 클릭하여 팝업 테스트.

## 파일 구조
- `popup.html`: 팝업 UI
- `popup.js`: 팝업 로직 및 Firebase 연동
- `manifest.json`: 확장 프로그램 설정
- `upload_data.py`: 데이터 업로드 스크립트
- `css/`: 스타일시트
- `images/`: 배경 이미지
- `icons/`: 확장 프로그램 아이콘

## 주의사항
- Firebase config는 `popup.js`에 실제 값으로 교체하세요.
- 데이터는 Firestore의 `hufs_data` 컬렉션에 저장됩니다.