import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DappBaseComponent, DappInjector, Web3Actions } from 'angular-web3';
import { BigNumber, Contract, utils } from 'ethers';

import { MessageService } from 'primeng/api';
import { FanToEarn } from 'src/assets/contracts/interfaces/FanToEarn';
import FanToEarnMetadata from 'src/assets/contracts/fan-to-earn_metadata.json';
import { INFT } from 'src/app/shared/models/nft';
import { doSignerTransaction } from 'src/app/dapp-injector/classes/transactor';
import { filter } from 'rxjs';

@Component({
  selector: 'app-market-place',
  templateUrl: './market-place.component.html',
  styleUrls: ['./market-place.component.scss'],
})
export class MarketPlaceComponent extends DappBaseComponent implements OnInit{
  readFanToEarn!: FanToEarn;
  fanToEarn!: FanToEarn;
  listedNFTs: Array<any> = [];
  connected: boolean = false;

  borrowAmountCtrl = new FormControl(0,Validators.required)
  showBorrowDialog: boolean = false;;

  toBorrowNFT!:INFT;

  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router,
    public messageService: MessageService
  ) {
    super(dapp, store);
    //this.store.dispatch(Web3Actions.chainBusy({ status: true }));


    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event) => {
      console.log('console')
      this.initUi();
    });


  }
  utils = utils;  

  ngOnInit(): void {
   // this.initUi();
  }

async initUi(){
  await this.instantiateReadContract();
  this.getState();
}



  async getState() {

   
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.listedNFTs = [];

    let nrListed = +(await this.readFanToEarn.nrNftsListed()).toString();

    for (let i = 0; i < nrListed; i++) {
      let tokenId = +(await this.readFanToEarn.nftsListed(i)).toString();
      let tokenObject = await this.readFanToEarn.nftLending(tokenId);
      if (this.listedNFTs.filter(fil=> fil.id == tokenId).length == 0){
      this.listedNFTs.push(tokenObject);
      }
    }

    this.store.dispatch(Web3Actions.chainBusy({ status: false }));
  }

  async instantiateReadContract() {
    let provider = await this.dapp.providerInitialization();
    this.readFanToEarn = new Contract(
      FanToEarnMetadata.address,
      FanToEarnMetadata.abi,
      provider
    ) as FanToEarn;

    //   this.readFanToEarn.on("ProposalCreated", (taskId) => {
    //     console.log(taskId);
    // });

   
  }

  async borrow(token:INFT) {
    this.toBorrowNFT = token;
    if (this.connected == true){
    console.log(token.id)} else {
      alert("Please connect your Wallet")
      return
    }

 

    if (token.owner.toLowerCase() == this.dapp.signerAddress?.toLowerCase()) {
      alert("The Nft is already yours")
      return;
    }


    this.showBorrowDialog = true;
  }

  async doBorrow(){
    
    if (this.borrowAmountCtrl.invalid) {
      alert("please set the lending duration")
      return;
    }

    
    try {
      
    this.showBorrowDialog = false;
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Borrowing your NFT ', header:'Please Wait'}}))
    
    let value = BigNumber.from(this.toBorrowNFT.cost).mul(this.borrowAmountCtrl.value!); 

    await doSignerTransaction(this.fanToEarn.borrowNft(this.toBorrowNFT.id,this.borrowAmountCtrl.value!,{value}));

    this.getState();
   


  } catch (error) {
    console.log(error);
    alert("Error")
    this.getState();
    this.showBorrowDialog = false;
  } 


  }

  override async hookForceDisconnect(): Promise<void> {
    this.connected = false;
    this.initUi()
    console.log('disconnecting')
  }

  override async hookFailedtoConnectNetwork(): Promise<void> {
    this.connected = false;
    this.initUi()
  }

  override async hookContractConnected(): Promise<void> {
    let signer = this.dapp.signer!;

    this.fanToEarn = new Contract(
      FanToEarnMetadata.address,
      FanToEarnMetadata.abi,
      signer
    ) as FanToEarn;
    this.initUi()
    this.connected = true;
 
  }
}
