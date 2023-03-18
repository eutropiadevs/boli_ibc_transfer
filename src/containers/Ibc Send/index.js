import React from 'react'
import ChainModal from './chaninModal'
import { maginTxChain } from './magicTxChain'
import './index.scss'

const IbcTransfer = () => {
  return (
    <>
      <div className="ibc_send_main_container">
        <div className="ibc_send_container">
          <div className="box_container">
            {maginTxChain && maginTxChain?.map((item) => {
              return (
                <ChainModal item={item} />
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default IbcTransfer