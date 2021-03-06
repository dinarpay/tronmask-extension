import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import {
  getNetworkIdentifier,
  hasPermissionRequests,
  getPreferences,
  submittedPendingTransactionsSelector,
} from '../../selectors'
import {
  hideSidebar,
  lockTronmask,
  setCurrentCurrency,
  setLastActiveTime,
  setMouseUserState,
} from '../../store/actions'
import { pageChanged } from '../../ducks/history/history'
import Routes from './routes.component'

function mapStateToProps (state) {
  const { appState } = state
  const {
    sidebar,
    alertOpen,
    alertMessage,
    isLoading,
    loadingMessage,
  } = appState
  const { autoLockTimeLimit = 0 } = getPreferences(state)

  return {
    sidebar,
    alertOpen,
    alertMessage,
    textDirection: state.tronmask.textDirection,
    isLoading,
    loadingMessage,
    isUnlocked: state.tronmask.isUnlocked,
    submittedPendingTransactions: submittedPendingTransactionsSelector(state),
    network: state.tronmask.network,
    provider: state.tronmask.provider,
    frequentRpcListDetail: state.tronmask.frequentRpcListDetail || [],
    currentCurrency: state.tronmask.currentCurrency,
    isMouseUser: state.appState.isMouseUser,
    providerId: getNetworkIdentifier(state),
    autoLockTimeLimit,
    hasPermissionsRequests: hasPermissionRequests(state),
  }
}

function mapDispatchToProps (dispatch) {
  return {
    lockTronMask: () => dispatch(lockTronmask(false)),
    hideSidebar: () => dispatch(hideSidebar()),
    setCurrentCurrencyToUSD: () => dispatch(setCurrentCurrency('usd')),
    setMouseUserState: (isMouseUser) => dispatch(setMouseUserState(isMouseUser)),
    setLastActiveTime: () => dispatch(setLastActiveTime()),
    pageChanged: (path) => dispatch(pageChanged(path)),
  }
}

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(Routes)
