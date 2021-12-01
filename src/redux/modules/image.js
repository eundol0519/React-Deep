// image.js

import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { storage } from "../../shared/firebase";

// 액션 타입
const UPLOADING = "UPLOADING";
const UPLOAD_IMAGE = "UPLOAD_IMAGE";
const SET_PREVIEW = "SET_PREVIEW";

// 액션 생성자
const uploading = createAction(UPLOADING, (uploading) => ({ uploading }));
const uploadImage = createAction(UPLOAD_IMAGE, (image_url) => ({ image_url }));
const setPreview = createAction(SET_PREVIEW, (preview) => ({ preview }));

// 초기값
const initialState = {
  image_url: "",
  uploading: false,
  preview: null,
};

// 미들웨어
const uploadImageFB = (image) => {
  return function (dispatch, getState, { history }) {
    dispatch(uploading(true)); // 로딩 중으로 바꾼다.

    const _upload = storage.ref(`images/${image.name}`).put(image); // 참조

    _upload.then((snapshot) => {
      // 이미지의 링크를 받아온다.
      snapshot.ref.getDownloadURL().then((url) => {
        dispatch(uploadImage(url));
      });
    });
  };
};

// 리듀서
export default handleActions(
  {
    [UPLOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.uploading = action.payload.uploading;
      }),
    [UPLOAD_IMAGE]: (state, action) =>
      produce(state, (draft) => {
        draft.image_url = action.payload.image_url;
        draft.uploading = false; // 로딩이 끝났다고 알려준다.
      }),
    [SET_PREVIEW]: (state, action) =>
      produce(state, (draft) => {
        draft.preview = action.payload.preview;
      }),
  },
  initialState
);

// 액션 export
const actionCreators = {
  uploadImage,
  uploadImageFB,
  setPreview,
};

export { actionCreators };
