import React from 'react';

function Card({className = "", children = [], height = ""}) {

    return (
        <div

            className={`${className} bg-slate-700 shadow-lg rounded mx-3`}
            style={{height}}>
            {children}

        </div>
    );
}

export default Card;
