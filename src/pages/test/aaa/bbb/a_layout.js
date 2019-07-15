import React from 'react' 

export default function(props) {
  return (
    <>
    <h3> 这里是_layout.js的内容</h3>
    <hr/>
      { props.children }
    </>
  );
}