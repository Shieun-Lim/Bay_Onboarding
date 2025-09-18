# 🧑‍💻 블록체인 기반 출석 관리 DApp (Attendance DApp)

## ✨ 프로젝트 개요

이 프로젝트는 Ethereum 기반의 출석 관리 시스템을 구현한 분산 애플리케이션(DApp)입니다. 스마트 컨트랙트를 통해 투명하고 변조 불가능한 출석 기록을 생성하며, P2P 검증 시스템을 도입하여 출석의 신뢰도를 높입니다.

### 📌 주요 특징

* **P2P 출석 검증:** 모든 출석 기록은 최소 1명 이상의 다른 등록된 사용자에 의해 검증되어야 기록됩니다.
* **시간 기반 출석 처리:** 정시 후 15분까지는 정상 출석, 그 이후는 지각 또는 결석으로 자동 기록됩니다.
* **출석률 리더보드:** 프론트엔드에 실시간 출석률 상위 3명 목록을 표시합니다.
* **불변의 로그 기록:** 모든 출석 및 검증 기록은 Sepolia Testnet 블록체인에 저장됩니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Blockchain** | Solidity (^0.8.0) | 스마트 컨트랙트 개발 언어 |
| **Ethereum** | **Sepolia Testnet** | 컨트랙트 배포 및 테스트 네트워크 |
| **Web3** | Ethers.js (v5.x) | 프론트엔드와 컨트랙트 연동 라이브러리 |
| **Frontend** | React, JavaScript | 사용자 인터페이스 구축 |
| **Tool** | Remix, VS Code | 개발 및 배포 환경 |

---

## 🚀 시작하는 방법 (Getting Started)

### 1. 전제 조건

* Node.js
* MetaMask (Sepolia 테스트넷 연결 및 잔액 확보)

### 2. 설치 및 실행

프로젝트 저장소를 클론하고 필요한 종속성을 설치합니다.

```bash
# 1. 저장소 클론
git clone [https://github.com/Shieun-Lim/Bay_Onboarding.git](https://github.com/Shieun-Lim/Bay_Onboarding.git)
cd attendance-app-new

# 2. 종속성 설치
npm install

# 3. 개발 서버 실행 (Chrome으로 자동 실행)
npm start

<컨트랙트 정보>
Contract Address 0x5E03BF9F6cD680C45A6f07Fde7EDd394cb573c03
Network Sepolia Testnet

🧪 테스트 방법
DApp의 모든 기능을 확인하기 위해 최소 2개의 MetaMask 계정(계정 A, 계정 B)을 준비하고 다음 순서를 따릅니다.

지갑 연결: DApp에 접속하여 MetaMask를 연결합니다.

계정 A (학생 역할):

이름을 입력하고 '학생 등록' 트랜잭션을 실행합니다.

'출석 제출' 버튼을 눌러 출석 기록을 블록체인에 남깁니다.

계정 B (검증자 역할):

MetaMask에서 계정을 B로 전환합니다.

계정 B도 **'학생 등록'**을 완료합니다.

'출석 로그 기록' 섹션에서 계정 A의 출석 기록을 찾아 '검증하기' 버튼을 클릭합니다.

결과 확인: 로그 기록에서 계정 A의 검증 횟수가 증가하고, 상위 3명 목록의 출석률이 업데이트되는지 확인합니다.
