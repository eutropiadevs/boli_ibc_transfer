import React from 'react'
import { Button, Col, Input, Modal, Row } from 'antd';
import { useState } from 'react';
import './index.scss';

const ChainModal = ({ item }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="chain_modal_main_container">
                <div className="chaim_modal_container">
                    <Button type="primary" onClick={showModal}>
                        <img src={item?.icon} alt="" />
                    </Button>
                    <Modal
                        title="Send Tokens"
                        open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={false}
                    >
                        <Row className="mb-4">
                            <Col style={{ width: "100%" }}>
                                {/* <label>Check Eligibility</label> */}
                                <div className="d-flex input-field">
                                    {/* <Input onChange={(e) => setUserAddress(e.target.value)} value={userAddress} placeholder={`Enter Your ${currentChain?.chainName} Wallet Address`} /> <Button type="primary" className="btn-filled" loading={loading} onClick={() => checkChainAddressEligibility(userAddress)}>Check</Button> */}
                                    <Input placeholder='Enter your address' />
                                </div>
                                <div className="d-flex input-field mt-3">
                                    {/* <Input onChange={(e) => setUserAddress(e.target.value)} value={userAddress} placeholder={`Enter Your ${currentChain?.chainName} Wallet Address`} /> <Button type="primary" className="btn-filled" loading={loading} onClick={() => checkChainAddressEligibility(userAddress)}>Check</Button> */}
                                    <Input type='number' placeholder='Enter amount' />
                                </div>

                                <Button type="primary" className="btn-filled mt-3" style={{ width: "100%" }}>
                                    Transaction
                                </Button>
                            </Col>
                        </Row>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default ChainModal