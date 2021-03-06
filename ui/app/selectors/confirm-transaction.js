import { createSelector } from 'reselect'
import txHelper from '../../lib/tx-helper'
import { calcTokenAmount } from '../helpers/utils/token-util'
import {
  roundExponential,
  getValueFromWeiHex,
  getHexGasTotal,
  getTransactionFee,
  addFiat,
  addEth,
} from '../helpers/utils/confirm-tx.util'
import {
  sumHexes,
} from '../helpers/utils/transactions.util'
import { getNativeCurrency } from '.'

const unapprovedTxsSelector = (state) => state.tronmask.unapprovedTxs
const unapprovedMsgsSelector = (state) => state.tronmask.unapprovedMsgs
const unapprovedPersonalMsgsSelector = (state) => state.tronmask.unapprovedPersonalMsgs
const unapprovedDecryptMsgsSelector = (state) => state.tronmask.unapprovedDecryptMsgs
const unapprovedEncryptionPublicKeyMsgsSelector = (state) => state.tronmask.unapprovedEncryptionPublicKeyMsgs
const unapprovedTypedMessagesSelector = (state) => state.tronmask.unapprovedTypedMessages
const networkSelector = (state) => state.tronmask.network

export const unconfirmedTransactionsListSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  networkSelector,
  (
    unapprovedTxs = {},
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
    network,
  ) => txHelper(
    unapprovedTxs,
    unapprovedMsgs,
    unapprovedPersonalMsgs,
    unapprovedDecryptMsgs,
    unapprovedEncryptionPublicKeyMsgs,
    unapprovedTypedMessages,
    network,
  ) || [],
)

export const unconfirmedTransactionsHashSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgsSelector,
  unapprovedPersonalMsgsSelector,
  unapprovedDecryptMsgsSelector,
  unapprovedEncryptionPublicKeyMsgsSelector,
  unapprovedTypedMessagesSelector,
  networkSelector,
  (
    unapprovedTxs = {},
    unapprovedMsgs = {},
    unapprovedPersonalMsgs = {},
    unapprovedDecryptMsgs = {},
    unapprovedEncryptionPublicKeyMsgs = {},
    unapprovedTypedMessages = {},
    network,
  ) => {
    const filteredUnapprovedTxs = Object.keys(unapprovedTxs).reduce((acc, address) => {
      const { tronmaskNetworkId } = unapprovedTxs[address]
      const transactions = { ...acc }

      if (tronmaskNetworkId === network) {
        transactions[address] = unapprovedTxs[address]
      }

      return transactions
    }, {})

    return {
      ...filteredUnapprovedTxs,
      ...unapprovedMsgs,
      ...unapprovedPersonalMsgs,
      ...unapprovedDecryptMsgs,
      ...unapprovedEncryptionPublicKeyMsgs,
      ...unapprovedTypedMessages,
    }
  },
)

const unapprovedMsgCountSelector = (state) => state.tronmask.unapprovedMsgCount
const unapprovedPersonalMsgCountSelector = (state) => state.tronmask.unapprovedPersonalMsgCount
const unapprovedDecryptMsgCountSelector = (state) => state.tronmask.unapprovedDecryptMsgCount
const unapprovedEncryptionPublicKeyMsgCountSelector = (state) => state.tronmask.unapprovedEncryptionPublicKeyMsgCount
const unapprovedTypedMessagesCountSelector = (state) => state.tronmask.unapprovedTypedMessagesCount

export const unconfirmedTransactionsCountSelector = createSelector(
  unapprovedTxsSelector,
  unapprovedMsgCountSelector,
  unapprovedPersonalMsgCountSelector,
  unapprovedDecryptMsgCountSelector,
  unapprovedEncryptionPublicKeyMsgCountSelector,
  unapprovedTypedMessagesCountSelector,
  networkSelector,
  (
    unapprovedTxs = {},
    unapprovedMsgCount = 0,
    unapprovedPersonalMsgCount = 0,
    unapprovedDecryptMsgCount = 0,
    unapprovedEncryptionPublicKeyMsgCount = 0,
    unapprovedTypedMessagesCount = 0,
    network,
  ) => {
    const filteredUnapprovedTxIds = Object.keys(unapprovedTxs).filter((txId) => {
      const { tronmaskNetworkId } = unapprovedTxs[txId]
      return tronmaskNetworkId === network
    })

    return filteredUnapprovedTxIds.length + unapprovedTypedMessagesCount + unapprovedMsgCount +
      unapprovedPersonalMsgCount + unapprovedDecryptMsgCount + unapprovedEncryptionPublicKeyMsgCount
  },
)

export const currentCurrencySelector = (state) => state.tronmask.currentCurrency
export const conversionRateSelector = (state) => state.tronmask.conversionRate

export const txDataSelector = (state) => state.confirmTransaction.txData
const tokenDataSelector = (state) => state.confirmTransaction.tokenData
const tokenPropsSelector = (state) => state.confirmTransaction.tokenProps

const contractExchangeRatesSelector = (state) => state.tronmask.contractExchangeRates

const tokenDecimalsSelector = createSelector(
  tokenPropsSelector,
  (tokenProps) => tokenProps && tokenProps.tokenDecimals,
)

const tokenDataArgsSelector = createSelector(
  tokenDataSelector,
  (tokenData) => (tokenData && tokenData.args) || [],
)

const txParamsSelector = createSelector(
  txDataSelector,
  (txData) => (txData && txData.txParams) || {},
)

export const tokenAddressSelector = createSelector(
  txParamsSelector,
  (txParams) => txParams && txParams.to,
)

const TOKEN_PARAM_SPENDER = '_spender'
const TOKEN_PARAM_TO = '_to'
const TOKEN_PARAM_VALUE = '_value'

export const tokenAmountAndToAddressSelector = createSelector(
  tokenDataArgsSelector,
  tokenDecimalsSelector,
  (args, tokenDecimals) => {
    let toAddress = ''
    let tokenAmount = 0

    if (args && args.length) {
      const toParam = args[TOKEN_PARAM_TO]
      const valueParam = args[TOKEN_PARAM_VALUE]
      toAddress = toParam || args[0]
      const value = valueParam ? valueParam.toNumber() : args[1].toNumber()

      if (tokenDecimals) {
        tokenAmount = calcTokenAmount(value, tokenDecimals).toNumber()
      }

      tokenAmount = roundExponential(tokenAmount)
    }

    return {
      toAddress,
      tokenAmount,
    }
  },
)

export const approveTokenAmountAndToAddressSelector = createSelector(
  tokenDataArgsSelector,
  tokenDecimalsSelector,
  (args, tokenDecimals) => {
    let toAddress = ''
    let tokenAmount = 0

    if (args && args.length) {
      toAddress = args[TOKEN_PARAM_SPENDER]
      const value = args[TOKEN_PARAM_VALUE].toNumber()

      if (tokenDecimals) {
        tokenAmount = calcTokenAmount(value, tokenDecimals).toNumber()
      }

      tokenAmount = roundExponential(tokenAmount)
    }

    return {
      toAddress,
      tokenAmount,
    }
  },
)

export const sendTokenTokenAmountAndToAddressSelector = createSelector(
  tokenDataArgsSelector,
  tokenDecimalsSelector,
  (args, tokenDecimals) => {
    let toAddress = ''
    let tokenAmount = 0

    if (args && args.length) {
      toAddress = args[TOKEN_PARAM_TO]
      let value = args[TOKEN_PARAM_VALUE].toNumber()

      if (tokenDecimals) {
        value = calcTokenAmount(value, tokenDecimals).toNumber()
      }

      tokenAmount = roundExponential(value)
    }

    return {
      toAddress,
      tokenAmount,
    }
  },
)

export const contractExchangeRateSelector = createSelector(
  contractExchangeRatesSelector,
  tokenAddressSelector,
  (contractExchangeRates, tokenAddress) => contractExchangeRates[tokenAddress],
)

export const transactionFeeSelector = function (state, txData) {
  const currentCurrency = currentCurrencySelector(state)
  const conversionRate = conversionRateSelector(state)
  const nativeCurrency = getNativeCurrency(state)

  const { txParams: { value = '0x0', gas: gasLimit = '0x0', gasPrice = '0x0' } = {} } = txData

  const fiatTransactionAmount = getValueFromWeiHex({
    value, fromCurrency: nativeCurrency, toCurrency: currentCurrency, conversionRate, numberOfDecimals: 2,
  })
  const ethTransactionAmount = getValueFromWeiHex({
    value, fromCurrency: nativeCurrency, toCurrency: nativeCurrency, conversionRate, numberOfDecimals: 6,
  })

  // const hexTransactionFee = getHexGasTotal({ gasLimit, gasPrice })
  // @TODO(tron) calculate TRX to burn based on energy?
  const hexTransactionFee = '0x0'

  const fiatTransactionFee = getTransactionFee({
    value: hexTransactionFee,
    fromCurrency: nativeCurrency,
    toCurrency: currentCurrency,
    numberOfDecimals: 2,
    conversionRate,
  })
  const ethTransactionFee = getTransactionFee({
    value: hexTransactionFee,
    fromCurrency: nativeCurrency,
    toCurrency: nativeCurrency,
    numberOfDecimals: 6,
    conversionRate,
  })

  const fiatTransactionTotal = addFiat(fiatTransactionFee, fiatTransactionAmount)
  const ethTransactionTotal = addEth(ethTransactionFee, ethTransactionAmount)
  const hexTransactionTotal = sumHexes(value, hexTransactionFee)

  return {
    hexTransactionAmount: value,
    fiatTransactionAmount,
    ethTransactionAmount,
    hexTransactionFee,
    fiatTransactionFee,
    ethTransactionFee,
    fiatTransactionTotal,
    ethTransactionTotal,
    hexTransactionTotal,
  }
}
