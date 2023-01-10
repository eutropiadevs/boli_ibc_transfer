import { message } from "antd";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Col, Row } from "../../components/common";
import TooltipIcon from "../../components/TooltipIcon";
import { cmst, comdex, harbor, ibcDenoms } from "../../config/network";
import { DOLLAR_DECIMALS, PRODUCT_ID, ZERO_DOLLAR_DECIMALS } from "../../constants/common";
import {
  fetchProposalUpData,
  totalveHarborSupply
} from "../../services/contractsRead";
import { queryAppTVL, queryPairsLockedAndMintedStatistic, queryTotalTokenMinted } from "../../services/vault/query";
import { amountConversion, amountConversionWithComma } from "../../utils/coin";
import { commaSeparator, marketPrice } from "../../utils/number";
import variables from "../../utils/variables";
import Banner from "./Banner";
import "./index.scss";

const Dashboard = ({ lang, isDarkMode, markets, assetMap, harborPrice }) => {
  const [totalValueLocked, setTotalValueLocked] = useState();
  const [totalDollarValue, setTotalDollarValue] = useState();
  const [harborSupply, setHarborSupply] = useState(0);
  const [harborCirculatingSupply, setHarborCirculatingSypply] = useState(0);
  const [harborCurrentSypply, setHarborCurrentSupply] = useState(0);
  const [cmstCurrentSupply, setCmstCurrentSupply] = useState();
  const [calculatedCMSTSupply, setCalculatedCMSTSupply] = useState(0);
  const [allCMSTMintedStatistic, setAllCMSTMintedStatistic] = useState([])
  const [uniqueCMSTMintedData, setUniqueCMSTMintedData] = useState();
  const [totalMintedCMST, setTotalMintedCMST] = useState();

  useEffect(() => {
    if (markets) {
      fetchTVL();
    }
  }, [markets, assetMap]);

  const fetchTVL = () => {
    queryAppTVL(PRODUCT_ID, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      if (result?.tvldata && result?.tvldata?.length > 0) {
        const uniqueVaults = Array.from(
          result?.tvldata?.reduce(
            (m, { assetDenom, collateralLockedAmount }) =>
              m.set(
                assetDenom,
                (m.get(assetDenom) || 0) + Number(collateralLockedAmount)
              ),
            new Map()
          ),
          ([assetDenom, collateralLockedAmount]) => ({
            assetDenom,
            collateralLockedAmount,
          })
        );
        let total = 0;
        const totalValue = new Map(
          uniqueVaults?.map((item) => {
            let value =
              Number(amountConversion(item.collateralLockedAmount, comdex.coinDecimals, assetMap[item?.assetDenom]?.decimals)) *
              marketPrice(markets, item?.assetDenom, assetMap[item?.assetDenom]?.id);
            total += value;
            item.dollarValue = value;
            return [item.assetDenom, item];
          })
        );
        setTotalValueLocked(totalValue);
        setTotalDollarValue(total);
      }
    });
  };

  const fetchTotalTokenMinted = () => {
    queryTotalTokenMinted(PRODUCT_ID, (error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      setCmstCurrentSupply(result?.mintedData);
    });
  };

  const fetchQueryPairsLockedAndMintedStatistic = () => {
    queryPairsLockedAndMintedStatistic((error, result) => {
      if (error) {
        message.error(error);
        return;
      }
      result?.pairStatisticData?.map((item) => {
        setAllCMSTMintedStatistic(oldArray => [...oldArray, { "name": item?.assetInDenom, "amount": Number(amountConversion(item?.mintedAmount), comdex?.coinDecimals) }])
      })
    });
  };

  const calculateUniqueCMSTMintedData = () => {
    let myMap = {};
    let total = 0;

    for (let i = 0; i < allCMSTMintedStatistic?.length; i++) {
      if (myMap[allCMSTMintedStatistic[i]?.name]) {
        myMap[allCMSTMintedStatistic[i]?.name] += allCMSTMintedStatistic[i]?.amount;
        total += Number(allCMSTMintedStatistic[i]?.amount);
      }
      else {
        myMap[allCMSTMintedStatistic[i]?.name] = allCMSTMintedStatistic[i]?.amount;
        total += Number(allCMSTMintedStatistic[i]?.amount);
      }
    }
    setTotalMintedCMST(Number(total).toFixed(comdex?.coinDecimals))

    setUniqueCMSTMintedData(myMap)
  }

  const fetchAllProposalUpData = (productId) => {
    fetchProposalUpData(productId)
      .then((res) => {
        setHarborCurrentSupply(res?.current_supply);
      })
      .catch((err) => {
        message.error(err);
      });
  };

  const fetchTotalveHarborSupply = () => {
    totalveHarborSupply()
      .then((res) => {
        setHarborSupply(res?.token);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const calculateTotalValueLockedInDollarForOthers = () => {
    let amount = 0;
    if (totalDollarValue) {
      amount =
        Number(totalDollarValue) -
        (Number(totalValueLocked?.get(ibcDenoms?.uosmo)?.dollarValue || 0) +
          Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0) +
          Number(totalValueLocked?.get(ibcDenoms?.uusdc)?.dollarValue || 0)

        );
    }

    return `$${commaSeparator(Number(amount || 0).toFixed(ZERO_DOLLAR_DECIMALS))}
`;
  };

  const calculateHarborSypply = () => {
    let amount =
      amountConversion(harborCurrentSypply) - amountConversion(harborSupply);
    amount = Number(amount).toFixed(DOLLAR_DECIMALS);
    setHarborCirculatingSypply(amount);
  };


  useEffect(() => {
    fetchQueryPairsLockedAndMintedStatistic()
  }, []);

  useEffect(() => {
    calculateUniqueCMSTMintedData()
  }, [allCMSTMintedStatistic])




  const getPrice = (denom) => {
    if (denom === harbor?.coinMinimalDenom) {
      return harborPrice;
    }
    return marketPrice(markets, denom, assetMap[denom]?.id) || 0;
  };

  const calculatedCmstCurrentSupply = () => {
    let totalMintedAmount = 0;
    cmstCurrentSupply &&
      cmstCurrentSupply.map((item) => {
        return (totalMintedAmount =
          totalMintedAmount + Number(item?.mintedAmount));
      });
    setCalculatedCMSTSupply(totalMintedAmount);
  };

  const MintedCMSTOptions = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 210,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "110%",
        innerSize: "82%",
        borderWidth: 0,
        className: "totalvalue-chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "AXL-USDC",
            y: Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc]),
            color: "#665AA6",
          },
          {
            name: "ATOM",
            y: Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom]),
            color: "#BFA9D7",
          },
          {
            name: "OSMO",
            y: Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uosmo]),
            color: "#8e78a5",
          },
          {
            name: "Others",
            y: Number(totalMintedCMST || 0) -
              (Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uosmo] || 0) +
                Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom] || 0) +
                Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc] || 0)
              ),
            color: isDarkMode ? "#373549" : "#E0E0E0",
          },
        ],
      },
    ],
  };

  const Options = {
    chart: {
      type: "pie",
      backgroundColor: null,
      height: 210,
      margin: 5,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: null,
    },
    plotOptions: {
      pie: {
        showInLegend: false,
        size: "110%",
        innerSize: "82%",
        borderWidth: 0,
        className: "totalvalue-chart",
        dataLabels: {
          enabled: false,
          distance: -14,
          style: {
            fontsize: 50,
          },
        },
      },
    },
    series: [
      {
        states: {
          hover: {
            enabled: false,
          },
        },
        name: "",
        data: [
          {
            name: "AXL-USDC",
            y: Number(totalValueLocked?.get(ibcDenoms?.uusdc)?.dollarValue || 0),
            color: "#665AA6",
          },
          {
            name: "ATOM",
            y: Number(
              totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0
            ),
            color: "#BFA9D7",
          },
          {
            name: "OSMO",
            y: Number(totalValueLocked?.get(ibcDenoms?.uosmo)?.dollarValue || 0),
            color: "#8e78a5",
          },
          {
            name: "Others",
            y:
              Number(totalDollarValue || 0) -
              (
                Number(totalValueLocked?.get(ibcDenoms?.uosmo)?.dollarValue || 0) +
                Number(totalValueLocked?.get(ibcDenoms?.uatom)?.dollarValue || 0) +
                Number(totalValueLocked?.get(ibcDenoms?.uusdc)?.dollarValue || 0)
              ),
            color: isDarkMode ? "#373549" : "#E0E0E0",
          },
        ],
      },
    ],
  };



  return (
    <div className="app-content-wrapper dashboard-app-content-wrapper">
      <Row>
        <Col className="dashboard-upper ">
          <div className="dashboard-upper-left ">
            <div
              className="composite-card  earn-deposite-card"
              style={{ height: "97%" }}
            >
              <div className="dashboard-statics">
                <p className="total-value">
                  Total Value Locked{" "}
                  <TooltipIcon
                    text={variables[lang].tooltip_total_value_locked}
                  />
                </p>
                <h2>
                  $
                  {commaSeparator(
                    Number(totalDollarValue || 0).toFixed(ZERO_DOLLAR_DECIMALS)
                  )}
                </h2>
              </div>
              <div className="totalvalues">
                <div className="totalvalues-chart">
                  <HighchartsReact highcharts={Highcharts} options={Options} />
                </div>
                <div className="totalvalues-right">
                  <div className="dashboard-statics mb-4  ">
                    <p>AXL-USDC</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.get(ibcDenoms?.uusdc)?.dollarValue || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-4 total-dashboard-stats">
                    <p>ATOM</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.get(ibcDenoms?.uatom)
                            ?.dollarValue || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-4 total-dashboard-stats-2">
                    <p>OSMO</p>
                    <h3>
                      $
                      {commaSeparator(
                        Number(
                          totalValueLocked?.get(ibcDenoms?.uosmo)?.dollarValue || 0
                        ).toFixed(ZERO_DOLLAR_DECIMALS)
                      )}
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-0 others-dashboard-stats">
                    <p>Others</p>
                    <h3>{calculateTotalValueLockedInDollarForOthers()}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-upper-left dashboard-upper-right">
            <div
              className="composite-card  earn-deposite-card dashboard-chart-container"
              style={{ height: "97%" }}
            >
              <div className="dashboard-statics">
                <p className="total-value">
                  Total CMST Minted{" "}
                  <TooltipIcon
                    text={variables[lang].tooltip_total_value_minted}
                  />
                </p>
                <h2>

                  {commaSeparator(
                    Number(totalMintedCMST || 0).toFixed(ZERO_DOLLAR_DECIMALS)
                  )} CMST
                </h2>
              </div>
              <div className="totalvalues">
                <div className="totalvalues-chart">
                  <HighchartsReact highcharts={Highcharts} options={MintedCMSTOptions} />
                </div>
                <div className="totalvalues-right">

                  <div className="dashboard-statics mb-4 ">
                    <p>AXL-USDC</p>
                    <h3>
                      {commaSeparator(Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc] || 0).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-4 total-dashboard-stats">
                    <p>ATOM</p>
                    <h3>
                      {commaSeparator(Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom] || 0).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>
                  <div className="dashboard-statics mb-4 total-dashboard-stats-2">
                    <p>OSMO</p>
                    <h3>
                      {commaSeparator(Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uosmo] || 0).toFixed(ZERO_DOLLAR_DECIMALS))} CMST
                    </h3>
                  </div>

                  <div className="dashboard-statics mb-0 others-dashboard-stats">
                    <p>Others</p>
                    <h3>{
                      commaSeparator(
                        Math.max(
                          Number(Number(totalMintedCMST || 0) -
                            (
                              Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uosmo] || 0) +
                              Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uatom] || 0) +
                              Number(uniqueCMSTMintedData && uniqueCMSTMintedData[ibcDenoms?.uusdc] || 0)
                            )).toFixed(ZERO_DOLLAR_DECIMALS)
                          , 0))

                    } CMST
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      <Banner lang={lang} />
    </div>
  );
};

Dashboard.propTypes = {
  isDarkMode: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
  assetMap: PropTypes.object,
  markets: PropTypes.object,
  harborPrice: PropTypes.number.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    isDarkMode: state.theme.theme.darkThemeEnabled,
    markets: state.oracle.market,
    assetMap: state.asset.map,
    harborPrice: state.liquidity.harborPrice,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Dashboard);
