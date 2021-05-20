import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'src/app/auth.guard';
import { BookmarksPageModule } from 'src/app/bookmarks/bookmarks.module';
import { LibraryPageModule } from 'src/app/library/library.module';
import { LoginPageModule } from 'src/app/login/login.module';
import { ReaderPageModule } from 'src/app/reader/reader.module';
import { SettingsPageModule } from 'src/app/settings/settings.module';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: 'library'
}, {
  canActivate: [ AuthGuard ],
  loadChildren: (): Promise<LibraryPageModule> => import('./library/library.module').then(m => m.LibraryPageModule),
  path: 'library'
}, {
  canActivate: [ AuthGuard ],
  loadChildren: (): Promise<ReaderPageModule> => import('./reader/reader.module').then(m => m.ReaderPageModule),
  path: 'read/:id'
}, {
  canActivate: [ AuthGuard ],
  loadChildren: (): Promise<BookmarksPageModule> => import('./bookmarks/bookmarks.module').then(m => m.BookmarksPageModule),
  path: 'bookmarks'
}, {
  canActivate: [ AuthGuard ],
  loadChildren: (): Promise<SettingsPageModule> => import('./settings/settings.module').then(m => m.SettingsPageModule),
  path: 'settings'
}, {
  loadChildren: (): Promise<LoginPageModule> => import('./login/login.module').then(m => m.LoginPageModule),
  path: 'login'
}];

@NgModule({
  exports: [ RouterModule ],
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ]
})
export class AppRoutingModule {}
