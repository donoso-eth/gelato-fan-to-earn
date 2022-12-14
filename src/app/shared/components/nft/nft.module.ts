import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NftComponent } from './nft/nft.component';
import { ButtonModule } from 'primeng/button';



@NgModule({
  declarations: [
    NftComponent
  ],
  imports: [
    CommonModule,
    ButtonModule
  ],
  exports: [
    NftComponent
  ]
})
export class NftModule { }
