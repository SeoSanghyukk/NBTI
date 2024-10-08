import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Signup.module.css';
import { host } from '../../../../config/config';
import { useMemberStore } from '../../../../store/store';
import { useNavigate } from 'react-router-dom';


const Signup = () => {
    const [formData, setFormData] = useState({
        id: '',
        pw: '',
        name: '',
        email: '',
        team_code: '',
        job_code: '',
        member_level: '',
        member_call: '',
        address: '',
        birth: '',
        gender: '',
        ent_yn: 'N',
        vacation_period: 15,
        end_date: ''
    });

    const [teams, setTeams] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [levels, setLevels] = useState([]);
    const [idAvailable, setIdAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [checkIdStatus, setCheckIdStatus] = useState('');
    const [checkEmailStatus, setCheckEmailStatus] = useState('');
    const { members, setMembers } = useMemberStore(); // Zustand store 사용
    const navi = useNavigate();
    useEffect(() => {
        axios.get(`${host}/members/selectTeam`)
            .then(response => setTeams(response.data))
  

        axios.get(`${host}/members/selectJob`)
            .then(response => setJobs(response.data))
     

        axios.get(`${host}/members/selectLevel`)
            .then(response => setLevels(response.data))
            
    }, []);
    useEffect(() => {
        if (formData.id) {
            axios.post(`${host}/members/checkId`, { id: formData.id }, { headers: { 'Content-Type': 'application/json' } })
                .then(response => {
                    setIdAvailable(response.data);
                    setCheckIdStatus(response.data ? '사용 가능한 ID입니다.' : '이미 사용 중인 ID입니다.');
                })
                .catch(error => {
                    
                    setIdAvailable(null);
                    setCheckIdStatus('중복 확인 오류 발생');
                });
        } else {
            setIdAvailable(null);
            setCheckIdStatus('');
        }
    }, [formData.id]);
    useEffect(() => {
        if (formData.email) {
            axios.post(`${host}/members/checkEmail`, { email: formData.email })
            .then(response => {
                setEmailAvailable(response.data);
            })
            .catch(error => {
                console.error('이메일 중복 확인 중 오류 발생:', error);
                setEmailAvailable(null);
            });
        } else {
            setEmailAvailable(null);
            setCheckEmailStatus('');
        }
    }, [formData.email]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressSearch = () => {
        new window.daum.Postcode({
            oncomplete: function(data) {
                setFormData(prev => ({
                    ...prev,
                    address: data.address
                }));
            }
        }).open();
    };

    const getLevelName = (level) => {
        if (!level) return '';
        if (level.total === 'Y') return '전체 권한';
        if (level.hr === 'Y') return 'HR 권한';
        if (level.reservation === 'Y') return '예약 권한';
        if (level.message === 'Y') return '메시지 권한';
        if (level.task === 'Y') return '업무 권한';
        if (level.payment==='Y') return '결제 권한';
        return '권한 없음';
    };
    const validateFormData = (formData) => {

        if (idAvailable === false) {
            alert('이미 사용 중인 ID입니다.');
            return false;
        }
        // 아이디 유효성 검사: 4자 이상 20자 이하의 영문자, 숫자, 밑줄(_)만 허용
        if (!formData.id) {
            alert('아이디를 입력하세요.');
            return false;
        }
        const idPattern = /^[a-zA-Z0-9_]{4,20}$/;
        if (!idPattern.test(formData.id)) {
            alert('아이디는 4자 이상 20자 이하의 영문자, 숫자, 밑줄(_)만 사용할 수 있습니다.');
            return false;
        }
        if (!formData.pw) {
            alert('비밀번호를 입력하세요.');
            return false;
        }
        // 비밀번호 유효성 검사: 최소 8자 이상, 영문자, 숫자, 특수문자 포함
        const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pwPattern.test(formData.pw)) {
            alert('비밀번호는 최소 8자 이상이어야 하며, 영문자, 숫자, 특수문자를 포함해야 합니다.');
            return false;
        }
        if (!formData.name) {
            alert('이름을 입력하세요.');
            return false;
        }
        const namePattern = /^[가-힣]{2,5}$/;
        if (!namePattern.test(formData.name)) {
            alert('이름은 한글로 2글자에서 5글자까지 입력할 수 있습니다.');
            return false;
        }

        if (emailAvailable === false) {
            alert('이미 사용 중인 이메일입니다.');
            return false;
        }
        if (!formData.email) {
            alert('이메일을 입력하세요.');
            return false;
        }
        // 이메일 유효성 검사
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(formData.email)) {
            alert('유효한 이메일 주소를 입력하세요.');
            return false;
        }
        
        // 전화번호 유효성 검사: 한국 전화번호 형식 (예: 010-1234-5678)
        const phonePattern = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$/;
        if (formData.member_call && !phonePattern.test(formData.member_call)) {
            alert('유효한 전화번호를 입력하세요. (예: 010-1234-5678)');
            return false;
        }
        
        if (!formData.birth) {
            alert('생년월일을 입력하세요.');
            return false;
        }
        const birthPattern = /^\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;
        if (formData.birth && !birthPattern.test(formData.birth)) {
            alert('유효한 생년월일을 입력하세요. (예: 900203)');
            return false;
        }
  

    

        return true;  // 모든 유효성 검사를 통과하면 true 반환
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 유효성 검사 실행
        if (!validateFormData(formData)) {
            // 유효성 검사를 통과하지 못하면 더 이상 진행하지 않음
            return;
        }

        // 유효성 검사를 통과하면 서버에 데이터 전송
        axios.post(`${host}/members`, formData)
            .then(response => {
                alert('회원가입이 성공적으로 완료되었습니다.');
                setMembers([...members, response.data]);
                navi("/");
            })
            .catch(error => {
               
                alert('회원가입 중 오류가 발생했습니다.');
            });
    };

    return (
        <div className={styles.container}>
            <h2>사용자 등록</h2>
            <input
                type="text"
                placeholder="아이디"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
            />
            {idAvailable === null && formData.id && (
                <p>아이디 중복 확인 중...</p>
            )}
            {idAvailable === false && (
                <p style={{ color: 'red' }}>이미 사용 중인 ID입니다.</p>
            )}
            {idAvailable === true && (
                <p style={{ color: 'green' }}>사용 가능한 ID입니다.</p>
            )}
            <input
                type="password"
                placeholder="비밀번호"
                name="pw"
                value={formData.pw}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                placeholder="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
                       <input
                type="email"
                placeholder="이메일"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            {emailAvailable === null && formData.email && (
                <p>이메일 중복 확인 중...</p>
            )}
            {emailAvailable === false && (
                <p style={{ color: 'red' }}>이미 사용 중인 이메일입니다.</p>
            )}
            {emailAvailable === true && (
                <p style={{ color: 'green' }}>사용 가능한 이메일입니다.</p>
            )}
            <select
                name="team_code"
                value={formData.team_code}
                onChange={handleChange}
                required
            >
                <option value="">팀 선택</option>
                {teams.map(team => (
                    <option key={team.team_code} value={team.team_code}>
                        {team.team_name}
                    </option>
                ))}
            </select>
            <select
                name="job_code"
                value={formData.job_code}
                onChange={handleChange}
                required
            >
                <option value="">직급 선택</option>
                {jobs.map(job => (
                    <option key={job.job_code} value={job.job_code}>
                        {job.job_name}
                    </option>
                ))}
            </select>
            <select
                name="member_level"
                value={formData.member_level}
                onChange={handleChange}
                required
            >
                <option value="">권한 선택</option>
                {levels.map(level => (
                    <option key={level.seq} value={level.seq}>
                        {getLevelName(level)}
                    </option>
                ))}
            </select>
            <input
                type="text"
                placeholder="전화번호"
                name="member_call"
                value={formData.member_call}
                onChange={handleChange}
            />
            <input
                type="text"
                placeholder="주소"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
            />
            <button 
                type="button" 
                id="search-address-btn" 
                className={styles.searchAddressBtn}
                onClick={handleAddressSearch}
            >
                주소 검색
            </button>
            <input
                type="text"
                placeholder="생년월일"
                name="birth"
                value={formData.birth}
                onChange={handleChange}
            />
            <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
            >
                <option value="">성별</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
            </select>
      
            
            <button type="button" onClick={handleSubmit}>회원가입</button>
        </div>
    );
};

export default Signup;
