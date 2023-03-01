import React from 'react'
import { NavLink } from "react-router-dom";
import './index.scss';
import { Button, Dropdown } from 'antd';
import ConnectModal from "../Modal";

const Navbar = () => {
    let activeStyle = {
        color: "#e94100"
    };

    const WalletConnectedDropdown = <ConnectModal />;

    return (
        <>
            <div className="navbar_main_container">
                <div className="max_width">
                    <div className="navbar_container ">
                        <div className="logo_container">
                            Logo
                        </div>
                        <div className="links_container">
                            <div className="links">
                                <ul>
                                    <li>
                                        <NavLink
                                            to="/asset"
                                            style={({ isActive }) =>
                                                isActive ? activeStyle : undefined
                                            }
                                        >
                                            Asset
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/ibc_transfer"
                                            style={({ isActive }) =>
                                                isActive ? activeStyle : undefined
                                            }
                                        >
                                            IBC Transfer
                                        </NavLink>
                                    </li>
                                    <div className="button_container">
                                        <div>
                                            <Dropdown
                                                overlay={WalletConnectedDropdown}
                                                placement="bottomRight"
                                                trigger={["click"]}
                                            >
                                                <Button shape="round" type="primary" className='btn-filled'>
                                                    Connect Wallet
                                                </Button>
                                            </Dropdown>
                                        </div>
                                    </div>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Navbar;