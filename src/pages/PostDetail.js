import React from "react";
import Post from "../components/Post";
import CommentList from "../components/CommentList";
import CommentWrite from "../components/CommentWrite";

import { useSelector, useDispatch } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";
import Permit from "../shared/Permit";

const PostDetail = (props) => {
  const id = props.match.params.id; // 파라미터로 넘어온 params의 id를 불러온다.
  const post_list = useSelector((state) => state.post.list); // 게시물 목록 정보
  const user_info = useSelector((state) => state.user.user); // 사용자 정보

  // 상세 페이지의 게시물 정보를 불러온다.
  const post_idx = post_list.findIndex((p) => p.id === id);
  const post = post_list[post_idx];
  // === const post = post_list.find(p => p.id === id)

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (post) {
      return;
    }

    // 단일 게시물 불러오기
    dispatch(postActions.getOnePostFB(id));
  }, []);

  return (
    <React.Fragment>
      {post && (
        <Post {...post} is_me={post.user_info.user_id === user_info?.uid} />
      )}
      <Permit>
        <CommentWrite post_id={id} />
      </Permit>
      <CommentList post_id={id} />
    </React.Fragment>
  );
};

export default PostDetail;
