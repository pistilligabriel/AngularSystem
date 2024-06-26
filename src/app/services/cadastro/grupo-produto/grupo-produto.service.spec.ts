/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GrupoProdutoService } from './grupo-produto.service';

describe('Service: GrupoProduto', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrupoProdutoService]
    });
  });

  it('should ...', inject([GrupoProdutoService], (service: GrupoProdutoService) => {
    expect(service).toBeTruthy();
  }));
});
