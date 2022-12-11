import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DappBaseComponent, DappInjector, Web3Actions } from 'angular-web3';
import { Contract,utils } from 'ethers';

import { MessageService } from 'primeng/api';
import { FanToEarn } from 'src/assets/contracts/interfaces/FanToEarn';
import FanToEarnMetadata from 'src/assets/contracts/fan-to-earn_metadata.json';

export interface NFT {
  tokenId: number,
  cost:number,
  
}

@Component({
  selector: 'app-market-place',
  templateUrl: './market-place.component.html',
  styleUrls: ['./market-place.component.scss']
})
export class MarketPlaceComponent extends DappBaseComponent {
  readFanToEarn!: FanToEarn;
  fanToEarn!: FanToEarn;
  listedNFTs: Array<NFT> = [];

  constructor(
    dapp: DappInjector,
    store: Store,
    public formBuilder: FormBuilder,
    public router: Router,
    public messageService: MessageService
  ) {
    super(dapp, store);
     this.store.dispatch(Web3Actions.chainBusy({ status: true }));
     this.instantiateReadContract();
  }

  async getState(){
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));




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


    this.getState();
  }

  override async hookContractConnected(): Promise<void> {
    let signer = this.dapp.signer!;

       this.fanToEarn = new Contract(
      FanToEarnMetadata.address,
      FanToEarnMetadata.abi,
      signer
    ) as FanToEarn;

 

    this.getState();
  }

}
