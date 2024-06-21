import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { AuthRequest } from 'src/app/models/interfaces/usuario/auth/AuthRequest';
import { AuthResponse } from 'src/app/models/interfaces/usuario/auth/AuthResponse';
import { CookieService } from 'ngx-cookie-service';
import { Usuarios } from 'src/app/models/interfaces/usuario/response/UsuariosResponse';
import { AdicionarUsuario } from 'src/app/models/interfaces/usuario/AdicionarUsuario';
import { EditarUsuario } from 'src/app/models/interfaces/usuario/EditarUsuario';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private API_URL = environment.apiUrl;
  private JWT_TOKEN = this.cookie.get('token');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.JWT_TOKEN}`,
    }),
  };

  constructor(private http: HttpClient, private cookie: CookieService) {}

  // signupUser(usuario: SignupUserRequest): Observable<string> {
  //   return this.http.post<string>(`${this.API_URL}usuarios`, usuario);
  // }

  loginUser(usuario: AuthRequest): Observable<AuthResponse> {
    console.log(usuario);
    return this.http.post<AuthResponse>(`${this.API_URL}/autenticar`, usuario);
  }

  isLoggedIn() {
    const token = this.cookie.get('token');
    return token ? true : false;
  }

  getUsuarioEspecifico(CODIGO: bigint): Observable<Usuarios> {
    return this.http.get<Usuarios>(
      `${this.API_URL}/usuarios/${CODIGO}`,
      this.httpOptions
    );
  }

  getAllUsuarios(): Observable<Array<Usuarios>> {
    return this.http.get<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      this.httpOptions
    );
  }

  addUsuario(requestDatas: AdicionarUsuario): Observable<Array<Usuarios>> {
    return this.http.post<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      requestDatas,
      this.httpOptions
    );
  }

  editUsuario(requestDatas: EditarUsuario): Observable<Array<Usuarios>> {
    return this.http.put<Array<Usuarios>>(
      `${this.API_URL}/usuarios`,
      requestDatas,
      this.httpOptions
    );
  }

  desativarUsuario(CODIGO: bigint): Observable<Array<Usuarios>> {
    return this.http.post<Array<Usuarios>>(
      `${this.API_URL}/usuarios/desativar/${CODIGO}`,
      this.httpOptions
    );
  }
}
