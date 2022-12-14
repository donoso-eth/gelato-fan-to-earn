import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AngularContract, DappInjector, DappBaseComponent, Web3Actions } from 'angular-web3';
import { providers, utils } from 'ethers';
import { doSignerTransaction } from 'src/app/dapp-injector/classes/transactor';
import { FanToEarn } from 'src/assets/contracts/interfaces/FanToEarn';

@Component({
  selector: 'fan-to-earn',
  templateUrl: './fan-to-earn.component.html',
  styles: [
    `
      .blockchain_is_busy {
        animation: spinHorizontal 2s infinite linear;
        filter: hue-rotate(220deg);
      }
      @keyframes spinHorizontal {
        0% {
          transform: rotate(0deg);
        }
        50% {
          transform: rotate(360deg);
        }
        100% {
          transform: rotate(0deg);
        }
      }
    `,
  ],
})
export class FanToEarnComponent
  extends DappBaseComponent
  implements AfterViewInit
{
  nftType = [
    { name: 'Private Sale',  id: 0 },
    { name: '50% Discount',  id: 1 },
    { name: 'Premiun BackStage',  id: 2 },
  ];
  
  nftTypeCtrl: FormControl = new FormControl('',Validators.required)

  fanToEarn!: FanToEarn;



  ownedTokens = 0;
  tokensListing:Array<any> = [];

  constructor(store: Store, dapp: DappInjector) {
    super(dapp, store);
    this.nftTypeCtrl.setValue({ name: 'Private Sale',   id: 0 })
  }

  async getState() {
    this.tokensListing = [];

    this.ownedTokens = +(await this.fanToEarn.balanceOf(
      this.dapp.signerAddress!
    ))!.toString();
     
    for(let i=1;i<= this.ownedTokens;i++){
      let tokenId = +(await this.fanToEarn.tokenOfOwnerByIndex(this.dapp.signerAddress!,i-1)).toString();
      let tokenObject = await this.fanToEarn.nftLending(tokenId);
      this.tokensListing.push(tokenObject);
    
    }

    console.log(this.tokensListing);
    this.store.dispatch(Web3Actions.chainBusy({ status: false }));
  }

  override async hookContractConnected(): Promise<void> {
    this.fanToEarn = this.dapp.defaultContract?.instance!;

    console.log('connected');
    await this.getState();
  }

  async mint() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    this.store.dispatch(Web3Actions.chainBusyWithMessage({message: {body:'Minting your NFT ', header:'Please Wait'}}))
 
    let abiCoder = new utils.AbiCoder();
    let payload = abiCoder.encode(
      ['string'],
      [this.nftTypeCtrl.value.name]
    );
    await doSignerTransaction(
      this.fanToEarn.safeMint(this.dapp.signerAddress!, payload)!
    );
 
    this.getState()
  }
}
