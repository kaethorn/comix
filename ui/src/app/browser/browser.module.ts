import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { SecureModule } from '../secure/secure.module';
import { BrowserPage } from './browser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SecureModule,
    RouterModule.forChild([{
      path: '',
      component: BrowserPage
    }])
  ],
  declarations: [
    BrowserPage
  ],
  entryComponents: [
  ]
})
export class BrowserPageModule {}
