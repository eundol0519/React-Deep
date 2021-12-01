import React from "react";
import _ from "lodash";

const Search = () => {
  
  const debounce = _.debounce((e) => {
    console.log(e.target.value);
  }, 1000);

  const throttle = _.throttle((e) => {
      console.log(e.target.value)
  }, 1000)

  const onChange = (e) => {
    console.log(e.target.value);
  };

  return (
    <div>
      <input type="text" onChange={throttle}></input>
    </div>
  );
};

export default Search;
