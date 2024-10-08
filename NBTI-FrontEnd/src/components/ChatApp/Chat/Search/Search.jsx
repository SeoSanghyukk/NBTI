import styles from './Search.module.css';
import axios from 'axios';
import { host } from '../../../../config/config'
import { useState, useEffect, useContext } from 'react';
import { ChatsContext } from './../../../../Context/ChatsContext';
import { useCheckList } from './../../../../store/store';

const Search = ({ search, setSearch, searchRef, setSearchList, handleSearch, chatRef, divRef }) => {
    const [count, setCount] = useState();
    const {chatSeq} =useCheckList();

    useEffect(() => {
        setCount(chatRef.current.length); //이건 지금 검색한 ref 갯수 셋팅 
    }, [chatRef.current])

    const handleSearchDate = (e) => {
        setSearch(e.target.value);
    }
    const handleCancel = () => {
        handleSearch();
    }
    const handleList = () => {
        if(search!==''){
            const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
            axios.get(`${host}/chat${searchParam}&&chatSeq=${chatSeq}`).then((resp) => {
               // console.log(resp.data);
                setSearchList(resp.data);
            })
        }
     
    }

    const handleUp = () => {
        if (divRef.current) {
            setCount((prev) => { //검색한 목록에 애니메이션 기능 추가하기
                if (prev-1>=0) {
                    const temp = prev - 1;
                    chatRef.current[temp].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    chatRef.current[temp].classList.add(styles.shake);
                   
                    setTimeout(() => {
                        if (chatRef.current && chatRef.current[temp]) {
                            chatRef.current[temp].classList.remove(styles.shake);
                        }   
                      }, 500); // 애니메이션 지속 시간과 동일하게 설정하게 설정
                    return temp;
                }
                else{
                    return prev;
                }   
            })
        }
    }
    const handleDown = () => {
        if (divRef.current) {
            setCount((prev) => {
                if (prev+1<chatRef.current.length) {
                    const temp = prev + 1;
                    chatRef.current[temp].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    chatRef.current[temp].classList.add(styles.shake);
                    setTimeout(() => {
                        chatRef.current[temp].classList.remove(styles.shake);
                      }, 1000); // 애니메이션 지속 시간과 동일하게 설정하게 설정
                      
                    return temp;
                }
                else {
                    return prev;
                }

            })
        }
    }

    const handleEnter=(e)=>{
        if(e.key==='Enter'){
            handleList();
        }
    }

    return (
        <div className={`${styles.container}`} ref={searchRef}>
            <div className={styles.div1}>
                <input type="text" placeholder='검색할 내용을 입력하세요' name='content' value={search} onChange={handleSearchDate} onKeyDown={handleEnter}/>
            </div>
            <div className={styles.updown}>
                <div>
                    <button onClick={handleUp}>⬆️</button>
                </div>
                <div>
                    <button onClick={handleDown}>⬇️</button>
                </div>
            </div>
            <div className={styles.div2}>
                <button className={styles.btn1} onClick={handleList}>검색</button>
            </div>
            <div className={styles.div3}>
                <button className={styles.btn2} onClick={handleCancel}>❌</button>
            </div>
        </div>

    );
}
export default Search;