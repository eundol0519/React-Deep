//components/NotiBadge.js
import React from "react";

import { Notifications } from "@material-ui/icons";
import { Badge } from "@material-ui/core";
import { realTime } from "../shared/firebase";
import { useSelector } from "react-redux";

const NotiBadge = (props) => {

  const user_id = useSelector((state) => state.user.user.uid);  
  const [is_read, setIsRead] = React.useState(true);

  const notiCheck = () => {
    const notiDB = realTime.ref(`noti/${user_id}`);
    notiDB.update({read : true}); // 알림 버튼 누르면 읽은 걸로 처리
    props._onClick();
  };

  React.useEffect(()=>{
    const notiDB = realTime.ref(`noti/${user_id}`);
    notiDB.on("value", (snapshot)=>{ // 값이 바뀌었을 때 동작 할 동작
        setIsRead(snapshot.val()?.read);
    }); // 구독한다.

    return () => notiDB.off();
  }, [])

  return (
    <React.Fragment>
      <Badge
        invisible={is_read}
        color="secondary"
        onClick={notiCheck}
        variant="dot"
      >
        <Notifications />
      </Badge>
    </React.Fragment>
  );
};

NotiBadge.defaultProps = {
  _onClick: () => {},
};

export default NotiBadge;
