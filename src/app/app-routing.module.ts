import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
  {
    path: 'fan-to-earn',
    loadChildren: () =>
      import('./fan-to-earn/fan-to-earn.module').then(
        (m) => m.FanToEarnModule
      ),
  },
  { path: 'marketplace', loadChildren: () => import('./market-place/market-place.module').then(m => m.MarketPlaceModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
