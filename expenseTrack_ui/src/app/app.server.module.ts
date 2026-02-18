import { NgModule } from '@angular/core';
import { AppModule } from './app.module';
import { App } from './app';

@NgModule({
  imports: [AppModule],
  bootstrap: [App],
})
export class AppServerModule {}
