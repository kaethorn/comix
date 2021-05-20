import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { BookmarkActionsComponent } from 'src/app/bookmarks/bookmark-actions/bookmark-actions.component';
import { BookmarksPage } from 'src/app/bookmarks/bookmarks.page';
import { SecureModule } from 'src/app/secure/secure.module';

@NgModule({
  declarations: [
    BookmarksPage,
    BookmarkActionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{
      component: BookmarksPage, path: ''
    }]),
    SecureModule
  ]
})
export class BookmarksPageModule {}
