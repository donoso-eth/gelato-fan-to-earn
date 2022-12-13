import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftComponent } from './nft/nft.component';



@NgModule({
  declarations: [
    NftComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NftComponent
  ]
})
export class NftModule { }
