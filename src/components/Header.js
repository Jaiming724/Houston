import React from 'react';

const Header = ({ping}) => {
    return (
        <div className="flex justify-between font-bold text-5xl p-2">
            <h1 style={{color: "white"}}>Houston</h1>
            <h1 style={{color: "white"}}> {ping}ms</h1>
        </div>
    );
};


export default Header;
