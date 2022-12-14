import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { pipe, filter, map } from 'rxjs';
import { Web3State } from './models';
import * as reducer from './reducer';

//export const selectState = (state: Web3State) => state;

export const selectWeb3State = createFeatureSelector<Web3State>(
  reducer.web3FeatureKey
);

//

const selectState  = createSelector(
  selectWeb3State,
  (state: Web3State) => state
);

const chainStatus = createSelector(
  selectWeb3State,
  (state: Web3State) => state.chainStatus
);

const refreshAction = createSelector(
  selectWeb3State,
  (state: Web3State) => state.refreshBalance
);


const hookChanIsLoading = pipe(
  select(chainStatus),
  filter((val) => val == 'loading')
);


const hookFailToconnect = pipe(
  select(chainStatus),
  filter((val) => val == 'fail-to-connect-network')
);


const hookWalletNotConnected = pipe(
  select(chainStatus),
  filter((val) => val == 'wallet-not-connected')
);


const hookContractConnected = pipe(
  select(chainStatus),
  filter((val) => val == 'wallet-connected')
);





const hookForceDisconnect = pipe(
  select(chainStatus),
  filter((val) => val == 'force-disconnect')
);


const hookReadContractConnected= pipe(
  select(selectWeb3State),
  map(map=> map.readContactReady),
  filter((val) => val == true)
);


const hookRefreshBalances = pipe(
  select(refreshAction),
  filter((val) => val == true)
);



const busyNetwork = createSelector(
  selectWeb3State,
  (state: Web3State) => state.busyNetwork
);


const busyNetworkWithMessage = createSelector(
  selectWeb3State,
  (state: Web3State) => (state.busyMessage)
);



const selectSignerNetwork = createSelector(
  selectWeb3State,
  (state: Web3State) => state.signerNetwork
);




const selectWalletBalance= pipe(
  select(selectState),
  map(map=> map.walletBalance)
);

const selectDollarExchange= pipe(
  select(selectState),
  filter((val) => val.etherToDollar !== 0),
  map(map=> map.etherToDollar)
);

export const web3Selectors = {

  chainStatus,
  hookChanIsLoading,
  hookFailToconnect,
  hookWalletNotConnected,
  hookContractConnected,
  hookReadContractConnected,
  hookForceDisconnect,
  hookRefreshBalances,

  busyNetwork,
  busyNetworkWithMessage,
  
  selectSignerNetwork,
  selectWalletBalance,
  selectDollarExchange
};
