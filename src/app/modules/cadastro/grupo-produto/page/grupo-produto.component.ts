import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { format } from 'date-fns';
import * as FileSaver from 'file-saver';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { Column } from 'src/app/models/interfaces/Column';
import { ExportColumn } from 'src/app/models/interfaces/ExportColumn';
import { GrupoProdutoService } from 'src/app/services/cadastro/grupo-produto/grupo-produto.service';

export interface GrupoProduto{
  CODIGO: bigint;
  descricao: string;
  observacao: string;
  status: string;
  empresa:number;
  versao:string;
}

export interface AdicionarGrupoProduto{
  descricao: string;
  observacao: string;
  empresa:number;
}

export interface EditarGrupoProduto{
  CODIGO: bigint;
  descricao: string;
  observacao: string;
  status: string;
  empresa:number;
}

@Component({
  selector: 'app-grupo-produto',
  templateUrl: './grupo-produto.component.html',
  styleUrls: []
})
export class GrupoProdutoComponent implements OnInit, OnDestroy{
  private readonly destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaGrupoProduto') tabelaGrupoProduto: Table | undefined;

  public showForm = false;

  public grupoProdutoDatas: Array<GrupoProduto> = [];

  public grupoProdutoSelecionado!: GrupoProduto [] | null;

  constructor(

    private grupoProdutoService: GrupoProdutoService,
     private messageService: MessageService,
     private router: Router,
     private formBuilderGrupoProduto: FormBuilder,
     private confirmationService: ConfirmationService
  ) { }

  valorPesquisa!: string;

   /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof ProdutoComponent
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
  public grupoProdutoForm = this.formBuilderGrupoProduto.group({
    CODIGO: [null as bigint | null],
    descricao: ['', [Validators.required]],
    observacao: [''],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });

  ngOnInit(): void {
    this.listarGrupoProdutos();

    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'descricao', header: 'Descricao'},
      { field: 'observacao', header: 'Observacao' },
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
    this.tabelaGrupoProduto!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }

   /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
   exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.grupoProdutoDatas);
        doc.save('GrupoProdutos.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.grupoProdutoDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'grupoProduto');
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
    this.grupoProdutoSelecionado = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log('Editar Grupo Produto:', this.grupoProdutoForm.value.CODIGO)
    return !!this.grupoProdutoForm.value.CODIGO;
  }

  /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
  onAddButtonClick() {
    this.showForm = true;
    this.grupoProdutoForm.setValue({
      CODIGO: null,
      descricao: null,
      observacao: null,
      status: null,
      empresa: 1,
      versao: null,
    });
  }

  onEditButtonClick(grupoProduto: GrupoProduto): void {
    const formattedDate = format(new Date(grupoProduto.versao), 'dd/MM/yyyy HH:mm:ss');

    if (grupoProduto.status === 'DESATIVADO') {
      this.confirmationService.confirm({
        header: 'Aviso',
        message: 'Não é permitido editar um usuário desativado.',
      });
    } else {
      this.showForm = true;
      this.grupoProdutoForm.patchValue({
        CODIGO: grupoProduto.CODIGO,
        descricao: grupoProduto.descricao,
        observacao: grupoProduto.observacao,
        status: grupoProduto.status,
        empresa: grupoProduto.empresa,
        versao: formattedDate,
      });

      console.log(this.isEdicao());
    }
  }

  onDisableButtonClick(grupoProduto: GrupoProduto): void {
    this.grupoProdutoForm.patchValue({
      CODIGO: grupoProduto.CODIGO,
    });
    this.desativarProduto(grupoProduto.CODIGO as bigint);
  }

  desativarGrupoProdutoSelecionados() {
    this.confirmationService.confirm({
      message: 'Tem certeza de que deseja desativar os grupos selecionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.grupoProdutoDatas = this.grupoProdutoDatas.filter((val) => !this.grupoProdutoSelecionado?.includes(val));
        this.grupoProdutoSelecionado = null;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Grupo Produto Desativados', life: 3000 });
      }
    });
  }

  /**
   * Cancela o formulário de adição/editação e limpa os campos.
   */
  cancelarFormulario() {
    this.grupoProdutoForm.reset();
    this.showForm = false;
    this.listarGrupoProdutos();
  }

  /**
   * Lista os produtos chamando o serviço correspondente.
   */
  listarGrupoProdutos() {
    this.grupoProdutoService
      .getAllGrupoProduto()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.grupoProdutoDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar os grupos',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }

    /**
   * Adiciona ou edita um produto com base no estado do formulário.
   */
    adicionarOuEditarGrupoProduto(): void {
      if (this.isEdicao()) {
        this.editarGrupoProduto();
      } else {
        this.adicionarGrupoProduto();
      }
    }

     /**
   * Adiciona um novo grupo produto.
   */
  adicionarGrupoProduto(): void {
    if (this.grupoProdutoForm.valid) {
      const requestCreateGrupoProduto: AdicionarGrupoProduto = {
        descricao: this.grupoProdutoForm.value.descricao as string,
        observacao: this.grupoProdutoForm.value.observacao as string,
        empresa: this.grupoProdutoForm.getRawValue().empresa as number,
      };

      this.grupoProdutoService
        .adicionarGrupoProduto(requestCreateGrupoProduto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar grupo:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Grupo criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.grupoProdutoForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarGrupoProdutos();
          },
          error: (error) => {
            console.error('Erro ao cadastrar grupo produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar grupo produto!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.grupoProdutoForm);
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
  editarGrupoProduto(): void {
    if (this.grupoProdutoForm?.valid) {
      const requestEditGrupoProduto: EditarGrupoProduto = {
        CODIGO: this.grupoProdutoForm.value.CODIGO as bigint,
        descricao: this.grupoProdutoForm.value.descricao as string,
        observacao: this.grupoProdutoForm.value.observacao as string,
        status: this.grupoProdutoForm.value.status as string,
        empresa: this.grupoProdutoForm.getRawValue().empresa as number,
      };
      console.log(requestEditGrupoProduto)
      // Chamar o serviço para editar o produto
      this.grupoProdutoService
        .editarGrupoProduto(requestEditGrupoProduto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar grupo:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Grupo editado com sucesso!',
                life: 3000,
              });
              this.grupoProdutoForm.reset();
              this.showForm = false;
              this.listarGrupoProdutos();
            }
          },
          error: (error) => {
            console.error('Erro ao editar grupo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar grupo!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.grupoProdutoForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }

  /**
   * Desativa um grupo com o código fornecido.
   *
   * @param {bigint} CODIGO - Código do usuário a ser desativado.
   * @returns {void}
   */
  desativarProduto(CODIGO: bigint): void {
    console.log('Alterar o Status!:', CODIGO);
    if (CODIGO) {
      this.grupoProdutoService
        .desativarGrupoProduto(CODIGO)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao Alterar o Status!:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Status Alterado com sucesso!',
                life: 3000,
              });
              this.listarGrupoProdutos();
            }
          },
          error: (error) => {
            console.error('Erro ao Alterar o Status!:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao Alterar o Status!!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Nenhum grupo selecionado.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um grupo!',
        life: 3000,
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
