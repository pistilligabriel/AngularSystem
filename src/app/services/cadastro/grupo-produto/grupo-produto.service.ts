import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { AdicionarGrupoProduto, EditarGrupoProduto, GrupoProduto } from 'src/app/modules/cadastro/grupo-produto/page/grupo-produto.component';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrupoProdutoService {
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


getAllGrupoProduto():Observable<Array<GrupoProduto>>{
  return this.httpClient.get<Array<GrupoProduto>>(`${this.API_URL}/item-grupos`, this.httpOptions);
}

getGrupoProduto(CODIGO:bigint){
  return this.httpClient.get(`${this.API_URL}/item-grupos/${CODIGO}`, this.httpOptions);
}

adicionarGrupoProduto(requestDatas:AdicionarGrupoProduto):Observable<Array<GrupoProduto>>{
  return this.httpClient.post<Array<GrupoProduto>>(`${this.API_URL}/item-grupos`, requestDatas, this.httpOptions);
}

editarGrupoProduto(requestDatas:EditarGrupoProduto):Observable<Array<GrupoProduto>>{
  return this.httpClient.put<Array<GrupoProduto>>(`${this.API_URL}/item-grupos`, requestDatas, this.httpOptions);
}

desativarGrupoProduto(CODIGO:bigint):Observable<Array<GrupoProduto>>{
  return this.httpClient.post<Array<GrupoProduto>>(`${this.API_URL}/item-grupos/desativar/${CODIGO}`, this.httpOptions);
}
}
