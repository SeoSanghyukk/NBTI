import styles from "./QnADetail.module.css";
import { useEffect, useState, useRef } from "react";
import { useBoardStore } from "../../../../store/store";
import axios from "axios";
import { host } from "../../../../config/config";
import image from "../../../../images/user.jpg";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import BoardEditor from "../../../Body/BoardEditor/BoardEditor";
import Swal from "sweetalert2";
import SweetAlert from "../../../../function/SweetAlert";

export const QnADetail = () => {
  const navi = useNavigate();

  const { boardSeq, boardType } = useBoardStore();
  const [detail, setDetail] = useState({}); // 게시글의 detail 정보
  const [board, setBoard] = useState({
    title: "",
    contents: "",
    board_code: 3,
  });

  const [replyContents, setReplyContents] = useState("");
  const [reply, setReply] = useState([]);
  const inputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null); // 로그인된 사용자 정보 상태
  const [isAdmin, setIsAdmin] = useState(false); // 권한 여부 상태
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [fileList, setFileList] = useState([]); // 파일 전체 목록
  const [updatedFiles, setUpdatedFiles] = useState([]); // 파일 전체 목록 복사본
  const [fileDelArr, setFileDelArr] = useState([]); // 삭제할 파일 담아놓는 배열
  const [isFileListOpen, setIsFileListOpen] = useState(false);

  // 게시판 코드
  let code = 3;

  // 게시글 날짜 타입 변경
  const date = new Date(detail.write_date);
  const currentDate = !isNaN(date)
    ? format(date, "yyyy-MM-dd HH:mm")
    : "Invalid Date";

  // 게시글 출력
  useEffect(() => {
    if (boardSeq === -1) navi("/mypage/qnaList"); // detail 화면에서 f5 -> 목록으로 이동
    if (boardSeq !== -1) {
      axios.get(`${host}/board/${boardSeq}/${code}`).then((resp) => {
        setDetail(resp.data); // 취소 시 원본 데이터
        setBoard(resp.data);
      });

      // 북마크 상태 확인
      axios.get(`${host}/bookmark/${boardSeq}`).then((resp) => {
        setIsBookmarked(resp.data);
      });
    }

    // 로그인 한 사용자 정보 및 권한 확인
    axios.get(`${host}/members/memberInfo`).then((resp) => {
      setCurrentUser(resp.data);

      // 권한 확인
      if (resp.data.member_level === "2") {
        axios.get(`${host}/members/selectLevel`).then((resp1) => {
          const totalStatus =
            resp1.data[parseInt(resp.data.member_level) - 1].total; // 배열의 n번째 요소에서 seq 확인

          if (totalStatus === "Y") {
            setIsAdmin(true); // 2일 때 true
          }
        });
      }
    });

    // 파일 목록 출력
    axios.get(`${host}/files/board?seq=${boardSeq}`).then((resp) => {
      setFileList(resp.data);
      setUpdatedFiles(resp.data); // 파일 복사본
    });

    // 외부 스타일시트를 동적으로 추가
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // 언마운트될 때 스타일시트를 제거
    };
  }, []);

  /** ================[ 삭 제 ]============= */
  const handleDelBtn = () => {
    if (boardSeq !== -1) {
      axios.delete(`${host}/board/${detail.seq}`).then((resp) => {
        navi("/board/free");
      });
    }
  };

  /** ================[ 수 정 ]============= */
  const [isEditing, setIsEditing] = useState(false);

  // 수정 click
  const handleEditBtn = () => {
    setIsEditing(true);
  };

  // 저장 click
  const handleSaveBtn = () => {
    axios.put(`${host}/board`, board).then((resp) => {
      setDetail(board);
      setIsEditing(false);
    });

    // 저장 시, 삭제할 파일 삭제 가능
    // 삭제할 파일이 있을 경우에만 삭제 요청 보내기
    if (fileDelArr.length > 0) {
      axios
        .delete(`${host}/files/deleteBoard/${fileDelArr}`)
        .then((resp) => {
          setFileList(updatedFiles); // 삭제된 파일을 담고있는 복사본을 원본에 삽입
        })
        .catch((error) => {
          console.error("파일 삭제 실패:", error);
        });
    } else {
      // 삭제할 파일이 없는 경우에도 원본 파일 목록을 업데이트해줍니다.
      setFileList(updatedFiles);
    }
  };

  // 취소 click
  const handleCancelBtn = () => {
    setIsEditing(false);
    setBoard((prev) => {
      return { ...prev, title: detail.title, contents: detail.contents };
    });
    setFileDelArr([]); // 삭제시키려고 했던 seq 담던 애 초기화
    setUpdatedFiles(fileList); // 복사본에 원본데이터 넣어주기
  };

  // 파일 삭제
  const handleFileDelete = (seq) => {
    setFileDelArr((prev) => [...prev, seq]);
    setUpdatedFiles((prev) => {
      const updatedList = prev.filter((file) => file.seq !== seq);

      // 파일 삭제 후 파일 목록이 비어있다면 모달을 닫음
      if (updatedList.length === 0) {
        setIsFileListOpen(false);
      }

      return updatedList;
    });
  };

  // 북마크 추가
  const handleBookmarkAdd = (seq) => {
    setIsBookmarked(!isBookmarked);
    axios.post(`${host}/bookmark/insert`, { board_seq: seq }).then((resp) => {
      if (resp.data === 1) {
        Swal.fire({
          icon: "success",
          title: "북마크",
          text: "중요 게시글에 추가되었습니다.",
        });
      }
    });
  };

  // 북마크 해제
  const handleBookmarkRemove = (seq) => {
    setIsBookmarked(!isBookmarked);
    axios.delete(`${host}/bookmark/delete/${seq}`).then((resp) => {
      if (resp.data > 0) {
        Swal.fire({
          icon: "error",
          title: "북마크",
          text: "중요 게시글에 삭제되었습니다.",
        });
      }
    });
  };

  // ==========[댓 글]==========
  const handleInputReply = (e) => {
    const htmlContent = e.target.innerHTML;
    setReplyContents(htmlContent);
  };

  const [change, setChange] = useState(false);
  // 댓글 입력 및 추가
  const handleReplyAdd = () => {
    const requestBody = {
      board_seq: boardSeq,
      board_code: code,
      contents: replyContents,
    };
    axios.post(`${host}/reply`, requestBody).then((resp) => {
      if (resp.data !== "") {
        setChange((prev) => !prev);

        if (inputRef.current) {
          inputRef.current.innerHTML = ""; // div 내용 비우기
          setReplyContents("");
        }
      }
    });
  };

  // (좋아요 포함) 댓글 전체 출력
  useEffect(() => {
    axios.get(`${host}/reply/${boardSeq}/${code}`).then((resp) => {
      const { replies } = resp.data;
      setReply(replies); // 좋아요 count 포함된 댓글 배열
    });
  }, [boardSeq, code, change]);

  // 댓글 삭제
  const handleDelReplyBtn = (replySeq) => {
    axios.delete(`${host}/reply/${replySeq}`).then((resp) => {
      setReply((prev) => {
        return prev.filter((item) => item.seq !== replySeq);
      });
    });
  };

  // 파일 토글 창
  const toggleFileList = () => {
    setIsFileListOpen((prev) => !prev);
  };

  //======================================================================================

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.left}>
          <i
            className="fa-regular fa-star fa-lg"
            onClick={() => {
              handleBookmarkAdd(detail.seq);
            }}
            style={{ display: isBookmarked ? "none" : "inline" }}
          ></i>
          <i
            className="fa-solid fa-star fa-lg"
            onClick={() => {
              handleBookmarkRemove(detail.seq);
            }}
            style={{ display: isBookmarked ? "inline" : "none" }}
          ></i>
        </div>
        <div className={styles.right}>
          {currentUser && detail.member_id === currentUser.id && !isEditing ? (
            <>
              <p onClick={handleEditBtn}>수정</p>
              <p
                onClick={() =>
                  SweetAlert(
                    "warning",
                    "게시판",
                    "정말 삭제하시겠습니까?",
                    handleDelBtn
                  )
                }
              >
                삭제
              </p>
            </>
          ) : null}
        </div>
        {isEditing && (
          <div className={styles.editButtons}>
            <p onClick={handleSaveBtn}>저장</p>
            <p onClick={handleCancelBtn}>취소</p>
          </div>
        )}
      </div>
      <div className={styles.title}>
        <div className={styles.image}>
          <img
            src={
              detail.member_img === null
                ? `${image}`
                : `${host}/images/avatar/${detail.member_id}/${detail.member_img}`
            }
            alt=""
          />
        </div>
        <div className={styles.titleWriter}>
          <div className={styles.innerTitle}>
            {isEditing ? (
              <input
                type="text"
                value={board.title}
                maxLength={30}
                onChange={(e) =>
                  setBoard((prev) => {
                    return { ...prev, title: e.target.value };
                  })
                }
                placeholder="제목을 입력하세요."
                className={styles.editTitle}
              />
            ) : (
              <p>{detail.title}</p>
            )}
          </div>
          <div className={styles.innerWriter}>
            <p>{detail.name}</p>
          </div>
        </div>
        <div className={styles.writeDate}>
          <span>{currentDate}</span>
          {updatedFiles.length > 0 && (
            <i
              className={`fa-lg ${
                isFileListOpen
                  ? "fa-regular fa-folder-open"
                  : "fa-solid fa-folder-open"
              }`}
              onClick={toggleFileList}
            ></i>
          )}
        </div>
      </div>
      <div className={styles.content}>
        {isEditing ? (
          <BoardEditor setBoard={setBoard} contents={board.contents} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: detail.contents }}></div>
        )}
      </div>

      {/* 파일 리스트 */}
      {isFileListOpen && (
        <div className={styles.fileListModal}>
          <div className={styles.fileListContent}>
            {updatedFiles.map((file, index) => (
              <div key={index}>
                <a
                  href={`${host}/files/downloadBoard?oriname=${file.oriname}&sysname=${file.sysname}`}
                  className={styles.fileLink}
                >
                  {file.oriname}
                </a>
                {isEditing && (
                  <button
                    className={styles.fileDelBtn}
                    onClick={() => handleFileDelete(file.seq)}
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------[ 댓글 작성 ]------------ */}
      <div className={styles.reply}>
        <div className={styles.count}>
          <div>
            <span>{reply.length}</span>
            <span>개의 댓글</span>
          </div>
        </div>
        {isAdmin && (
          <div className={styles.replyInput}>
            <img
              src={
                currentUser && currentUser.member_img
                  ? `${host}/images/avatar/${currentUser.id}/${currentUser.member_img}`
                  : `${image}`
              }
              alt=""
            />
            <div
              ref={inputRef} // ref 설정
              className={styles.inputText}
              contentEditable="true"
              onInput={handleInputReply}
              suppressContentEditableWarning={true}
            />
            <button onClick={handleReplyAdd}>등록</button>
          </div>
        )}

        {/* --------------[ 댓글 출력 ]------------ */}
        <div className={styles.replyOutputWrap}>
          {reply.map((item, i) => {
            // 댓글 날짜 타입 변경
            const reply_date = new Date(item.write_date);
            const reply_currentDate = !isNaN(reply_date)
              ? format(reply_date, "yyyy-MM-dd HH:mm:ss")
              : "Invalid Date";

            return (
              <div className={styles.replyOutput} key={i}>
                <img
                  src={
                    item.member_img === null
                      ? `${image}`
                      : `${host}/images/avatar/${item.member_id}/${item.member_img}`
                  }
                  alt=""
                />
                <div>
                  <div className={styles.writer_writeDate}>
                    <span>{item.name}</span>
                    <span>{item.job_name}</span>
                    <span>{reply_currentDate}</span>
                  </div>
                  <div
                    className={styles.replyContent}
                    dangerouslySetInnerHTML={{ __html: item.contents }}
                  />
                </div>
                {currentUser && currentUser.id === item.member_id && (
                  <button
                    onClick={() => {
                      handleDelReplyBtn(item.seq);
                    }}
                  >
                    X
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
