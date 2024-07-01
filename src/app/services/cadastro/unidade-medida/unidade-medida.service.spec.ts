/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UnidadeMedidaService } from './unidade-medida.service';

describe('Service: UnidadeMedida', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnidadeMedidaService]
    });
  });

  it('should ...', inject([UnidadeMedidaService], (service: UnidadeMedidaService) => {
    expect(service).toBeTruthy();
  }));
});
