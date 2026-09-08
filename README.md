# 🎨 Interpersonal Design Diagram (PPD APP)
> 개인 선호도 수치와 시스템 규칙에 따라 자신만의 브랜드 로고를 실시간 렌더링하고 고화질 JPEG로 다운로드하는 웹 애플리케이션

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

---

## 📌 주요 특징 (Key Features)

1. **3가지 색상선 & 두께 계층 (Line Hierarchy)**:
   - 🟦 **파란색 (Cyan Blue - 외모)**: 제일 두꺼운 선 (28px) — 바탕 레이어
   - 🟥 **빨간색 (Magenta Red - 성격)**: 중간 두께 선 (16px) — 중간 레이어
   - 🟨 **노란색 (Yellow - 취미/특기)**: 가장 가는 선 (8px) — **최상단 맨 위 레이어 (모든 선 및 점 위에 노출)**

2. **A, C, B 그룹 박스 구조화 UI 레이아웃 (Structure Layout)**:
   - 책의 시스템 구조 도표와 동일하게 **A 그룹 (1~3번)**, **C 그룹 (4~5번)**, **B 그룹 (6~8번)**을 네모 박스 테두리와 A/C/B 뱃지로 구별하여 배치했습니다.
   - `1↔6`, `2↔7`, `3↔8` 수직 상반 관계를 한눈에 직관적으로 파악할 수 있습니다.

3. **선택 점 채움 & 번호 순서 오름차순 자동 연결 (Method 규칙)**:
   - 사용자가 번호를 클릭하는 순서와 관계없이, 선택된 번호 위치의 동그라미(노드 점)가 색상으로 먼저 채워집니다.
   - 선은 **오름차순 번호 순서(`1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 ➔ 8`)로 규칙에 맞게 자동 연결**됩니다.

3. **1:1 상반 번호 자동 제약 시스템 ($A \neq B$)**:
   - `1번 ↔ 6번`, `2번 ↔ 7번`, `3번 ↔ 8번`은 서로 1:1로 직접 대응하는 상반 항목입니다.
   - 예: `1번`을 선택하면 **상반되는 `6번`만 비활성화**되며, `2, 3, 7, 8번`은 자유롭게 조합이 가능합니다.
   - 이미 선택한 번호를 다시 누르면 **선택 해제 (토글 OFF)**됩니다.

3. **종속 규칙 ($C \subset A \text{ or } B$)**:
   - `4~5번` 항목은 단독으로 선택할 수 없으며, 1~3번 또는 6~8번 항목과 함께 선택되어야 선이 구성됩니다.

4. **곡선 영문 타이포그래피 (Noto Sans KR Medium)**:
   - 52px 크기의 시원하고 여유로운 **Noto Sans KR Medium (500)** 곡선 자간 배치.

5. **마우스 오버(Hover) 실시간 툴팁 & 2000x2000px JPEG 다운로드**:
   - 캔버스 노드 및 버튼 마우스 오버 시 항목 설명 팝업 카드 제공.

---

## 📂 파일 구조 (Directory Structure)

```
ppd APP/
├── index.html       # 웹 앱 UI 메인 HTML
├── style.css        # 모던 웹 디자인 및 레이아웃 CSS
├── app.js           # HTML5 Canvas 렌더링 & 토글/규칙 제어 엔진
├── server.js        # Node.js 경량 로컬 웹 서버
├── start_app.bat    # 더블클릭 간편 실행 스크립트
├── package.json     # Node.js 패키지 설정
├── .gitignore       # Git 제외 목록 설정
└── README.md        # 프로젝트 안내 문서
```

---

## 🚀 로컬 실행 방법 (How to Run)

### 방법 1. 더블클릭 실행 (Windows)
`start_app.bat` 파일을 더블클릭하면 자동으로 웹 서버가 구동되고 브라우저가 열립니다.

### 방법 2. npm 명령어로 실행
```bash
# 로컬 웹 서버 실행
npm start
```
서버 실행 후 브라우저에서 `http://localhost:3000` 로 접속합니다.

---

## 🌐 GitHub Pages 배포 방법 (GitHub Pages Deployment)

1. 이 `ppd APP` 폴더의 모든 내용을 깃허브 저장소(Repository)의 `main` 브랜치에 푸시(Push)합니다.
```bash
git init
git add .
git commit -m "Initial commit of PPD Brand Logo Generator"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.name.git
git push -u origin main
```
2. GitHub 저장소의 `Settings` ➔ `Pages` 탭으로 이동합니다.
3. `Source`를 `Deploy from a branch`로 선택하고, `Branch`를 `main` / `/(root)` 로 설정 후 **Save** 버튼을 누릅니다.
4. 몇 분 후 제공되는 GitHub Pages URL에서 앱을 바로 이용할 수 있습니다.

---

## 📄 License
MIT License
