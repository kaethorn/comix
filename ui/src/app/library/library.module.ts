import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { EditPage } from 'src/app/library/edit/edit.page';
import { IssueActionsComponent } from 'src/app/library/issues/issue-actions/issue-actions.component';
import { IssuesPage } from 'src/app/library/issues/issues.page';
import { PublishersPage } from 'src/app/library/publishers/publishers.page';
import { SeriesPage } from 'src/app/library/series/series.page';
import { CoversPage } from 'src/app/library/volumes/covers/covers.page';
import { VolumeActionsComponent } from 'src/app/library/volumes/volume-actions/volume-actions.component';
import { VolumesPage } from 'src/app/library/volumes/volumes.page';

@NgModule({
  declarations: [
    CoversPage,
    EditPage,
    IssueActionsComponent,
    IssuesPage,
    PublishersPage,
    SeriesPage,
    VolumeActionsComponent,
    VolumesPage
  ],
  entryComponents: [
    VolumeActionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild([{
      children: [{
        component: PublishersPage, path: 'publishers'
      }, {
        component: SeriesPage, path: 'publishers/:publisher/series'
      }, {
        component: VolumesPage, path: 'publishers/:publisher/series/:series/volumes'
      }, {
        component: IssuesPage,
        path: 'publishers/:publisher/series/:series/volumes/:volume/issues'
      }, {
        component: EditPage,
        path: 'publishers/:publisher/series/:series/volumes/:volume/issues/:id/edit'
      }, {
        component: CoversPage,
        path: 'publishers/:publisher/series/:series/volumes/:volume/covers'
      }, {
        path: '',
        pathMatch: 'full',
        redirectTo: '/library/publishers'
      }],
      path: ''
    }])
  ]
})
export class LibraryPageModule {}
