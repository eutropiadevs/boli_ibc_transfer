import { Button, Table } from "antd";
import Lodash from "lodash";
import * as PropTypes from "prop-types";
import React, { useState } from "react";
import { IoReload } from "react-icons/io5";
import { connect, useDispatch } from "react-redux";
import { Col, Row, SvgIcon } from "../../components/common";
import NoDataIcon from "../../components/common/NoDataIcon";
import AssetList from "../../config/ibc_assets.json";
import { cmst, comdex, harbor } from "../../config/network";
import { DOLLAR_DECIMALS } from "../../constants/common";
import { getChainConfig } from "../../services/keplr";
import {
  amountConversion,
  commaSeparatorWithRounding,
  denomConversion,
} from "../../utils/coin";
import { commaSeparator, marketPrice } from "../../utils/number";
import { iconNameFromDenom } from "../../utils/string";
import variables from "../../utils/variables";
import Deposit from "./Deposit";
import "./index.scss";
import Withdraw from "./Withdraw";

const Assets = ({
  lang,
  assetBalance,
  balances,
  markets,
  refreshBalance,
  assetMap,
  harborPrice,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const handleBalanceRefresh = () => {
    setLoading(true);
    let assetReloadBth = document.getElementById("reload-btn");
    assetReloadBth.classList.toggle("reload");
    if (!assetReloadBth.classList.contains("reload")) {
      assetReloadBth.classList.add("reload-2");
    } else {
      assetReloadBth.classList.remove("reload-2");
    }

    dispatch({
      type: "BALANCE_REFRESH_SET",
      value: refreshBalance + 1,
    });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const columns = [
    {
      title: "Asset",
      dataIndex: "asset",
      key: "asset",
    },
    {
      title: "No. of Tokens",
      dataIndex: "noOfTokens",
      key: "noOfTokens",
      align: "center",
      render: (tokens) => (
        <>
          <p>{commaSeparator(Number(tokens || 0))}</p>
        </>
      ),
    },
    // {
    //   title: "Oracle Price",
    //   dataIndex: "oraclePrice",
    //   key: "oraclePrice",
    //   align: "center",
    //   render: (price) => (
    //     <>
    //       <p>${commaSeparator(Number(price || 0).toFixed(DOLLAR_DECIMALS))}</p>
    //     </>
    //   ),
    // },
    // {
    //   title: "Amount",
    //   dataIndex: "amount",
    //   key: "amount",
    //   align: "center",
    //   render: (amount) => (
    //     <>
    //       <p>${commaSeparator(Number(amount || 0).toFixed(DOLLAR_DECIMALS))}</p>
    //     </>
    //   ),
    // },
    {
      title: "IBC Deposit",
      dataIndex: "ibcdeposit",
      key: "ibcdeposit",
      align: "center",
      render: (value) => {
        if (value) {
          return value?.depositUrlOverride ? (
            <Button
              type="primary btn-filled"
              size="small"
              className="external-btn"
            >
              <a
                href={value?.depositUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Deposit{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Deposit
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
    {
      title: "IBC Withdraw",
      dataIndex: "ibcwithdraw",
      key: "ibcwithdraw",
      width: 110,
      render: (value) => {
        if (value) {
          return value?.withdrawUrlOverride ? (
            <Button
              type="primary btn-filled"
              size="small"
              className="external-btn"
            >
              <a
                href={value?.withdrawUrlOverride}
                target="_blank"
                rel="noreferrer"
              >
                Withdraw{" "}
                <span className="hyperlink-icon">
                  {" "}
                  <SvgIcon name="hyperlink" />
                </span>
              </a>
            </Button>
          ) : (
            <Withdraw
              chain={value}
              balances={balances}
              handleRefresh={handleBalanceRefresh}
            />
          );
        }
      },
    },
  ];

  const getPrice = (denom) => {
    if (denom === harbor?.coinMinimalDenom) {
      return harborPrice;
    }
    return marketPrice(markets, denom, assetMap[denom]?.id) || 0;
  };

  let ibcBalances = AssetList?.tokens.map((token) => {
    const ibcBalance = balances.find(
      (item) => item.denom === token?.ibcDenomHash
    );
    return {
      chainInfo: getChainConfig(token),
      coinMinimalDenom: token?.coinMinimalDenom,
      balance: {
        amount: ibcBalance?.amount
          ? amountConversion(
            ibcBalance.amount,
            comdex?.coinDecimals,
            assetMap[ibcBalance?.denom]?.decimals
          )
          : 0,
        price: getPrice(ibcBalance?.denom) || 0,
      },
      sourceChannelId: token.comdexChannel,
      destChannelId: token.channel,
      ibcDenomHash: token?.ibcDenomHash,
      explorerUrlToTx: token?.explorerUrlToTx,
      depositUrlOverride: token?.depositUrlOverride,
      withdrawUrlOverride: token?.withdrawUrlOverride,
    };
  });

  const nativeCoin = balances.filter(
    (item) => item.denom === comdex?.coinMinimalDenom
  )[0];
  // const cmstCoin = balances.filter(
  //   (item) => item.denom === cmst?.coinMinimalDenom
  // )[0];
  // const harborCoin = balances.filter(
  //   (item) => item.denom === harbor?.coinMinimalDenom
  // )[0];

  const nativeCoinValue =
    getPrice(nativeCoin?.denom) *
    (nativeCoin?.amount ? Number(amountConversion(nativeCoin?.amount)) : 0);

  // const cmstCoinValue =
  //   getPrice(cmstCoin?.denom) *
  //   (cmstCoin?.amount ? Number(amountConversion(cmstCoin?.amount)) : 0);

  // const harborCoinValue =
  //   getPrice(harborCoin?.denom) *
  //   (harborCoin?.amount ? Number(amountConversion(harborCoin?.amount)) : 0);

  const currentChainData = [
    {
      key: comdex.chainId,
      asset: (
        <>
          <div className="assets-withicon">
            <div className="assets-icon">
              <SvgIcon name={iconNameFromDenom(comdex?.coinMinimalDenom)} />
            </div>{" "}
            {denomConversion(comdex?.coinMinimalDenom)}
          </div>
        </>
      ),
      noOfTokens: nativeCoin?.amount ? amountConversion(nativeCoin.amount) : 0,
      oraclePrice: getPrice(comdex?.coinMinimalDenom),
      amount: nativeCoinValue || 0,
    },
  ];

  const tableIBCData =
    ibcBalances &&
    ibcBalances.map((item) => {
      return {
        key: item?.coinMinimalDenom,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon name={iconNameFromDenom(item?.coinMinimalDenom)} />
              </div>
              {denomConversion(item?.coinMinimalDenom)}{" "}
            </div>
          </>
        ),
        noOfTokens: item?.balance?.amount,
        oraclePrice: getPrice(item?.ibcDenomHash),
        amount: Number(item.balance?.amount) * item.balance?.price,
        ibcdeposit: item,
        ibcwithdraw: item,
      };
    });

  const tableData = Lodash.concat(currentChainData, tableIBCData);

  return (
    <div className="app-content-wrapper">
      <div className=" assets-section">
        <Row>
          <Col>
            <div className="assets-head">
              <div>
                <h2>{variables[lang].comdex_assets}</h2>
              </div>
              <div className="total-asset-balance-main-container">
                <span>{variables[lang].total_asset_balance}</span>{" "}
                {commaSeparatorWithRounding(assetBalance, DOLLAR_DECIMALS)}{" "}
                {variables[lang].USD}{" "}
                <div className="d-flex">
                  <span
                    className="asset-reload-btn"
                    id="reload-btn-container"
                    onClick={() => handleBalanceRefresh()}
                  >
                    {" "}
                    <IoReload id="reload-btn" />{" "}
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table
              className="custom-table assets-table"
              dataSource={tableData}
              columns={columns}
              loading={loading}
              pagination={false}
              scroll={{ x: "100%" }}
              locale={{ emptyText: <NoDataIcon /> }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

Assets.propTypes = {
  lang: PropTypes.string.isRequired,
  assetBalance: PropTypes.number,
  refreshBalance: PropTypes.number.isRequired,
  assetMap: PropTypes.object,
  harborPrice: PropTypes.number.isRequired,
  balances: PropTypes.arrayOf(
    PropTypes.shape({
      denom: PropTypes.string.isRequired,
      amount: PropTypes.string,
    })
  ),
  markets: PropTypes.object,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    assetBalance: state.account.balances.asset,
    balances: state.account.balances.list,
    markets: state.oracle.market,
    refreshBalance: state.account.refreshBalance,
    assetMap: state.asset.map,
    harborPrice: state.liquidity.harborPrice,
  };
};

export default connect(stateToProps)(Assets);
