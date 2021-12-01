// post.js

import { createAction, handleActions } from "redux-actions"; // 액션, 리듀서 쉽게 만들어 줌
import { produce } from "immer"; // 불변성 관리
import { firestore, storage } from "../../shared/firebase"; // 파이어스토어 연동하기 + 스토리지 연동하기
import moment from "moment";
import { actionCreators as imageActions } from "./image";

// 액션 타입
const SET_POST = "SET_POST"; // firebase에서 목록을 가져와서 redux에 넣어주는 액션
const ADD_POST = "ADD_POST"; // redux 데이터에 게시물 추가 해주는 액션
const EDIT_POST = "EDIT_POST"; // redux 데이터에 게시물 수정 해주는 액션

// 액션 생성자
const setPost = createAction(SET_POST, (post_list) => ({ post_list }));
const addPost = createAction(ADD_POST, (post_list) => ({ post_list }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));

// 초기값 설정
const initialState = {
  // 리듀서가 사용할 초기값
  list: [],
};

const initialPost = {
  image_url: "",
  contents: "",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
};

// 미들웨어
const getPostFB = () => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    postDB.get().then((docs) => {
      let post_list = [];

      docs.forEach((doc) => {
        // console.log(doc.id, doc.data())
        // 데이터 생김새를 맞춰준다.
        let _post = {
          id: doc.id,
          ...doc.data(),
        };

        let post = {
          id: doc.id,
          user_info: {
            user_name: _post.user_name,
            user_profile: _post.user_profile,
            user_id: _post.user_id,
          },
          image_url: _post.image_url,
          contents: _post.contents,
          comment_cnt: _post.comment_cnt,
          insert_dt: _post.insert_dt,
        };

        post_list.push(post);
        // post를 배열 형태로 만든다.

        // [고급 버전]
        //   let __post = doc.data();

        //   // ['comment_cnt', 'contents' ...]
        //   let post = Object.keys(__post).reduce((acc, cur) => {
        //     if(cur.indexOf("user_") !== -1){
        //       return {...acc, user_info: {...acc.user.info, [cur] : __post[cur]}}
        //     }
        //     return {...acc, [cur] : __post[cur]};
        //   }, {id : doc.id, user_info : {}});

        //   post_list.push(post)
      });

      dispatch(setPost(post_list));
    });
  };
};

const addPostFB = (contents = "") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    const _user = getState().user.user; // getState : 스토어에 있는 정보를 불러온다.

    const user_info = {
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };

    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    const _image = getState().image.preview;
    // image 모듈에서 preview에 넣어준 값을 게시물 작성을 누르면 가져온다.
    // 파일 객체 타입은 string으로 가지고 온다.

    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url");

    _upload.then((snapshot) => {
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          // url을 확인해봐요!
          console.log(url);

          return url;
        })
        .then((url) => {
          // ~~~.add({추가할 정보})
          postDB
            .add({ ...user_info, ..._post, image_url: url }) // firestore에 데이터 추가
            .then((doc) => {
              // 아이디를 추가한다.
              let post = { ...user_info, ..._post, id: doc.id, image_url: url }; // 리덕스에 데이터를 추가
              dispatch(addPost(post));
              // 페이지를 바꿔치기 한다.
              history.replace("/");

              dispatch(imageActions.setPreview(null));
              // 이미지가 업로드 되면 preview를 비워준다.
            })
            .catch((err) => {
              window.alert("게시물 작성에 실패 했습니다.");
              console.log("게시물 작성 실패", err);
            });
        })
        .catch((err) => {
          window.alert("이미지 업로드에 실패 했습니다.");
          console.log("이미지 없로드 실패", err);
        });
    });
  };
};

const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }

    const _image = getState().image.preview;

    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];

    console.log(_post);

    const postDB = firestore.collection("post");

    if (_image === _post.image_url) { // 이미지 수정 안했을 경우
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
          history.replace("/");
        });

      return;
    } else { // 이미지 수정했을 경우
      const user_id = getState().user.user.uid;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");

      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            console.log(url);

            return url;
          })
          .then((url) => {
            postDB
              .doc(post_id)
              .update({ ...post, image_url: url })
              .then((doc) => {
                dispatch(editPost(post_id, { ...post, image_url: url }));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

// 리듀서
export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list = action.payload.post_list;
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);

        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),
  },
  initialState
);

// 액션 export
const actionCreators = {
  setPost,
  addPost,
  getPostFB,
  addPostFB,
  editPostFB,
};

export { actionCreators };
