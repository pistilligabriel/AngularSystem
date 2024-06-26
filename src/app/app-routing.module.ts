import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './modules/page-not-found/page-not-found.component';
import { LoginComponent } from './modules/login/login.component';
import { AuthGuardService } from './guards/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    loadChildren: () =>
      import('./modules/home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'registration-user',
  //   loadChildren: () =>
  //     import('./modules/registration/user/registration-user.module').then(
  //       (m) => m.RegistrationUserModule
  //     ),
  //   canActivate: [AuthGuardService],
  // },
  {
    path: 'usuario',
    loadChildren: () =>
      import('./modules/cadastro/usuario/usuario.module').then(
        (m) => m.UsuarioModule
      ),
    canActivate: [AuthGuardService],
  },
  {
    path: 'cliente',
    loadChildren: () =>
      import('./modules/cadastro/cliente/cliente.module').then(
        (m) => m.ClienteModule
      ),
    canActivate: [AuthGuardService],
  },
  {
    path: 'produto',
    loadChildren: () =>
      import('./modules/cadastro/produto/produto.module').then(
        (m) => m.ProdutoModule
      ),
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'registration-unitMeasure',
  //   loadChildren: () =>
  //     import(
  //       './modules/registration/unitMeasure/registration-unitMeasure.module'
  //     ).then((m) => m.RegistrationUnitMeasureModule),
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'registration/group/member',
  //   loadChildren: () =>
  //     import(
  //       './modules/registration/group/member/registration-group-member.module'
  //     ).then((m) => m.RegistrationGroupMemberModule),
  //   canActivate: [AuthGuardService],
  // },
  {
    path: 'grupo-produto',
    loadChildren: () =>
      import(
        './modules/cadastro/grupo-produto/grupo-produto.module'
      ).then((m) => m.GrupoProdutoModule),
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'registration/group/user',
  //   loadChildren: () =>
  //     import(
  //       './modules/registration/group/user/registration-group-user.module'
  //     ).then((m) => m.RegistrationGroupUserModule),
  //   canActivate: [AuthGuardService],
  // },

  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
