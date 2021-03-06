import { connect } from 'react-redux'
import { compose } from 'redux'
import { withRouter } from 'react-router-dom'
import {
  toggleAccountMenu,
  showAccountDetail,
  hideSidebar,
  lockTronmask,
  hideWarning,
} from '../../../store/actions'
import {
  getAddressConnectedDomainMap,
  getTronMaskAccountsOrdered,
  getTronMaskKeyrings,
  getOriginOfCurrentTab,
  getSelectedAddress,
} from '../../../selectors'
import AccountMenu from './account-menu.component'

/**
 * The min amount of accounts to show search field
 */
const SHOW_SEARCH_ACCOUNTS_MIN_COUNT = 5

function mapStateToProps (state) {
  const { tronmask: { isAccountMenuOpen } } = state
  const accounts = getTronMaskAccountsOrdered(state)
  const origin = getOriginOfCurrentTab(state)
  const selectedAddress = getSelectedAddress(state)

  return {
    isAccountMenuOpen,
    addressConnectedDomainMap: getAddressConnectedDomainMap(state),
    originOfCurrentTab: origin,
    selectedAddress,
    keyrings: getTronMaskKeyrings(state),
    accounts,
    shouldShowAccountsSearch: accounts.length >= SHOW_SEARCH_ACCOUNTS_MIN_COUNT,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    toggleAccountMenu: () => dispatch(toggleAccountMenu()),
    showAccountDetail: (address) => {
      dispatch(showAccountDetail(address))
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
    lockTronmask: () => {
      dispatch(lockTronmask())
      dispatch(hideWarning())
      dispatch(hideSidebar())
      dispatch(toggleAccountMenu())
    },
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AccountMenu)
