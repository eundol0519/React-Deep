import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realTime } from "../../shared/firebase";
import moment from "moment";
import firebase from "firebase/app";

import { actionCreators as postActions } from "./post";

// 액션 타입
const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT";
const LOADING = "LOADING";

// 엑션 생성 함수
const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({
  post_id,
  comment_list,
}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({
  post_id,
  comment,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

// 초기값
const initialState = {
  list: {},
  is_loading: false,
};

// 미들웨어

const addCommentFB = (post_id, contents) => {
  return function (dispatch, getState, { history }) {
    const commentDB = firestore.collection("comment");
    const user_info = getState().user.user;

    // 댓글을 만들어 준다.
    let comment = {
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    commentDB.add(comment).then((doc) => {
      const postDB = firestore.collection("post");
      const post = getState().post.list.find((l) => l.id === post_id);
      const user = getState().user.user; // 다른 사람이 작성 했다는 걸 알기 위해서 불러옴

      const increment = firebase.firestore.FieldValue.increment(1);
      // 인자에 들어간 값만큼 현재 값에서 추가 해준다.
      // let a = 5; -> a = a + 1; -> comment_cnt + 1

      comment = { ...comment, id: doc.id };
      postDB
        .doc(post_id)
        .update({ comment_cnt: increment })
        .then((_post) => {
          dispatch(addComment(post_id, comment));
          if (post) {
            dispatch(
              postActions.editPost(post_id, {
                comment_cnt: parseInt(post.comment_cnt) + 1,
              })
            ); // 리덕스만 고쳐주면 됨

            if (post.user_info.user_id === user.uid) {
              // 게시물 작성자가 댓글을 달았을 때는 알림 울리지 않게
              return;
            }

            const _noti_item = realTime
              .ref(`noti/${post.user_info.user_id}/list`)
              .push(); // 구독

            _noti_item.set(
              {
                post_id: post.id,
                user_name: comment.user_name,
                image_url: post.image_url,
                insert_dt: comment.insert_dt,
              },
              (err) => {
                if (err) { // 알람 저장 실패
                  console.log("알림 저장에 실패", err);
                } else { // 알람 저장 성공 -> read 수정
                  const notiDB = realTime.ref(`noti/${post.user_info.user_id}`);

                  notiDB.update({ read: false });
                }
              }
            );
          }
        });
    });
  };
};

const getCommentFB = (post_id = null) => {
  return function (dispatch, getState, { history }) {
    // 게시글의 아이디로 조건을 걸어서 쿼리를 날리고 insert_dt로 정렬한다.
    const commentDB = firestore.collection("comment");

    if (!post_id) {
      // 게시물 id가 없으면 실행 못하게
      return;
    }

    commentDB
      .where("post_id", "==", post_id)
      .orderBy("insert_dt", "desc")
      .get()
      .then((docs) => {
        let list = [];

        docs.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id });
        });

        dispatch(setComment(post_id, list));
      })
      .catch((err) => {
        console.log("댓글 정보 불러오기 오류", err);
      });
  };
};

// 리듀서
export default handleActions(
  {
    [SET_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        // 방을 만든다 -> 딕셔너리 형태 -> let data = {[post_id] : com_list, ...}
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),
    [ADD_COMMENT]: (state, action) =>
      produce(state, (draft) => {
        draft.list[action.payload.post_id].unshift(action.payload.comment);
      }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
  },
  initialState
);

// 액션 생성 함수 export
const actionCreators = {
  getCommentFB,
  setComment,
  addComment,
  addCommentFB,
};

export { actionCreators };
