import React from "react";
import { Button } from "../elements/index";
import { storage } from "../shared/firebase"; // 스토리지 연결
import { useDispatch, useSelector } from "react-redux";
import { actionCreators as imageActions } from "../redux/modules/image";

const Upload = (props) => {
  const fileInput = React.useRef();
  const dispatch = useDispatch();

  const is_uploading = useSelector(state => state.image.uploading)

  const selectFile = (e) => {
    console.log(e.target.files[0]);
    console.log(fileInput.current.files[0]);

    // 이미지 미리보기
    const reader = new FileReader();
    const file = fileInput.current.files[0]; // 파일 객체

    // 파일의 내용을 읽어온다.
    reader.readAsDataURL(file);

    // 읽기가 끝나면 발생하는 이벤트 핸들러
    reader.onloadend = () => { 
        // reader.result는 파일의 컨텐츠(내용물)입니다!
        dispatch(imageActions.setPreview(reader.result));
    }
  };

  const uploadFB = () => {
    // 실제로 이미지를 가지고 storage에 업로드 해주는 역할

    let image = fileInput.current.files[0]; // 이미지를 잡아온다.
    dispatch(imageActions.uploadImageFB(image));
  };

  return (
    <React.Fragment>
      <input ref={fileInput} onChange={selectFile} type="file" disabled={is_uploading} />
      {/* <Button _onClick={uploadFB}>업로드 하기</Button> */}
    </React.Fragment>
  );
};

export default Upload;
