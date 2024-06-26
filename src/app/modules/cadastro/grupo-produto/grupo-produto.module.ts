import { NgModule } from '@angular/core';
import { GrupoProdutoComponent } from './page/grupo-produto.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from 'src/app/libraries/primeng.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule } from '@angular/router';
import { grupoProdutoRoutes } from './grupo-produto.routing';
import { ConfirmationService, MessageService } from 'primeng/api';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PrimengModule,
    SharedModule,
    RouterModule.forChild(grupoProdutoRoutes)
  ],
  declarations: [GrupoProdutoComponent],
  providers: [
    MessageService,
    ConfirmationService
  ],
})
export class GrupoProdutoModule { }
