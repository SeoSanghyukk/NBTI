
import { Routes, Route, BrowserRouter as Router, Outlet, Link } from 'react-router-dom';

import Chat from './Chat/Chat';
import Home from './Home/Home';
import axios from 'axios';
import styles from './ChatApp.module.css';
import { ChatsContext } from '../../Context/ChatsContext';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from './../../store/store';
axios.defaults.withCredentials = true;

const ChatApp = ({websocketRef,draggableRef}) => {
    const { chatAppRef,chatNavi,ws,setChatNavi,dragRef} = useContext(ChatsContext);
    const { loginID } = useAuthStore;
    ws.current=websocketRef.current;
   

    useEffect(()=>{
        if(loginID!==null){
          setChatNavi('chat1');
         
        }
    },[loginID])

    useEffect(()=>{
      if(draggableRef.current)
      dragRef.current=draggableRef.current;
    },[draggableRef])
 
    if(chatNavi===''){
      if(chatAppRef.current!=null)
      chatAppRef.current.style.display='none';
      
      if(dragRef.current)
        dragRef.current.style.display='none';
    }
    return (
      

        <div className={styles.container} ref={chatAppRef}>
            {chatNavi==='home' && <Home/>}
            {chatNavi===('chat1') && <Chat/>}
            {chatNavi===('chat') && <Chat/>}
        </div>
    );

}

export default ChatApp;