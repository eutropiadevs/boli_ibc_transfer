import React, { useEffect, useState } from 'react'
import * as PropTypes from "prop-types";
import { Col, Row, SvgIcon } from "../../../components/common";
import './index.scss';
import { connect } from "react-redux";
import { Button, message, Table } from "antd";
import { denomToSymbol, iconNameFromDenom, symbolToDenom } from "../../../utils/string";
import { amountConversion, amountConversionWithComma } from '../../../utils/coin';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DOLLAR_DECIMALS, PRODUCT_ID } from '../../../constants/common';
import { totalVTokens, userProposalAllUpData, votingCurrentProposal, votingCurrentProposalId, votingTotalBribs, votingTotalVotes, votingUserVote } from '../../../services/voteContractsRead';
import { queryAssets, queryPair, queryPairVault } from '../../../services/asset/query';
import { queryMintedTokenSpecificVaultType, queryOwnerVaults, queryOwnerVaultsInfo, queryUserVaults } from '../../../services/vault/query';
import { transactionForVotePairProposal } from '../../../services/voteContractsWrites';
import { setBalanceRefresh } from "../../../actions/account";
import { Link } from 'react-router-dom';
import moment from 'moment';
import TooltipIcon from '../../../components/TooltipIcon';
import Snack from '../../../components/common/Snack';
import variables from '../../../utils/variables';
import { comdex } from '../../../config/network';
import NoDataIcon from '../../../components/common/NoDataIcon';
import CustomSkelton from '../../../components/CustomSkelton';

const Vote = ({
  lang,
  address,
  refreshBalance,
  setBalanceRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [inProcess, setInProcess] = useState(false);
  const [proposalId, setProposalId] = useState();
  const [proposalExtenderPair, setProposalExtenderPair] = useState();
  const [currentProposalAllData, setCurrentProposalAllData] = useState();
  const [disableVoteBtn, setVoteDisableBtn] = useState(true)
  const [allProposalData, setAllProposalData] = useState();
  const [btnLoading, setBtnLoading] = useState(0);
  const [pairVaultData, setPairValutData] = useState({})
  const [assetList, setAssetList] = useState();
  const [pairIdData, setPairIdData] = useState({});
  const [totalBorrowed, setTotalBorrowed] = useState({});
  const [vaultId, setVaultId] = useState({});
  const [myBorrowed, setMyBorrowed] = useState({});

  const [totalVotingPower, setTotalVotingPower] = useState(0);

  // Query 
  const fetchVotingCurrentProposalId = () => {
    setLoading(true)
    votingCurrentProposalId(PRODUCT_ID).then((res) => {
      setProposalId(res)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  }

  const fetchVotingCurrentProposal = (proposalId) => {
    votingCurrentProposal(proposalId).then((res) => {
      setProposalExtenderPair(res?.extended_pair)
      setCurrentProposalAllData(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const unixToUTCTime = (time) => {
    // *Removing miliSec from unix time 
    let newTime = Math.floor(time / 1000000000);
    var timestamp = moment.unix(newTime);
    timestamp = moment.utc(timestamp).format("dddd DD-MMMM-YYYY [at] HH:mm:ss [UTC]")
    return timestamp;
  }
  const getProposalTimeExpiredOrNot = () => {
    let endTime = currentProposalAllData?.voting_end_time;
    // *Removing miliSec from unix time 
    let newEndTime = Math.floor(endTime / 1000000000);
    let currentTime = moment().unix();
    if (currentTime > newEndTime) {
      return setVoteDisableBtn(true)
    }
    else {
      return setVoteDisableBtn(false)
    }
  }

  const calculteVotingTime = () => {
    let endDate = currentProposalAllData?.voting_end_time;
    endDate = unixToUTCTime(endDate);
    if (endDate === "Invalid date") {
      return "Loading... "
    }
    return endDate;
  }

  const calculteVotingStartTime = () => {
    let startDate = currentProposalAllData?.voting_start_time;
    startDate = unixToUTCTime(startDate);
    if (startDate === "Invalid date") {
      return ""
    }
    return startDate;
  }

  const fetchAssets = (offset, limit, countTotal, reverse) => {
    queryAssets(offset, limit, countTotal, reverse, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setAssetList(data.assets)
    });
  };

  const fetchQueryPairValut = (extendedPairId) => {
    queryPairVault(extendedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setPairIdData((prevState) => ({
        ...prevState, [extendedPairId]: data?.pairVault?.pairId?.toNumber()
      }))
      setPairValutData((prevState) => ({
        ...prevState, [extendedPairId]: data?.pairVault?.pairName
      }))
    })
  }

  const fetchtotalBorrowed = (productId, extendedPairId) => {
    queryMintedTokenSpecificVaultType(productId, extendedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setTotalBorrowed((prevState) => ({
        ...prevState, [extendedPairId]: data?.tokenMinted
      }))
    })
  }
  const getOwnerVaultId = (productId, address, extentedPairId) => {
    queryOwnerVaults(productId, address, extentedPairId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setVaultId((prevState) => ({
        ...prevState, [extentedPairId]: data?.vaultId?.toNumber()
      }))
    })
  }

  const getOwnerVaultInfoByVaultId = (ownerVaultId) => {
    queryOwnerVaultsInfo(ownerVaultId, (error, data) => {
      if (error) {
        message.error(error);
        return;
      }
      setMyBorrowed((prevData) => ({
        ...prevData, [data?.vault?.extendedPairVaultId?.toNumber()]: data?.vault?.amountOut
      }))
    })
  }

  const fetchTotalVTokens = (address, height) => {
    totalVTokens(address, height).then((res) => {
      setTotalVotingPower(res)
    }).catch((error) => {
      console.log(error);
    })
  }

  const getIconFromPairName = (extendexPairVaultPairName) => {
    let pairName = extendexPairVaultPairName;
    pairName = pairName?.replace(/\s+/g, ' ').trim()
    if (!pairName?.includes("-")) {
      return pairName?.toLowerCase();
    } else {
      pairName = pairName?.slice(0, -2);
      pairName = pairName?.toLowerCase()
      return pairName;
    }
  }

  const calculateTotalVotes = (value) => {
    let userTotalVotes = 0;
    let calculatePercentage = 0;
    allProposalData && allProposalData.map((item) => {
      userTotalVotes = userTotalVotes + Number(amountConversion(item?.total_vote || 0))
    })
    calculatePercentage = (Number(value) / userTotalVotes) * 100;
    calculatePercentage = Number(calculatePercentage || 0).toFixed(DOLLAR_DECIMALS)
    return calculatePercentage;
  }

  useEffect(() => {
    fetchVotingCurrentProposalId()
    if (proposalId) {
      fetchVotingCurrentProposal(proposalId)
    } else {
      setProposalExtenderPair("")
    }
  }, [address, proposalId, refreshBalance])

  const getPairFromExtendedPair = () => {
    allProposalData && allProposalData.map((item) => {
      fetchQueryPairValut(item?.extended_pair_id)
      getOwnerVaultId(PRODUCT_ID, address, item?.extended_pair_id)
      fetchtotalBorrowed(PRODUCT_ID, item?.extended_pair_id)
    })
  }

  const fetchProposalAllUpData = (address, proposalId) => {
    setLoading(true)
    userProposalAllUpData(address, proposalId,).then((res) => {
      setAllProposalData(res?.proposal_pair_data)
      setLoading(false)
    }).catch((error) => {
      setLoading(false)
      console.log(error);
    })
  };

  useEffect(() => {
    proposalExtenderPair && proposalExtenderPair.map((item) => {
      getOwnerVaultInfoByVaultId(vaultId[item])
    })
  }, [vaultId, refreshBalance])
  useEffect(() => {
    if (proposalId) {
      fetchProposalAllUpData(address, proposalId);
    }
  }, [address, proposalId, refreshBalance])


  const handleVote = (item, index) => {
    setInProcess(true)
    setBtnLoading(index)
    if (address) {
      if (proposalId) {
        if (amountConversion(totalVotingPower, DOLLAR_DECIMALS) === Number(0).toFixed(DOLLAR_DECIMALS)) {
          message.error("Insufficient Voting Power")
          setInProcess(false)
        }
        else {
          transactionForVotePairProposal(address, PRODUCT_ID, proposalId, item, (error, result) => {
            if (error) {
              message.error(error?.rawLog || "Transaction Failed")
              setInProcess(false)
              return;
            }
            message.success(
              < Snack
                message={variables[lang].tx_success}
                explorerUrlToTx={comdex?.explorerUrlToTx}
                hash={result?.transactionHash}
              />
            )
            setBalanceRefresh(refreshBalance + 1);
            setInProcess(false)
          })

        }
      } else {
        setInProcess(false)
        message.error("Please enter amount")
      }
    }
    else {
      setInProcess(false)
      message.error("Please Connect Wallet")
    }
  }

  useEffect(() => {
    if (currentProposalAllData) {
      fetchTotalVTokens(address, currentProposalAllData?.height)
      getProposalTimeExpiredOrNot()
    }
  }, [address, refreshBalance, currentProposalAllData])

  useEffect(() => {
    fetchAssets(
      (DEFAULT_PAGE_NUMBER - 1) * (DEFAULT_PAGE_SIZE * 2),
      (DEFAULT_PAGE_SIZE * 2),
      true,
      false
    );
  }, [])

  useEffect(() => {
    getPairFromExtendedPair()
  }, [allProposalData, refreshBalance])

  const columns = [
    {
      title: (
        <>
          Vault Pair
        </>
      ),
      dataIndex: "asset",
      key: "asset",
      width: 150,
    },
    {
      title: (
        <>
          My Borrowed{" "}
        </>
      ),
      dataIndex: "my_borrowed",
      key: "my_borrowed",
      width: 150,
    },
    {
      title: (
        <>
          Total Borrowed
        </>
      ),
      dataIndex: "total_borrowed",
      key: "total_borrowed",
      width: 200,
    },
    {
      title: (
        <>
          Total Votes
        </>
      ),
      dataIndex: "total_votes",
      key: "total_votes",
      width: 200,
    },

    {
      title: (
        <>
          External Incentives
        </>
      ),
      dataIndex: "bribe",
      key: "bribe",
      width: 200,
      render: (item) => (
        <>
          {item?.length > 0 ?
            item && item?.map((singleBribe, index) => {
              return <div className="endtime-badge mt-1" key={index}>{amountConversionWithComma(singleBribe?.amount, DOLLAR_DECIMALS)} {denomToSymbol(singleBribe?.denom)}</div>
            })
            : <div className="endtime-badge mt-1" >{"       "}</div>

          }

        </>
      ),
    },
    {
      title: (
        <>
          My Vote
        </>
      ),
      dataIndex: "my_vote",
      key: "my_vote",
      align: "center",
      width: 100,
    },
    {
      title: (
        <>
          Action
        </>
      ),
      dataIndex: "action",
      key: "action",
      align: "centre",
      width: 130,
    },
  ];

  const tableData =
    allProposalData && allProposalData.map((item, index) => {
      return {
        key: index,
        asset: (
          <>
            <div className="assets-withicon">
              <div className="assets-icon">
                <SvgIcon
                  name={iconNameFromDenom(
                    symbolToDenom(getIconFromPairName(pairVaultData[item?.extended_pair_id]))
                  )}
                />
              </div>
              {pairVaultData[item?.extended_pair_id]}
            </div>
          </>
        ),
        my_borrowed: (
          <>
            <div className="assets-withicon display-center">
              {myBorrowed[item?.extended_pair_id] ? amountConversionWithComma(myBorrowed[item?.extended_pair_id], DOLLAR_DECIMALS) : Number(0).toFixed(2)}
              {" "}{denomToSymbol("ucmst")}
            </div>
          </>
        ),
        total_borrowed:
          <div>
            {totalBorrowed[item?.extended_pair_id] ? amountConversionWithComma(
              totalBorrowed[item?.extended_pair_id], DOLLAR_DECIMALS
            ) : Number(0).toFixed(2)} {denomToSymbol("ucmst")}
          </div>,
        total_votes: <div >{item?.total_vote ? amountConversionWithComma(item?.total_vote, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR <div>{item?.total_vote ? calculateTotalVotes(amountConversion(item?.total_vote || 0, 6) || 0) : Number(0).toFixed(DOLLAR_DECIMALS)}%</div></div>,
        bribe: item?.bribe,
        my_vote: <div>{item?.my_vote ? amountConversion(item?.my_vote, DOLLAR_DECIMALS) : Number(0).toFixed(DOLLAR_DECIMALS)} veHARBOR</div>,
        action: <>
          <Button
            type="primary"
            className="btn-filled"
            size="sm"
            loading={index === btnLoading ? inProcess : false}
            onClick={() => handleVote(item?.extended_pair_id, index)}
            disabled={disableVoteBtn}
          >
            Vote
          </Button>
        </>,
      }
    })

  return (
    <>
      <div className="app-content-wrapper">
        <Row>
          <Col>
            <div className="totol-voting-main-container">
              <div className='d-flex total-voting-power-tooltip-box'>
                <div className="total-voting-container">
                  <div className="total-veHARBOR">
                    My Voting Power : <span className='fill-box'><span>{amountConversionWithComma(totalVotingPower, DOLLAR_DECIMALS)}</span> veHARBOR</span>
                  </div>
                </div>
                <TooltipIcon text={` Voting power will be calculated as per the last voting epoch date: ${calculteVotingStartTime()}`} />
              </div>
              <div>
                <Link to="/more"><Button className="back-btn" type="primary">Back</Button></Link>
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="vote-text-main-container mt-3">
              <div className="vote-text-container">
                {currentProposalAllData ? "Votes are due by" + calculteVotingTime() : "Voting for epoch proposal not active "}, when the next epoch begins. Your vote will allocate 100% of the veHARBOR voting power. Voters will earn External Incentives no matter when in the epoch they are added.
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="composite-card ">
              <div className="card-content">
                <Table
                  className="custom-table liquidation-table"
                  dataSource={tableData}
                  columns={columns}
                  loading={loading}
                  pagination={false}
                  scroll={{ x: "100%" }}
                  locale={{ emptyText: <NoDataIcon /> }}
                />
              </div>
            </div>

          </Col>
        </Row>
      </div>

    </>
  )
}

Vote.propTypes = {
  lang: PropTypes.string.isRequired,
  address: PropTypes.string,
  refreshBalance: PropTypes.number.isRequired,
};
const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
    refreshBalance: state.account.refreshBalance,
  };
};
const actionsToProps = {
  setBalanceRefresh,
};
export default connect(stateToProps, actionsToProps)(Vote);