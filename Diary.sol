//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Diary {
    enum Mood { Good, Normal, Bad}

    struct Entry {
        string title;
        string content;
        Mood mood;
        uint timestamp;
    }

mapping(address => Entry[]) private userEntries;

 //일기 작성
    function writeDiary(string memory _title, string memory _content, Mood _mood) public {
        userEntries[msg.sender].push(
            Entry(_title, _content, _mood, block.timestamp)
        );
    }

    //내 일기 전체 보기
    function getMyDiaries() public view returns (Entry[] memory) {
        return userEntries[msg.sender];
    }

    //기분 상태로 필터링된 내 일기 보기
    function getMyDiariesByMood(Mood _mood) public view returns (Entry[] memory) {
        Entry[] memory all = userEntries[msg.sender];
        uint count = 0;

        // 1. 몇 개 있는지 먼저 센다
        for (uint i = 0; i < all.length; i++) {
            if (all[i].mood == _mood) {
                count++;
            }
        }

        // 2. 그만큼 크기 갖는 배열 만들고 다시 담기
        Entry[] memory filtered = new Entry[](count);
        uint j = 0;
        for (uint i = 0; i < all.length; i++) {
            if (all[i].mood == _mood) {
                filtered[j] = all[i];
                j++;
            }
        }

        return filtered;
    }
}  

