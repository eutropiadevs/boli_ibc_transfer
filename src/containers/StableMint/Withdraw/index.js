import { Button, message } from "antd";
import Long from "long";
import * as PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col, Row, SvgIcon } from "../../../components/common";
import CustomInput from "../../../components/CustomInput";
import TooltipIcon from "../../../components/TooltipIcon";
import { ValidateInputNumber } from "../../../config/_validation";
import {
    amountConversion,
    amountConversionWithComma,
    getAmount,
    getDenomBalance,
} from "../../../utils/coin";
import { denomToSymbol, iconNameFromDenom, toDecimals } from "../../../utils/string";
import variables from "../../../utils/variables";
import { setAssets, setPair } from "../../../actions/asset";
import {
    setWhiteListedAssets,
    setAllWhiteListedAssets,
    setOwnerVaultInfo,
    setCollectorData,
    setExtendedPairVaultListData,
    setSelectedExtentedPairvault
} from "../../../actions/locker";
import { queryPair, queryPairVault } from "../../../services/asset/query";
import {
    PRODUCT_ID,
} from "../../../constants/common";
import Snack from "../../../components/common/Snack";
import { signAndBroadcastTransaction } from "../../../services/helper";
import { defaultFee } from "../../../services/transaction";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { queryCollectorInformation } from "../../../services/collector";
import { decimalConversion } from "../../../utils/number";
import {
    setAssetIn,
    setAssetOut,
    setAmountOut,
    setAmountIn,
} from "../../../actions/asset";
import { useParams } from "react-router";
import { comdex } from "../../../config/network";
import CustomSkelton from "../../../components/CustomSkelton";


const Deposit = ({
    lang,
    balances,
    address,
    setAmountIn,
    refreshBalance,
    pair,
    setPair,
    assetMap
}) => {
    const { pathVaultId } = useParams();

    // New 
    const selectedExtentedPairVaultListData = useSelector((state) => state.locker.extenedPairVaultListData);
    const pairId = selectedExtentedPairVaultListData && selectedExtentedPairVaultListData[0]?.pairId?.toNumber();
    const drawDownFee = decimalConversion(selectedExtentedPairVaultListData[0]?.drawDownFee) * 100 || "0"



    const dispatch = useDispatch();
    const inAmount = useSelector((state) => state.asset.inAmount);
    const psmLockedAndMintedData = useSelector((state) => state.stableMint.lockAndMintedData);



    const [inProgress, setInProgress] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputValidationError, setInputValidationError] = useState();
    const [currentExtentedVaultdata, setCurrentExtentedVaultdata] = useState();



    const resetValues = () => {
        dispatch(setAmountIn(0));
    };

    // new 

    const getAssetDataByPairId = (pairId) => {
        queryPair(pairId, (error, data) => {
            if (error) {
                message.error(error);
                return;
            }
            setPair(data?.pairInfo)
        })
    }


    const fetchQueryPairValut = (pairVaultId) => {
        setLoading(true)
        queryPairVault(pairVaultId, (error, data) => {
            if (error) {
                message.error(error);
                setLoading(false)
                return;
            }
            setCurrentExtentedVaultdata(data?.pairVault)
            dispatch(setExtendedPairVaultListData(data?.pairVault))
            dispatch(setSelectedExtentedPairvault(data?.pairVault))
            setLoading(false)
        })
    }


    useEffect(() => {
        fetchQueryPairValut(pathVaultId);
        if (pairId) {
            getAssetDataByPairId(pairId);
        }
    }, [address, pairId, refreshBalance])

    // end 

    const handleFirstInputChange = (value) => {
        value = toDecimals(value).toString().trim();
        setInputValidationError(
            ValidateInputNumber(
                Number(getAmount(value)),
                AvailableAssetBalance,
                "macro"
            )
        );
        dispatch(setAmountIn(value));
    };

    useEffect(() => {
        resetValues();
    }, [address]);

    const AvailableAssetBalance = getDenomBalance(balances, pair?.denomOut) || 0;

    const handleInputMax = () => {
        if (Number(AvailableAssetBalance)) {
            return dispatch(
                setAmountIn(amountConversion(AvailableAssetBalance, comdex?.coinDecimals, assetMap[pair && pair?.denomOut]?.decimals))
            );
        } else {
            return null;
        }
    };


    const calculateDrawdown = (userAmount, fee) => {
        let drawDownFee = fee;
        let amount = userAmount;
        let calculatePercentage = Number((drawDownFee / 100) * amount).toFixed(comdex?.coinDecimals);
        return calculatePercentage;
    }
    const calcutlateCMSTToBeBurned = (userAmount, fee) => {
        let drawDownFee = fee;
        let amount = userAmount;
        let calculatePercentage = Number((drawDownFee / 100) * amount).toFixed(comdex?.coinDecimals);
        let calculateCMSTToBeBurned = (amount - calculatePercentage).toFixed(comdex?.coinDecimals);
        return calculateCMSTToBeBurned
    }

    const handleWithdrawStableToken = () => {
        if (!address) {
            message.error("Address not found, please connect to Keplr");
            return;
        }
        setInProgress(true);
        message.info("Transaction initiated");
        signAndBroadcastTransaction(
            {
                message: {
                    typeUrl: "/comdex.vault.v1beta1.MsgWithdrawStableMintRequest",
                    value: {
                        from: address,
                        appId: Long.fromNumber(PRODUCT_ID),
                        extendedPairVaultId: Long.fromNumber(selectedExtentedPairVaultListData[0]?.id?.toNumber()),
                        amount: getAmount(inAmount, assetMap[pair && pair?.denomOut]?.decimals),
                        stableVaultId: Long.fromNumber(psmLockedAndMintedData?.id?.toNumber()),
                    },
                },
                fee: defaultFee(),
            },
            address,
            (error, result) => {
                setInProgress(false);
                if (error) {
                    message.error(error);
                    return;
                }

                if (result?.code) {
                    message.info(result?.rawLog);
                    return;
                }
                message.success(
                    <Snack
                        message={variables[lang].tx_success}
                        hash={result?.transactionHash}
                    />
                );
                resetValues();
                dispatch({
                    type: "BALANCE_REFRESH_SET",
                    value: refreshBalance + 1,
                });
            }
        );
    };

    return (
        <>
            <Col>
                <div className="farm-content-card earn-deposite-card earn-main-deposite">
                    <div className="locker-title">Stable Mint</div>
                    <div className="assets-select-card  ">
                        <div className="assets-left">
                            <label className="leftlabel">
                                Withdraw <TooltipIcon text="Burn CMST to withdraw stable coin" />
                            </label>
                            <Row>
                                <Col>
                                    <div className="assets-select-wrapper">
                                        {loading ? <CustomSkelton />
                                            :
                                            <React.Fragment>
                                                <div className="farm-asset-icon-container">
                                                    <div className="select-inner">
                                                        <div className="svg-icon">
                                                            <div className="svg-icon-inner">
                                                                <SvgIcon
                                                                    name={iconNameFromDenom(pair?.denomIn)}
                                                                />
                                                                <span
                                                                    style={{ textTransform: "uppercase" }}
                                                                >
                                                                    {denomToSymbol(pair?.denomIn)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        }
                                    </div>
                                </Col>
                            </Row>
                        </div>
                        <div className="assets-right">
                            <div className="label-right">
                                Available
                                <span className="ml-1">
                                    {amountConversionWithComma(AvailableAssetBalance, comdex?.coinDecimals, assetMap[pair && pair?.denomOut]?.decimals)} {denomToSymbol(pair?.denomOut)}
                                </span>
                                <div className="maxhalf">
                                    <Button className="active" onClick={() => handleInputMax()}>
                                        Max
                                    </Button>
                                </div>
                            </div>
                            <div className="input-select">
                                <CustomInput
                                    value={inAmount}
                                    onChange={(event) => {
                                        handleFirstInputChange(event.target.value);
                                    }}
                                    validationError={inputValidationError}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="interest-rate-container mt-4">
                        <Row>
                            <div className="title">Calculated Drawdown Amount</div>
                            <div className="value">

                                {calculateDrawdown(inAmount, drawDownFee)}
                                {' '}
                                {denomToSymbol(pair?.denomOut)}

                            </div>
                        </Row>
                        <Row>
                            <div className="title"> CMST to be Burnt</div>
                            <div className="value">
                                {calcutlateCMSTToBeBurned(inAmount, drawDownFee)}
                                {" "}
                                {denomToSymbol(pair?.denomOut)}
                            </div>
                        </Row>
                    </div>

                    <div className="assets PoolSelect-btn">
                        <div className="assets-form-btn text-center  mb-2">
                            <Button
                                loading={inProgress}
                                type="primary"
                                className="btn-filled"
                                disabled={
                                    inProgress
                                    || !Number(inAmount) ||
                                    inputValidationError?.message
                                }
                                onClick={() => {
                                    handleWithdrawStableToken()
                                }}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </div>
                </div>
            </Col>
        </>
    );
};

Deposit.propTypes = {
    address: PropTypes.string.isRequired,
    assets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.shape({
                low: PropTypes.number,
                high: PropTypes.number,
                inSigned: PropTypes.number,
            }),
            name: PropTypes.string.isRequired,
            denom: PropTypes.string.isRequired,
            decimals: PropTypes.shape({
                low: PropTypes.number,
                high: PropTypes.number,
                inSigned: PropTypes.number,
            }),
        })
    ),
    allWhiteListedAssets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.shape({
                low: PropTypes.number,
                high: PropTypes.number,
                inSigned: PropTypes.number,
            }),
            name: PropTypes.string.isRequired,
            denom: PropTypes.string.isRequired,
            decimals: PropTypes.shape({
                low: PropTypes.number,
                high: PropTypes.number,
                inSigned: PropTypes.number,
            }),
        })
    ),
    whiteListedAsset: PropTypes.arrayOf(
        PropTypes.shape({
            list: PropTypes.shape({
                id: PropTypes.shape({
                    low: PropTypes.number,
                    high: PropTypes.number,
                    inSigned: PropTypes.number,
                }),
            }),
        })
    ),
    balances: PropTypes.arrayOf(
        PropTypes.shape({
            denom: PropTypes.string.isRequired,
            amount: PropTypes.string,
        })
    ),
    demandCoin: PropTypes.shape({
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        denom: PropTypes.string,
    }),
    refreshBalance: PropTypes.number.isRequired,
    ownerLockerInfo: PropTypes.string,
    pair: PropTypes.shape({
        denomIn: PropTypes.string,
        denomOut: PropTypes.string,
    }),
    assetMap: PropTypes.object,
};
const stateToProps = (state) => {
    return {
        address: state.account.address,
        lang: state.language,
        balances: state.account.balances.list,
        pair: state.asset.pair,
        assets: state.asset._.list,
        allWhiteListedAssets: state.locker._.list,
        whiteListedAsset: state.locker.whiteListedAssetById.list,
        refreshBalance: state.account.refreshBalance,
        ownerLockerInfo: state.locker.ownerVaultInfo,
        assetMap: state.asset.map,
    };
};

const actionsToProps = {
    setPair,
    setAssets,
    setAllWhiteListedAssets,
    setWhiteListedAssets,
    setOwnerVaultInfo,
    setCollectorData,
    setAmountIn,
    setAmountOut,
    setAssetIn,
    setAssetOut,
};
export default connect(stateToProps, actionsToProps)(Deposit);
