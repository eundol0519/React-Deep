import React from "react";
import _ from "lodash";
import { Spinner } from "../elements";

const InfinityScroll = (props) => {
  const { children, callNext, is_next, loading } = props;

  const _handleScroll = _.throttle(() => {
    const { innerHeight } = window;
    const { scrollHeight } = document.body;
    const scrollTop =
      (document.documentElement && document.documentElement.scrollTop) ||
      document.body.scrollTop;

    if (scrollHeight - innerHeight - scrollTop < 200) {
      if (loading) {
        // 로딩 중이면 다음 리스트를 불러오지 않는다.
        return;
      }

      callNext(); // 받아온 다음 리스트로 넘긴다.
    }
  }, 300);

  const handleScroll = React.useCallback(_handleScroll, [loading]);

  React.useEffect(() => {
    if (loading) {
      // 로딩 중이면 다음 리스트를 불러오지 않는다.
      return;
    }

    if (is_next) {
      window.addEventListener("scroll", handleScroll); // 스크롤 이벤트를 구독한다.
    } else {
      window.removeEventListener("scroll", handleScroll); // 스크롤 이벤트를 구독 해제한다.
    }

    return () => window.removeEventListener("scroll", handleScroll); // 클린업
  }, [is_next, loading]);

  return (
    <React.Fragment>
        {props.children}
        {is_next && (<Spinner></Spinner>)}
    </React.Fragment>
  )
};

InfinityScroll.defaultProps = {
  children: null,
  callNext: () => {},
  is_next: false,
  loading: false,
};

export default InfinityScroll;
