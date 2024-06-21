import { UsuarioService } from 'src/app/services/cadastro/usuario/usuario.service';
import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private usuarioService: UsuarioService, private router: Router ) { }

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      if (this.usuarioService.isLoggedIn()) {
        return true;
      } else {
        this.router.navigate(['login']);
        return false;
      }
    }
}
