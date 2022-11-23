import React from 'react';

const Header = ({ping}) => {
    return (
        <div style={{display:"flex", justifyContent:"space-between",alignItems:"flex-start",
            width: "100%",height:"5vh", backgroundColor: "blue"}}>
            <h1 style={{color:"white"}}>Houston</h1>
            <h1 style={{color:"white"}}> {ping}ms</h1>
        </div>
    );
};


export default Header;
