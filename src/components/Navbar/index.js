import React, { useEffect } from 'react'
import { NavLink } from "react-router-dom";
import './index.scss';
import { Button, Dropdown } from 'antd';
import ConnectModal from "../Modal";
import { connect } from 'react-redux';
import * as PropTypes from "prop-types";
import { setAccountAddress } from '../../actions/account';
import { decode } from 'js-base64';

const Navbar = ({
    address,
    setAccountAddress,
}) => {

    let activeStyle = {
        color: "#e94100"
    };


    useEffect(() => {
        const savedAddress = localStorage.getItem("ac");
        const userAddress = savedAddress ? decode(savedAddress) : address;

        if (userAddress) {
            setAccountAddress(userAddress);

            //   fetchKeplrAccountName().then((name) => {
            //     setAccountName(name);
            //   });
        }
    }, [address]);

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
                                                    {address ? address :
                                                        " Connect Wallet"
                                                    }
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

// export default Navbar;
Navbar.propTypes = {
    address: PropTypes.string,

};

const stateToProps = (state) => {
    return {
        address: state.account.address,
    };
};

const actionsToProps = {
    setAccountAddress
};

export default connect(stateToProps, actionsToProps)(Navbar);