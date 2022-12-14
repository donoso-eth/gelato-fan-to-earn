import {
  Action,
  createReducer,
  on
} from '@ngrx/store';
import * as web3Actions from './actions';
import { Web3State } from './models';



export const initialState: Web3State = {
  chainStatus:'loading',
  busyNetwork:true,
  busyMessage: { header:'', body:''},
  signerNetwork:'',
  readContactReady:false,
  etherToDollar:0,
  walletBalance:0,
  refreshBalance:false,
};


export const web3FeatureKey = 'web3';

const web3dReducer = createReducer(
  initialState,
  on(web3Actions.Web3Actions.chainStatus, (state,{status}) => ({ ...state,chainStatus:status})),
  on(web3Actions.Web3Actions.chainBusy, (state,{status}) => ({ ...state, busyNetwork:status})),
  on(web3Actions.Web3Actions.chainBusyWithMessage, (state,{message}) => ({ ...state, busyMessage:message})), 
  on(web3Actions.Web3Actions.disconnectChain, (state) => ({ ...state,chainStatus:'force-disconnect'})),

  on(web3Actions.Web3Actions.refreshBalances, (state,{refreshBalance}) => ({ ...state,refreshBalance:refreshBalance })),

  on(web3Actions.Web3Actions.setSignerNetwork, (state,{network}) => ({ ...state, signerNetwork:network})),

  on(web3Actions.Web3Actions.updateWalletBalance, (state,{walletBalance}) => ({ ...state, walletBalance})),
  on(web3Actions.Web3Actions.setDollarExhange, (state,{exchange}) => ({ ...state, etherToDollar:exchange})),

);
export function we3ReducerFunction(state: Web3State | undefined, action: Action) {
  return web3dReducer(state, action);
}


