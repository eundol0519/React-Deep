// PostList.js
import React from "react";
import { useSelector, useDispatch } from "react-redux";

import Post from "../components/Post";
import { actionCreators as postActions } from "../redux/modules/post";
import InfinityScroll from "../shared/InfinityScroll";

import { Grid } from "../elements";

const PostList = (props) => {
  const dispatch = useDispatch();

  const user_info = useSelector((state) => state.user.user);
  const post_list = useSelector((state) => state.post.list); // 게시물 정보
  const is_loading = useSelector((state) => state.post.is_loading); // 로딩 정보
  const paging = useSelector((state) => state.post.paging); // 페이징 정보

  const { history } = props;

  React.useEffect(() => {
    if (post_list.length < 2) {
    // 상세 페이지에서 뒤로가기 눌렀을 때 게시물 목록 불러오기
      dispatch(postActions.getPostFB());
    }
  }, []);

  return (
    <React.Fragment>
      {/* 경계 나눠주기 */}
      <Grid bg={"#EFF6FF"} padding="20px 0px">
        <InfinityScroll
          callNext={() => {
            dispatch(postActions.getPostFB(paging.next));
          }}
          is_next={paging.next ? true : false}
          loading={is_loading}
        >
          {/* <Post/> */}
          {post_list.map((p, idx) => {
            if (p.user_info.user_id === user_info?.uid) {
              return (
                <Grid
                  bg= "#ffffff"
                  margin="8px 0px"
                  key={p.id}
                  _onClick={() => {
                    history.push(`/post/${p.id}`);
                  }}
                >
                  <Post {...p} is_me />
                </Grid>
              );
            } else {
              return (
                <Grid
                  bg= "#ffffff"
                  key={p.id}
                  _onClick={() => {
                    history.push(`/post/${p.id}`);
                  }}
                >
                  <Post {...p} />
                </Grid>
              );
            }
          })}
        </InfinityScroll>
      </Grid>
    </React.Fragment>
  );
};

export default PostList;
