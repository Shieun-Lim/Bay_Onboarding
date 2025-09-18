import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// ----------------------------------------------------------------
// ✅ 최종 배포된 컨트랙트 주소와 ABI가 여기에 반영되었습니다. ✅
// ----------------------------------------------------------------
const CONTRACT_ADDRESS = '0x5E03BF9F6cD680C45A6f07Fde7EDd394cb573c03'; // 사용자님의 Sepolia 배포 주소
const CONTRACT_ABI = [
    // 컨트랙트의 모든 public/external 함수 및 이벤트에 대한 ABI입니다.
    "function registerStudent(string name)",
    "function submitAttendance()",
    "function verifyAttendance(address studentAddress, uint256 logIndex)",
    "function getTop3Students() view returns (string[] names, uint256[] percentages)",
    "function getAttendanceLog() view returns (tuple(address student, uint256 timestamp, uint8 status, uint256 verifiersCount, string logMessage)[] logs)",
    "function students(address) view returns (string name, uint256 totalAttendance, uint256 totalLateOrAbsent, uint256 totalChecks)",
    "event StudentRegistered(address studentAddress, string name)",
    "event AttendanceSubmitted(address studentAddress, uint8 status, string message)",
    "event AttendanceVerified(address studentAddress, uint256 logIndex, address verifier)",
];
// ----------------------------------------------------------------

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [currentAccount, setCurrentAccount] = useState('');
    const [studentName, setStudentName] = useState('');
    const [topStudents, setTopStudents] = useState([]);
    const [logRecords, setLogRecords] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

    // 1. MetaMask 연결 및 초기 설정
    useEffect(() => {
        if (window.ethereum) {
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(newProvider);
            
            // 계정 변경 이벤트 리스너
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    checkRegistration(accounts[0], newProvider);
                } else {
                    setCurrentAccount('');
                    setIsRegistered(false);
                }
            });
            
            // 초기 연결 시도
            connectWallet();
        } else {
            setStatusMessage("MetaMask를 설치해주세요.");
        }
    }, []);

    useEffect(() => {
        if (provider && currentAccount) {
            const newSigner = provider.getSigner();
            setSigner(newSigner);
            const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
            setContract(newContract);

            checkRegistration(currentAccount, provider);
            fetchData();
        }
    }, [currentAccount, provider]);

    // 지갑 연결 함수
    const connectWallet = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
            }
        } catch (error) {
            console.error("지갑 연결 실패:", error);
            setStatusMessage("지갑 연결에 실패했습니다.");
        }
    };
    
    // 학생 등록 여부 확인
    const checkRegistration = async (account, _provider) => {
        if (!account || !CONTRACT_ADDRESS) return;
        
        try {
            const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _provider);
            const studentInfo = await tempContract.students(account);
            // 학생 이름이 비어있지 않으면 등록된 것으로 간주
            const isReg = studentInfo.name !== ''; 
            setIsRegistered(isReg);
            if (isReg) setStudentName(studentInfo.name);
        } catch (error) {
            console.error("등록 여부 확인 실패:", error);
        }
    }

    // 데이터 가져오기 (출석률 상위 3명, 로그 기록)
    const fetchData = async () => {
        if (!contract) return;
        try {
            // 상위 3명 조회
            const [names, percentages] = await contract.getTop3Students();
            const top3 = names.map((name, index) => ({
                name,
                // 컨트랙트에서 10000을 곱해서 보냈으므로, 100으로 나눠 소수점 두 자리까지 표시
                percentage: (percentages[index].toNumber() / 100).toFixed(2) 
            }));
            setTopStudents(top3);

            // 로그 기록 조회
            const logs = await contract.getAttendanceLog();
            const formattedLogs = logs.map((log, index) => ({
                ...log,
                logIndex: index,
                statusText: log.status === 1 ? '정상 출석 ✅' : '지각/결석 ⚠️',
                // 타임스탬프를 밀리초로 변환 후 로컬 시간으로 표시
                timestamp: new Date(log.timestamp.toNumber() * 1000).toLocaleString() 
            })).reverse(); // 최신 기록을 위로
            setLogRecords(formattedLogs);
        } catch (error) {
            console.error("데이터 조회 실패:", error);
            setStatusMessage("데이터 조회 중 오류 발생.");
        }
    };

    // 2. 학생 등록
    const handleRegister = async () => {
        if (!signer || !studentName) return;
        setStatusMessage("등록 중...");
        try {
            const tx = await contract.registerStudent(studentName);
            await tx.wait();
            setStatusMessage(`'${studentName}'님 등록 완료!`);
            setIsRegistered(true);
            fetchData();
        } catch (error) {
            console.error("등록 실패:", error);
            setStatusMessage("등록 실패: " + (error.data?.message || error.message));
        }
    };

    // 3. 출석 제출
    const handleSubmitAttendance = async () => {
        if (!signer) return;
        setStatusMessage("출석 제출 중...");
        try {
            const tx = await contract.submitAttendance();
            await tx.wait();
            setStatusMessage("출석 제출 완료! 검증이 필요합니다.");
            fetchData();
        } catch (error) {
            console.error("출석 제출 실패:", error);
            setStatusMessage("출석 제출 실패: " + (error.data?.message || error.message));
        }
    };

    // 4. 출석 검증
    const handleVerifyAttendance = async (studentAddress, logIndex) => {
        if (!signer) return;
        setStatusMessage("출석 검증 중...");
        try {
            const tx = await contract.verifyAttendance(studentAddress, logIndex);
            await tx.wait();
            setStatusMessage("출석 검증 완료!");
            fetchData();
        } catch (error) {
            console.error("검증 실패:", error);
            setStatusMessage("검증 실패: " + (error.data?.message || error.message));
        }
    };

    return (
        <div style={styles.container}>
            <h1>출석 관리 DApp 🧑‍💻</h1>
            <p><strong>네트워크:</strong> Sepolia Testnet</p>
            <p><strong>연결 계정:</strong> {currentAccount || "지갑 연결 필요"}</p>
            <p style={{ color: 'red' }}>{statusMessage}</p>

            <div style={styles.section}>
                <h2>📊 출석률 상위 3명</h2>
                <ul style={styles.list}>
                    {topStudents.length > 0 ? topStudents.map((s, index) => (
                        <li key={index}>
                            {index + 1}. **{s.name}**: {s.percentage}%
                        </li>
                    )) : <li>등록된 학생이 없습니다.</li>}
                </ul>
            </div>

            <div style={styles.section}>
                <h2>📝 사용자 액션</h2>
                {!currentAccount ? (
                    <button onClick={connectWallet} style={styles.button}>지갑 연결</button>
                ) : !isRegistered ? (
                    <div>
                        <input
                            type="text"
                            placeholder="이름 입력 (예: 홍길동)"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            style={styles.input}
                        />
                        <button onClick={handleRegister} disabled={!studentName} style={styles.button}>
                            학생 등록
                        </button>
                    </div>
                ) : (
                    <div>
                        <p>환영합니다, **{studentName}**님!</p>
                        <button onClick={handleSubmitAttendance} style={styles.button}>
                            출석 제출
                        </button>
                    </div>
                )}
            </div>
            
            <div style={styles.section}>
                <h2>📜 출석 로그 기록</h2>
                <ul style={styles.logList}>
                    {logRecords.length > 0 ? logRecords.map((log) => (
                        <li key={log.logIndex} style={styles.logItem}>
                            <div>
                                **{log.statusText}** - {log.logMessage} ({log.timestamp})
                            </div>
                            <div>
                                **출석자:** {log.student.substring(0, 6)}...{log.student.substring(log.student.length - 4)} 
                            </div>
                            <div>
                                **검증 횟수:** {log.verifiersCount.toString()}회 
                                {/* 본인 출석이 아니고, 등록된 사용자만 검증 버튼 표시 */}
                                {isRegistered && log.student.toLowerCase() !== currentAccount.toLowerCase() && (
                                    <button 
                                        onClick={() => handleVerifyAttendance(log.student, log.logIndex)}
                                        style={styles.verifyButton}
                                    >
                                        검증하기
                                    </button>
                                )}
                            </div>
                        </li>
                    )) : <li>출석 기록이 없습니다.</li>}
                </ul>
            </div>
        </div>
    );
}

// 간단한 스타일
const styles = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' },
    section: { border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '8px', boxShadow: '2px 2px 5px rgba(0,0,0,0.1)' },
    input: { padding: '10px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' },
    button: { padding: '10px 15px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', margin: '5px 0' },
    verifyButton: { marginLeft: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.9em' },
    list: { listStyleType: 'decimal', paddingLeft: '20px' },
    logList: { listStyleType: 'none', padding: 0 },
    logItem: { borderBottom: '1px dashed #eee', padding: '10px 0', marginBottom: '10px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }
};

export default App;