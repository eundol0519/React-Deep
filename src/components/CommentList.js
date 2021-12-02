import React from "react";
import { Grid, Image, Text } from "../elements";

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as commentActions } from "../redux/modules/comment";

const CommentList = (props) => {
  
  const dispatch = useDispatch();

  const { post_id } = props;
  const comment_list = useSelector((state) => state.comment.list)

  React.useEffect(()=>{
    if(!comment_list[post_id]){ // 해당 게시물의 댓글 정보가 없으면 불러온다.
      dispatch(commentActions.getCommentFB(post_id))
    }
  }, [])

  if(!comment_list[post_id] || !post_id){
    return null;
  }

  return (
    <React.Fragment>
      <Grid padding="16px">
        {comment_list[post_id].map(c => {
          return <CommentItem key={c.id} {...c} />
        })}
      </Grid>
    </React.Fragment>
  );
};

export default CommentList;

CommentList.defaultProps = {
  post_id : null,
}

const CommentItem = (props) => {
  const { user_profile, user_name, user_id, post_id, contents, insert_dt } =
    props;
  return (
    <Grid is_flex>
      <Grid is_flex width="auto">
        <Image shape="circle" />
        <Text bold>{user_name}</Text>
      </Grid>
      <Grid is_flex margin="0px 4px">
        <Text margin="0px">{contents}</Text>
        <Text margin="0px">{insert_dt}</Text>
      </Grid>
    </Grid>
  );
};

CommentItem.defaultProps = {
  user_profile: "",
  user_name: "mean0",
  user_id: "",
  post_id: 1,
  contents: "귀여운 고양이네요!",
  insert_dt: "2021-01-01 19:00:00",
};
