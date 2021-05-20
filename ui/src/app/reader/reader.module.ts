import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ReaderPage } from 'src/app/reader/reader.page';
import { SecureModule } from 'src/app/secure/secure.module';

@NgModule({
  declarations: [
    ReaderPage
  ],
  entryComponents: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{
      component: ReaderPage, path: ''
    }]),
    SecureModule
  ]
})
export class ReaderPageModule {}
