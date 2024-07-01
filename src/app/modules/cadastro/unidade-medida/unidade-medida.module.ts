import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { GrupoProdutoComponent } from '../grupo-produto/page/grupo-produto.component';
import { unidadeMedidaRoute } from './unidade-medida.routing';
import { UnidadeMedidaComponent } from './unidade-medida.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(unidadeMedidaRoute)
  ],
  declarations: [
    UnidadeMedidaComponent
  ],
  providers: [
    GrupoProdutoComponent,
    MessageService,
    CookieService,
    ConfirmationService
  ],
})
export class UnidadeMedidaModule { }
