import { Component, Input } from '@angular/core';
import { INFT } from 'src/app/shared/models/nft';

@Component({
  selector: 'nft-display',
  templateUrl: './nft.component.html',
  styleUrls: ['./nft.component.scss']
})
export class NftComponent {

  constructor(){

  }

  list(){
    
  }

  @Input() public nft!:INFT;

}
