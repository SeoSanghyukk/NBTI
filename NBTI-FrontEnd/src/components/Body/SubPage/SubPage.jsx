import { Board } from "./Board/Board";
import styles from "./SubPage.module.css";
import { Routes, Route } from "react-router-dom";

export const SubPage = () => {
  return (
    <div className={styles.container}>
      {/* <div className={styles.blank}></div> */}
      <Routes>
        <Route path="/board/*" element={<Board />} />
        {/* <Route path="/calender" element={<Calender  />} /> */}
        {/* <Route path="/reservation" element={<Reservation  />} /> */}
        {/* <Route path="/group" element={<Group  />} /> */}
        {/* <Route path="/approval" element={<Approval  />} /> */}
        {/* <Route path="/approval" element={<Approval  />} /> */}
      </Routes>
    </div>
  );
};