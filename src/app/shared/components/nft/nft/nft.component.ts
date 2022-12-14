import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { DappBaseComponent, DappInjector, Web3Actions } from 'angular-web3';
import { utils } from 'ethers';
import { doSignerTransaction } from 'src/app/dapp-injector/classes/transactor';
import { INFT } from 'src/app/shared/models/nft';
import { FanToEarn } from 'src/assets/contracts/interfaces/FanToEarn';

@Component({
  selector: 'nft-display',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NftComponent extends DappBaseComponent implements OnChanges {

  showListDialog = false;

  name:string = '';
  status!: 'AVAILABLE' | 'LISTED' | 'BORROWED';
  cost!: string;

  listAmountCtrl = new FormControl(0,Validators.required)

  fanToEarn!: FanToEarn;


  constructor(dapp:DappInjector, store:Store){
    super(dapp,store)

  }

  @Input() public nft!:INFT;
  @Output() public refreshEvent:EventEmitter<any> = new EventEmitter()
  @Input() public route!: 'MARKETPLACE' | 'ACCOUNT';

  @Output() public borrowEvent:EventEmitter<INFT> = new EventEmitter()

  ngOnChanges(): void {
    this.showListDialog = false;

    this.fanToEarn = this.dapp.defaultContract?.instance as FanToEarn;

    let abiCoder = new utils.AbiCoder();
    console.log(this.nft)
    let [payload] = abiCoder.decode(
      ['string'],
      this.nft.name
    );

    this.name = payload;

    this.status = this.nft.status == 0 ? 'AVAILABLE' : this.nft.status == 1 ? 'LISTED' : 'BORROWED';

    this.cost = utils.formatEther(this.nft.cost)

  }

  async removeList() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Removing your NFT ', header:'Please Wait'}}))
    await doSignerTransaction(this.fanToEarn.removeListing(this.nft.id));
    this.refreshEvent.emit();
  }

  async doList(){

    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Listing your NFT ', header:'Please Wait'}}))

    let cost =  utils.parseEther(this.listAmountCtrl.value?.toString()!);

    await doSignerTransaction(this.fanToEarn.listToken(this.nft.id,cost));

    this.showListDialog = false;

    this.refreshEvent.emit();
 
  }

  list(){
    this.showListDialog = true;
  }



  borrow() {
    this.borrowEvent.emit(this.nft)
  }


}
