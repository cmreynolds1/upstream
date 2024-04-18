import './Tooltip.css';
import React, { useState } from "react";
import { AiOutlineInfoCircle } from 'react-icons/ai';

function Tooltip_PassReq() {
    const [isHovering, setIsHovering] = useState(false);

    const listItems = ['The password requirements are as follows:', 'At least 8 characters', '1 Uppercase letter', '1 Lowercase Letter', '1 Number', '1 Symbol'];

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{ cursor: 'pointer' }}
            >
                <span style={{ padding: '5px' }}><AiOutlineInfoCircle /></span>
            </div>

            {isHovering && (
                <div style={{
                    position: 'absolute',
                    left: '100%',
                    top: 0,
                    border: '1px solid black',
                    padding: '10px',
                    backgroundColor: 'white',
                    zIndex: 1000,
                    minWidth: '200px',
                }}>
                    <div onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                        {listItems.map((item, index) => (
                            <div key={index} className={index !== 0 ? 'tooltip-list-item' : ''}>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tooltip_PassReq;
