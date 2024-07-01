import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';

export interface UnidadeMedida {
  CODIGO: bigint;
  descricao:string;
  sigla:string;
  status: string;
  empresa: number;
  versao: string;
}

export interface AdicionarUnidadeMedida {
  descricao:string;
  sigla:string;
  empresa: number;
}

export interface EditarUnidadeMedida {
  CODIGO: bigint;
  descricao:string;
  sigla:string;
  status: string;
  empresa: number;
}

@Component({
  selector: 'app-unidade-medida',
  templateUrl: './unidade-medida.component.html',
  styleUrls: []
})
export class UnidadeMedidaComponent implements OnInit, OnDestroy {
  public readonly destroy$:Subject<void> = new Subject<void>;

  @ViewChild('tabelaUnidadeMedida') tabelaUnidadeMedida: Table | undefined;

  public showForm = false;

  public unidadeDatas: Array<UnidadeMedida> = [];
  
  public unidadeSelecionada!: Array<UnidadeMedida> | null;

  constructor(
    private unidadeService:UnidadeMedidaService,
    private messageService:MessageService,
    private router:Router,
    private formularioUnidadeMedida: FormBuilder,
    private confirmationService: ConfirmationService
  ) { }

  valorPesquisa!: string

  
  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof UnidadeMedidaComponent
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = ""
    table.clear();
  }

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];

  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public unidadeForm = this.formularioUnidadeMedida.group({
    CODIGO: [null as bigint | null],
    descricao: ['', [Validators.required]],
    sigla:['',[Validators.required]],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });

  ngOnInit() {
    this.listarUnidadeMedidas();

    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'descricao', header: 'Descricao'},
      { field: 'sigla', header: 'Sigla' }
  ];

  this.colunasSelecionadas = this.cols;
  }


   /**
   * Aplica um filtro global na tabela de grupos de usuários.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
   applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaUnidadeMedida!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.unidadeDatas);
        doc.save('unidadeMedida.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.unidadeDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'unidadeMedida');
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }

    /**
   * Retorna a severidade com base no status fornecido.
   *
   * @param {string} status - Status a ser avaliado.
   * @returns {string} - Severidade correspondente.
   */
  getSeverity(status: string) {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'DESATIVADO':
        return 'danger';
      default:
        return ''; // Add a default case that returns a default value
    }
  }

   /**
   * Manipulador de eventos para a seleção de uma linha na tabela.
   *
   * @param {*} event - Evento de seleção de linha.
   * @returns {void}
   */
   onRowSelect(event: any) {
    console.log('Row selected:', event.data);
    this.unidadeSelecionada = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log('Editar unidade medida:', this.unidadeForm.value.CODIGO)
    return !!this.unidadeForm.value.CODIGO;
  }

   /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
   onAddButtonClick() {
    this.showForm = true;
    this.unidadeForm.setValue({
      CODIGO: null,
      descricao: null,
      sigla:null,
      status: null,
      empresa: 1,
      versao: null
    });
  }

  onEditButtonClick(unidade: UnidadeMedida): void {
    const formattedDate = format(new Date(unidade.versao), 'dd/MM/yyyy HH:mm:ss');

    if (unidade.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um usuário desativado.',
      });
    } else {
      this.showForm = true;
      this.unidadeForm.patchValue({
        CODIGO: unidade.CODIGO,
        descricao: unidade.descricao,
        sigla: unidade.sigla,
        status: unidade.status,
        empresa: unidade.empresa,
        versao: formattedDate,
      });

      console.log(this.isEdicao());
    }
  }


  onDisableButtonClick(unidade: UnidadeMedida): void {
    this.unidadeForm.patchValue({
      CODIGO: unidade.CODIGO,
    });
    this.desativarUnidadeMedida(unidade.CODIGO as bigint);
  }

  desativarUnidadesSelecionadas() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja desativar as unidades de medida selecionadas?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.unidadeDatas = this.unidadeDatas.filter((val) => !this.unidadeSelecionada?.includes(val));
        this.unidadeSelecionada = null;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Unidades de Medida Desativadas', life: 3000 });
      }
    });
  }
  /**
   * Cancela o formulário de adição/editação e limpa os campos.
   */
  cancelarFormulario() {
    this.unidadeForm.reset();
    this.showForm = false;
    this.listarUnidadeMedida();
  }


  carregarUnidadeEspecifica(CODIGO: bigint){
    this.unidadeService.getProdutoEspecifico(CODIGO).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response) {
          this.unidadeForm.patchValue({
            CODIGO: response.CODIGO,
            descricao: response.descricao,
            sigla: response.sigla,
            status: response.status,
            empresa: response.empresa,
            versao: response.versao,
          });
        }}, error: (error) => {
          console.log(error);
      }})
  }

  /**
   * Lista as unidades de medida chamando o serviço correspondente.
   */
  listarUnidadesMedida() {
    this.unidadeService
      .getAllProdutos()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.unidadeDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar as unidades de medida',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }

  
  /**
   * Adiciona ou edita uma unidade medida com base no estado do formulário.
   */
  adicionarOuEditarUnidadeMedida(): void {
    if (this.isEdicao()) {
      this.editarUnidadeMedida();
    } else {
      this.adicionarUnidadeMedida();
    }
  }


  /**
   * Adiciona uma nova unidade medida.
   */
  adicionarUnidadeMedida(): void {
    if (this.unidadeForm.valid) {
      const requestCreateUnidadeMedida: AdicionarUnidadeMedida = {
        descricao: this.unidadeForm.value.descricao as string,
        sigla:this.unidadeForm.value.sigla as string,
        empresa: this.unidadeForm.getRawValue().empresa as number,
      };

      this.unidadeService
        .adicionarUnidadeMedida(requestCreateUnidadeMedida)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar Unidade Medida:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Unidade Medida criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.unidadeForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarUnidadeMedidas();
          },
          error: (error) => {
            console.error('Erro ao cadastrar unidade de medida:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar unidade de medida!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.unidadeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Edita um produto existente.
   */
  editarUnidadeMedida(): void {
    if (this.unidadeForm?.valid) {
      const requestEditUnidadeMedida: EditarUnidadeMedida = {
        CODIGO: this.unidadeForm.value.CODIGO as bigint,
        descricao: this.unidadeForm.value.descricao as string,
        sigla:this.unidadeForm.value.sigla as string,
        status: this.unidadeForm.value.status as string,
        empresa: this.unidadeForm.getRawValue().empresa as number,
      };
      console.log(requestEditUnidadeMedida)
      // Chamar o serviço para editar a unidade de medida
      this.unidadeService
        .editarProduto(requestEditUnidadeMedida)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar unidade medida:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Unidade medida editado com sucesso!',
                life: 3000,
              });
              this.unidadeForm.reset();
              this.showForm = false;
              this.listarUnidadeMedidas();
            }
          },
          error: (error) => {
            console.error('Erro ao editar unidade medida:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar unidade medida!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.unidadeForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }

  OnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
