import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";

import moment from "moment";

import { actionCreators as imageActions } from "./image";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const LOADING = "LOADING"; // 데이터를 가져올 때 로딩 중인 지 아닌 지 판별

const setPost = createAction(SET_POST, (post_list, paging) => ({
  post_list,
  paging,
}));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: [],
  paging: {
    // 페이징 정보를 담는다.
    start: null, // 시작점
    next: null, // 다음 게 있는 지 없는 지
    size: 3, // 몇 개 가져 올건지
  },
  is_loading: false, // 로딩 중인지 아닌 지 판별
};

const initialPost = {
  // id: 0,
  // user_info: {
  //   user_name: "mean0",
  //   user_profile: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  // },
  image_url: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  contents: "",
  comment_cnt: 0,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
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

    if (_image === _post.image_url) {
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
          history.replace("/");
        });

      return;
    } else {
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

const addPostFB = (contents = "") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    const _user = getState().user.user;

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

    console.log(_image);
    console.log(typeof _image);

    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
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
            .add({ ...user_info, ..._post, image_url: url })
            .then((doc) => {
              let post = { user_info, ..._post, id: doc.id, image_url: url };
              dispatch(addPost(post));
              history.replace("/");

              dispatch(imageActions.setPreview(null));
            })
            .catch((err) => {
              window.alert("앗! 포스트 작성에 문제가 있어요!");
              console.log("post 작성에 실패했어요!", err);
            });
        })
        .catch((err) => {
          window.alert("앗! 이미지 업로드에 문제가 있어요!");
          console.log("앗! 이미지 업로드에 문제가 있어요!", err);
        });
    });
  };
};

const getPostFB = (start = null, size = 3) => {
  return function (dispatch, getState, { history }) {
    let _paging = getState().post.paging;

    if (_paging.start && !_paging.next) {
      // 다음 페이지가 없으면 돌아가
      return;
    }

    dispatch(loading(true)); // 로딩 처리

    const postDB = firestore.collection("post"); // 참조

    // 쿼리 날려서 날짜순으로 불러오기
    let query = postDB.orderBy("insert_dt", "desc");
    // postDB : 어떤 collection에서 가져 올 지
    // orderBy : 어떤 걸 기준으로 어떻게 정렬 할 지
    // limit(갯수) : 최대 몇개를 가져올 지

    if (start) {
      query = query.startAt(start);
    }

    query
      .limit(size + 1) // 다음 페이지가 있는 지 없는 지 판별하기 위해서 갯수를 +1 한다.
      .get() // 가져올 때 사용
      .then((docs) => {
        // 가져온 결과값을 docs로 받아온다.
        let post_list = [];

        let paging = {
          // 페이징 처리
          start: docs.docs[0],
          next:
            docs.docs.length === size + 1
              ? docs.docs[docs.docs.length - 1]
              : null,
          // 다음 게시물이 있으면 next에 다음 게시물 정보를 넣고, 없으면 null을 넣는다.
          size: size,
        };

        // redux에 넣기 전에 가져온 데이터와 redux의 initialState의 형식을 맞춰준다.
        docs.forEach((doc) => {
          let _post = doc.data();

          // 형식 맞춰주기
          let post = Object.keys(_post).reduce(
            (acc, cur) => {
              if (cur.indexOf("user_") !== -1) {
                return {
                  ...acc,
                  user_info: { ...acc.user_info, [cur]: _post[cur] },
                };
              }
              return { ...acc, [cur]: _post[cur] };
            },
            { id: doc.id, user_info: {} }
          );

          post_list.push(post);
        });

        post_list.pop(); // docs는 게시물 4개를 불러오기 때문에 마지막 게시물은 삭제한다.

        // 데이터를 redux에 넣는다.
        dispatch(setPost(post_list, paging));
      });
  };
};

// 게시물 하나만 가져오기
const getOnePostFB = (id) => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");
    postDB
      .doc(id)
      .get()
      .then((doc) => {
        // 형식 맞춰주기
        let _post = doc.data();
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              };
            }
            return { ...acc, [cur]: _post[cur] };
          },
          { id: doc.id, user_info: {} }
        );  
        
        // 리덕스에 데이터 넣기
        dispatch(setPost([post]))
      });
  };
};

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list);

        // 중복 제거
        draft.list = draft.list.reduce((acc, cur) => {
          if(acc.findIndex(a => a.id === cur.id) === -1){
            return [...acc, cur];
            // 중복되는 값이 없으면 기존 배열에 데이터를 넣어서 새로운 배열을 만든다.
          }else{
            acc[acc.findIndex(a => a.id === cur.id)] = cur; // 최신값으로 덮어 씌운다.
            return acc;
          }
        }, []);

        if(action.payload.paging) {
          draft.paging = action.payload.paging;
        }

        draft.is_loading = false;
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
    [LOADING]: (state, action) =>
      // 로딩 처리
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
  },
  initialState
);

const actionCreators = {
  setPost,
  addPost,
  editPost,
  getPostFB,
  addPostFB,
  editPostFB,
  getOnePostFB,
};

export { actionCreators };
