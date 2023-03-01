import React, { useState } from 'react'
import { Button, Modal, Table } from 'antd';
import './index.scss';
import IBCDeposit from './Deposit';
import IBCWithdraw from './Withdraw';


const Asssets = () => {


    const columns = [
        {
            title: 'Asset',
            dataIndex: 'asset',
            key: 'asset',
            align: 'left',
            width: 100
        },
        {
            title: 'No. Of Tokens',
            dataIndex: 'noOfTokens',
            key: 'noOfTokens',
            align: 'center',
            width: 150
        },
        {
            title: 'IBC Deposit',
            dataIndex: 'ibcDeposit',
            key: 'ibcDeposit',
            align: 'center',
            width: 150
        },
        {
            title: 'IBC Withdraw',
            key: 'ibcWithdraw',
            dataIndex: 'ibcWithdraw',
            align: 'right',
            width: 150
        },
    ];

    const data = [
        {
            key: '1',
            asset: <>
                <div className="asset_with_icon">
                    <div className="icon"></div>
                    <div className="name">BOLI</div>
                </div>

            </>,
            noOfTokens: 20,
            ibcDeposit: <>
                <IBCDeposit />
            </>,
            ibcWithdraw: <>
                <IBCWithdraw />
            </>,
        },
        {
            key: '2',
            asset: <>
                <div className="asset_with_icon">
                    <div className="icon"></div>
                    <div className="name">HDC</div>
                </div>

            </>,
            noOfTokens: 20,
            ibcDeposit: <>
                <IBCDeposit />
            </>,
            ibcWithdraw: <>
                <IBCWithdraw />
            </>,
        },
        {
            key: '3',
            asset: <>
                <div className="asset_with_icon">
                    <div className="icon"></div>
                    <div className="name">Parallel</div>
                </div>

            </>,
            noOfTokens: 20,
            ibcDeposit: <>
                <IBCDeposit />
            </>,
            ibcWithdraw: <>
                <IBCWithdraw />
            </>,
        },
    ];




    return (
        <>
            <div className="asset_main_container">
                <div className="asset_container">
                    <div className="asset_table">
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            className="custom_table"
                            scroll={{ x: 600 }}
                        />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Asssets;