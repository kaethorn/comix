import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { SecurePipe } from 'src/app/secure/secure.pipe';

@NgModule({
  declarations: [
    SecurePipe
  ],
  exports: [
    SecurePipe
  ],
  imports: [
    HttpClientModule
  ]
})
export class SecureModule {}
