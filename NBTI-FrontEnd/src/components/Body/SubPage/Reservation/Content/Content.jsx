import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import styles from "./Content.module.css";
import { List } from "./List/List";
import { MeetingRoom } from "./MeetingRoom/MeetingRoom";
import { Supplies } from "./Supplies/Supplies";
import { Car } from "./Car/Car";
import { Manager } from "./Manager/Manager";
import { useReservationList } from "../../../../../store/store";
import { useState } from "react";
import axios from "axios";
import { host } from "../../../../../config/config";
import Swal from "sweetalert2";
import SweetAlert from "../../../../../function/SweetAlert";


export const Content = () => {

    const {selectedDate,modalOpen,setModalOpen, setSelectedDate, setReservations , approve } = useReservationList();

    // 현재 날짜를 "YYYY-MM-DD" 형식으로 얻음 (지난 날짜 막기)
    const today = new Date().toISOString().split('T')[0];

    // 입력 데이터 상태
    const [reserveData, setReserveData] = useState({ 
        reserve_title_code: '', // 선택된 자원 이름을 저장
        start_time: '', // 시작 시간
        end_time: '', // 종료 시간
        purpose: '', // 사용 용도
        state: 'N' // 기본 상태 'N'
    });

    // 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setReserveData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 날짜 변경 핸들러
        const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // 예약
    const handleSave = () => {
        const { reserve_title_code, start_time, end_time, purpose, state } = reserveData;

        // 날짜와 시간을 합쳐서 Timestamp로 변환
        const fullStartTime = selectedDate ? new Date(`${selectedDate}T${start_time}:00`).toISOString() : null;
        const fullEndTime = selectedDate ? new Date(`${selectedDate}T${end_time}:00`).toISOString() : null;

        // 데이터 검증
        if (!reserve_title_code || !fullStartTime || !fullEndTime || !purpose || !start_time || !end_time) {
            // alert('모든 필드를 입력하세요.');
            Swal.fire({
                icon: "error",
                title: "예약",
                text: "모든 필드를 입력하세요.",
              }); 
            return;
        }

        const now = new Date();
        const startTimeObj = new Date(fullStartTime);
        const endTimeObj = new Date(fullEndTime);

        // 현재 시간 체크
        if (startTimeObj < now) {
            // alert('시작 시간은 현재 시간 이후여야 합니다.');
            Swal.fire({
                icon: "error",
                title: "예약",
                text: "시작 시간은 현재 시간 이후여야 합니다.",
              }); 
            return;
        }

        // 종료 시간 체크
        if (endTimeObj <= startTimeObj) {
            // alert('종료 시간은 시작 시간 이후여야 합니다.');
            Swal.fire({
                icon: "error",
                title: "예약",
                text: "종료 시간은 시작 시간 이후여야 합니다.",
              }); 
            return;
        }

    // ===== 중복 예약 체크 ===== 
    // 자원 코드와 자원 이름을 매핑
    const resourceMap = {
        '1': '회의실',
        '2': '노트북',
        '3': '차량'
    };

    const isOverlap = approve.some(item => {
        const startTime = new Date(item.start_time);
        const endTime = new Date(item.end_time);

        // 자원 코드에 따라 자원 이름 변환
        const currentResource = resourceMap[reserve_title_code]; // 현재 예약
        const existingResource = item.reserve_title_code; // 기존 예약 

        return (
            currentResource === existingResource && 
            (
                (startTimeObj >= startTime && startTimeObj < endTime) ||
                (endTimeObj > startTime && endTimeObj <= endTime) || 
                (startTimeObj <= startTime && endTimeObj >= endTime) 
            )
        );
    });

    if (isOverlap) {
        Swal.fire({
            icon: "error",
            title: "예약",
            text: "선택한 시간대에 이미 예약이 있습니다.",
        });
        return; // 중복이 있으면 추가하지 않음
    }





        // AJAX 요청
        axios.post(`${host}/reserve`, {
            reserve_title_code,
            start_time: fullStartTime, // ISO 문자열 형식으로 변환
            end_time: fullEndTime, // ISO 문자열 형식으로 변환
            purpose,
            state // 'N' 
        })
        .then((resp) => {
            // console.log(JSON.stringify(resp.date))
            fetchReservations(); // 새 예약 추가 후 목록 갱신
            closeModal(); // 모달 닫기
        })
        .catch((error) => {
            console.error('예약 실패:', error);
            // alert('예약에 실패했습니다.');
            Swal.fire({
                icon: "error",
                title: "예약",
                text: "예약에 실패했습니다.",
              }); 
        });
    };

    // 예약 목록 갱신
    const fetchReservations = () => {
        axios.get(`${host}/reserve`)
            .then((resp) => {
                // console.log(JSON.stringify(resp.data))
                setReservations(resp.data); // 주스탠드 상태 업데이트
            })
            .catch((error) => {
                console.error('Error :', error);
            });
    };

    // // 모달창 열기
    // const handleDateClick = (arg) => {
    //     setSelectedDate(arg.dateStr);
    //     setModalOpen(true);
    // };
    // 모달창 닫기
    const closeModal = () => {
        setModalOpen(false);
        setSelectedDate(null);
        setReserveData({ reserve_title_code: '', start_time: '', end_time: '', purpose: '', state: 'N' }); // 초기화
    };


    return(
        <div className={styles.container}>
            <Routes>
                <Route path="/" element={<List/>}></Route>
                <Route path="list" element={<List/>}></Route>
                <Route path="meetingRoom" element={<MeetingRoom modalOpen={modalOpen} setModalOpen={setModalOpen}/>}></Route>
                <Route path="supplies" element={<Supplies modalOpen={modalOpen} setModalOpen={setModalOpen}/>}></Route>
                <Route path="car" element={<Car modalOpen={modalOpen} setModalOpen={setModalOpen}/>}></Route>
                <Route path="manager/*" element={<Manager/>}></Route>
            </Routes>

            {/* 모달이 열릴 때만 보여지도록 조건부 렌더링 */}
            {modalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.title}>예약하기</h2>
                        <div className={styles.modalInner}>
                            <div>
                                <p>자원이름</p>
                                <select name="reserve_title_code" value={reserveData.reserve_title_code} onChange={handleChange}>
                                    <option value="">선택하세요</option>
                                    <option value="1">회의실</option>
                                    <option value="2">노트북</option>
                                    <option value="3">차량</option>
                                </select>
                            </div>
                            <div>
                                <p>날짜</p>
                                <input type="date" name="date" min={today} onChange={handleDateChange} />
                            </div>
                            <div>
                                <p>시작</p>
                                <input type="time" id="startTime" name="start_time" value={reserveData.start_time} onChange={handleChange}/>
                            </div>
                            <div>
                                <p>종료</p>
                                <input type="time" id="endTime" name="end_time" value={reserveData.end_time} onChange={handleChange}/>
                            </div>
                            <div>
                                <p>사용 용도</p>
                                <input type="text" name="purpose" value={reserveData.purpose} onChange={handleChange}/>
                            </div>
                            <div>
                                <button onClick={handleSave}>저장</button>
                                <button onClick={closeModal}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}