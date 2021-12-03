import React from "react";
import {Grid, Text, Image} from "../elements";
import Card from "../components/Card";

import { realTime } from "../shared/firebase";
import { useSelector } from "react-redux"; 

const Notification = (props) => {
    const user = useSelector((state) => state.user.user); // 유저 정보
    const [noti, setNoti] = React.useState([]);

    React.useEffect(()=>{
      if(!user){ // 유저가 없으면 돌아가
        return;
      }

      const notiDB = realTime.ref(`noti/${user.uid}/list`);
      const _noti = notiDB.orderByChild("insert_dt"); // realTime database는 오름차순만 지원한다.
      _noti.once('value', snapshot => {
        if(snapshot.exists()) { // snapshot이 있는 지 판별
          let _data = snapshot.val();
          
          let _noti_list = Object.keys(_data).reverse().map(s => { // key들만 불러와서 배열로 만들고 뒤집음
            return _data[s]; // value 값을 불러옴
          }); 

          console.log(_noti_list)
          setNoti(_noti_list)
        }
      })
    }, [user])

    return (
      <React.Fragment>
        <Grid padding="16px" bg="#EFF6FF">
            {noti.map((n, index) => {
                return (
                    <Card key={`noti_${index}`} {...n}/>
                )
            })}
        </Grid>
      </React.Fragment>
    );
}

export default Notification;
