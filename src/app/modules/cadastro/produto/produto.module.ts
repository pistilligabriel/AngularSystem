import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { produtoRoute } from './produto.routing';
import { ProdutoComponent } from './produto.component';
import { GrupoProdutoComponent } from '../grupo-produto/page/grupo-produto.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(produtoRoute)
  ],
  declarations: [
    ProdutoComponent
  ],
  providers: [
    GrupoProdutoComponent,
    MessageService,
    CookieService,
    ConfirmationService
  ],
})
export class ProdutoModule { }
