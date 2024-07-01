import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AdicionarUnidadeMedida, EditarUnidadeMedida, UnidadeMedida } from 'src/app/modules/cadastro/unidade-medida/unidade-medida.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UnidadeMedidaService {
  private API_URL = environment.apiUrl;
  private JWT_TOKEN = this.cookie.get('token');
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `${this.JWT_TOKEN}`,
    }),
  };
constructor(
  private httpClient: HttpClient,
  private cookie:CookieService
) { }

getAllUnidadeMedida(){
  return this.httpClient.get<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`, this.httpOptions);
}
getUnidadeMedida(CODIGO:bigint):Observable<UnidadeMedida>{
  return this.httpClient.get<UnidadeMedida>(`${this.API_URL}/unidade-medida/${CODIGO}`, this.httpOptions);
}

adicionarUnidadeMedida(requestDatas:AdicionarUnidadeMedida)
:Observable<Array<UnidadeMedida>>{
  return this.httpClient.post<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`, requestDatas, this.httpOptions);
}

editarUnidadeMedida(requestDatas:EditarUnidadeMedida):Observable<Array<UnidadeMedida>>{
  return this.httpClient.put<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida`, requestDatas, this.httpOptions);
}

desativarUnidadeMedida(CODIGO:bigint):Observable<Array<UnidadeMedida>>{
  return this.httpClient.post<Array<UnidadeMedida>>(`${this.API_URL}/unidade-medida/desativar/${CODIGO}`, this.httpOptions);
}
}
