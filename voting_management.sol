// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Voting {
    // 후보 이름들 (5명 고정)
    string[5] public candidates = ["Joy", "Sadness", "Anger", "Fear", "Disgust"];

    // 후보별 득표수 관리
    mapping(string => uint256) public votes;

    // 투표한 사람 기록 (중복 방지)
    mapping(address => bool) public hasVoted;

    // 투표 시작 및 종료 시간
    uint256 public startTime;
    uint256 public endTime;

    // 투표 완료 관리
    address[] public voters;

    // 투표 이벤트
    event Voted(address indexed voter, string candidate);

    // 배포 시 시작/종료 시간 설정
    constructor(uint256 _delay, uint256 _duration) {
        startTime = block.timestamp + _delay;       // _delay 초 후 시작
        endTime = startTime + _duration;            // 시작 후 _duration 초 동안 진행
    }

    // 투표 가능 시간 확인
    modifier onlyDuringVoting() {
        require(block.timestamp >= startTime, "Voting has not started yet");
        require(block.timestamp <= endTime, "Voting has ended");
        _;
    }

    // 중복 투표 방지
    modifier onlyOnce() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    // 투표 기능
    function vote(string memory _candidate) public onlyDuringVoting onlyOnce {
        bool valid = false;
        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i])) == keccak256(bytes(_candidate))) {
                votes[_candidate]++;
                valid = true;
                break;
            }
        }
        require(valid, "Invalid candidate");

        hasVoted[msg.sender] = true;
        voters.push(msg.sender);

        emit Voted(msg.sender, _candidate);
    }

    // 총 투표자 수 조회
    function getTotalVoters() public view returns (uint256) {
        return voters.length;
    }

    // 특정 후보의 득표 수 조회
    function getVotes(string memory _candidate) public view returns (uint256) {
        return votes[_candidate];
    }

    // 투표 종료 여부 확인
    function isVotingEnded() public view returns (bool) {
        return block.timestamp > endTime;
    }
}
