import React from "react";
import { Grid, Text, Button, Image, Input } from "../elements";
import Upload from "../shared/Upload";
import { actionCreators as postActions } from "../redux/modules/post";

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as imageActions } from "../redux/modules/image";

const PostWrite = (props) => {

  // 수정일 경우
  const post_id = props.match.params.id;
  const is_edit = post_id ? true : false;
  const post_list = useSelector((state) => state.post.list);
  let _post = is_edit ? post_list.find((p) => p.id === post_id) : null;

  // 수정 페이지에서 새로고침 했을 경우 redux 값이 초기화 되기 때문에 뒤로가기 시켜버림
  React.useEffect(() => {
    if (is_edit && !_post) {
      window.alert("포스트 정보가 없어요!");
      history.goBack();
      return;
    }

    if (is_edit) {
      dispatch(imageActions.setPreview(_post.image_url));
    }
  }, []);

  const dispatch = useDispatch();
  const { history } = props;

  const is_login = useSelector((state) => state.user.is_login);
  const preview = useSelector((state) => state.image.preview);

  const [contents, setContents] = React.useState(_post ? _post.contents : "");

  const changeContent = (e) => {
    setContents(e.target.value);
    console.log(contents)
  };

  const addPost = () => {
    dispatch(postActions.addPostFB(contents));
  };

  if (!is_login) {
    return (
      <Grid margin="100px 0px" padding="16px" center>
        <Text size="32px">잠깐!</Text>
        <Text size="16px">로그인 후에만 글을 쓸 수 있어요</Text>
        <Button
          _onClick={() => {
            history.replace("/");
          }}
        >
          로그인 하러 가기
        </Button>
      </Grid>
    );
  }

  const editPost = () => {
    dispatch(postActions.editPostFB(post_id, {contents:contents}))
  }

  return (
    <React.Fragment>
      <Grid padding="16px">
        <Text margin="0px" size="36px" bold>
          {is_edit ? "게시글 수정" : "게시글 작성"}
        </Text>
        <Upload />
      </Grid>

      <Grid>
        <Grid padding="16px">
          <Text margin="0px" size="24px" bold>
            미리보기
          </Text>
        </Grid>

        <Image
          shape="rectangle"
          src={
            preview
              ? preview
              : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAclBMVEXd3d3g4ODj4+PMzMzX19fl5eW9vb1BQUHb29sAAADT09Ourq57e3uAgIDZ2dnExMSKiooeHh5DQ0Ofn59JSUmYmJgzMzMsLCzJyck5OTlwcHBYWFgnJyeSkpJOTk63t7dmZmYWFhZ1dXVbW1sMDAwhISGT6jf7AAACjUlEQVR4nO3W227aQBCAYc+ebHxgjU/YBh+A5P1fsWvSpmoTqTeRolr/J8GyDBf2MJ6dKAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMDn5Ofy1/oe/hD4+xf/v8QdtyVd9LZI0rv0j3vUb4Eo8s5sATk6l+wrC1IetIT3U3PKQzLMeo1P9e/wsbhVr3cTSbpeq3OtInHD0DVuT0mQrDtrCe+Z8ddWRWXTm/rs3h4AEdWenHHxJGpsUjN1Xsycp2at1Hdf+NeRY3y/aknGUYkqY5V2rY1slYvzIdi7qCzCflwTfc5UuP/SZoMX8ddlR4Vwz5eTlrSaQpVnZ90fvEQqj23ZeeWHUrZi0E0p2RDKX41rNDVJ6BHztJtCUHVn3E2L7urQE5bOLYc0fDtdrWlWWefjVgxFvBpVx1tyiospLjZ0jUexlxxIqHC7bDk4/8rByzMHr1ZcPFd+KwNf3odW1dVbDtJ8ZzkwayHKnbR6rwP3rIPyHJpAeZvsNjyIUuVr+rMOHnurA/Hd6eXl1B3ydC6f/SDVh/DY23G2ks7DnIq47eDUh8U9+8E6StuEg1I37U5yEIVpx7n6NdPRfQ3nYN5YE09W7FAoKWIXF2Kr0YpaDv7Y1SrkZQrnglOhdvYzIIQxQG09Udy19PUtE2m7zBdDr7KXzG6v9lb7LB4TW14Xfx/CCPm4ONc87Hdf+lcS14VZWOqqGdqwTYq4iRfRlzxs8ouO2qGJcxNaQAjMYSqQ/lHFq95NGTzJ8y9VUX98PuLK6G1GtNtGhZBKevMM2LR/Gx6V1nZfKXgnHz78KwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAn/oBXUQfCI5ulzgAAAAASUVORK5CYII="
          }
        />
      </Grid>

      <Grid padding="16px">
        <Input
          _onChange={changeContent}
          label="게시글 내용"
          placeholder="게시글 작성"
          multiLine
          value={contents}
        />
      </Grid>

      <Grid padding="16px">
        {is_edit ? (
          <Button _onClick={editPost} text="게시글 수정"></Button>
        ) : (
          <Button _onClick={addPost} text="게시글 작성"></Button>
        )}
      </Grid>
    </React.Fragment>
  );
};

export default PostWrite;
