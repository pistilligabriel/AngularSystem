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
import { ClienteService } from 'src/app/services/cadastro/cliente/cliente.service';

export interface Clientes {
  CODIGO: bigint;
  tipoIntegrante: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  email:string;
  tipoDocumento:string;
  documento:string;
  cep:string;
  logradouro: string;
  numero:number;
  bairro:string;
  municipio:string;
  estado: string;
  complemento:string;
  status: string;
  empresa: number;
  versao: string;
}

export interface LoadEditCliente {
  CODIGO: bigint;
  nome: string;
  sobrenome: string;
  telefone: string;
  email:string;
  tipoDocumento:string;
  documento:string;
  cep:string;
  logradouro: string;
  numero:string;
  bairro:string;
  municipio:string;
  estado: string;
  complemento:string;
  status: string;
  empresa: number;
  versao: string;
}

export interface AddCliente {
  nome: string;
  sobrenome: string;
  telefone: string;
  email:string;
  tipoDocumento:string;
  documento:string;
  cep:string;
  logradouro: string;
  numero:string;
  bairro:string;
  municipio:string;
  estado: string;
  complemento:string;
}
export interface EditCliente {
  CODIGO: bigint;
  nome: string;
  sobrenome: string;
  telefone: string;
  email:string;
  tipoDocumento:string;
  documento:string;
  cep:string;
  logradouro: string;
  numero:string;
  bairro:string;
  municipio:string;
  estado: string;
  complemento:string;
}

export interface TipoDocumento {
  id: number;
  value: string;
}

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: []
})
export class ClienteComponent implements OnInit {
  private destroy$: Subject<void> = new Subject<void>();

  @ViewChild('tabelaCliente') tabelaCliente: Table | undefined;
  /**
   * Flag para exibir ou ocultar o formulário de grupo de usuário.
   */
  public showForm = false;

  /**
   * Lista de dados de clientes.
   */
  public clienteDatas: Array<Clientes> = [];


  /**
   * Cliente selecionado
   */
  public clienteSelecionado!: Clientes[] | null;

  /**
   * Valor digitado no campo pesquisa
   */
  valorPesquisa!: string;

  /**
   * Limpa a seleção da tabela.
   *
   * @public
   * @memberof GroupUserComponent
   * @param {Table} table - Instância da tabela a ser limpa.
   * @returns {void}
   */
  clear(table: Table) {
    this.valorPesquisa = ""
    table.clear();
  }

  tipoDocumento!: TipoDocumento[]

  tipoDocumentoSelecionado!: TipoDocumento;

  cols!: Column[];

  colunasSelecionadas!: Column[];

  exportColumns!: ExportColumn[];

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private router:Router,
    private formBuilderCliente: FormBuilder,
    private confirmationService: ConfirmationService,
  ) { }

  /**
   * Formulário reativo para adicionar/editar grupos de usuários.
   */
  public clienteForm = this.formBuilderCliente.group({
    CODIGO: [null as bigint | null],
    nome: ['', [Validators.required]],
    sobrenome: ['', [Validators.required]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required]],
    tipoDocumento: ['', [Validators.required]],
    documento:['', [Validators.required]],
    cep: ['', [Validators.required]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    bairro: ['', [Validators.required]],
    municipio: ['', [Validators.required]],
    estado: ['', [Validators.required]],
    complemento: [''],
    status: [{ value: '', disabled: true }],
    empresa: [{ value: 1, disabled: true }],
    versao: [{ value: null as Date | string | null, disabled: true }],
  });


  ngOnInit() {
    this.listarClientes();

    this.cols = [
      { field: 'status', header: 'Status'},
      { field: 'nome', header: 'Nome' },
      { field: 'sobrenome', header: 'Sobrenome' },
      { field: 'telefone', header: 'Telefone'},
      { field: 'email', header: 'E-mail'},
    ];

    this.colunasSelecionadas = this.cols;

    this.tipoDocumento = [
      { id: 1, value: 'CPF' },
      { id: 2, value: 'CNPJ' },
    ];

  }

  /**
   * Aplica um filtro global na tabela de grupos de usuários.
   *
   * @param $event O evento que acionou a função.
   * @param stringVal O valor da string para filtrar.
   */
  applyFilterGlobal($event: any, stringVal: any) {
    this.tabelaCliente!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }


  /**
   * Exporta os dados da tabela para um arquivo PDF.
   */
  exportPdf() {
    import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
        const doc = new jsPDF.default('p', 'px', 'a4');
        (doc as any).autoTable(this.exportColumns, this.clienteDatas);
        doc.save('usuarios.pdf');
      });
    });
  }

  /**
   * Exporta os dados da tabela para um arquivo Excel.
   */
  exportExcel() {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(this.clienteDatas);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });
      this.saveAsExcelFile(excelBuffer, 'clientes');
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
    this.clienteSelecionado = event.data;
  }

  /**
   * Verifica se o formulário está em modo de edição.
   *
   * @returns {boolean} - Verdadeiro se estiver em modo de edição, falso caso contrário.
   */
  isEdicao(): boolean {
    console.log(this.clienteForm.value.CODIGO)
    return !!this.clienteForm.value.CODIGO;
  }

      /**
   * Manipulador de eventos para o botão de adição de grupo.
   * Exibe o formulário de adição de grupo.
   */
      onAddButtonClick() {
        console.log('Adicionar cliente' )
        this.showForm = true;
        this.clienteForm.setValue({
          CODIGO: null,
          nome: null,
          sobrenome: null,
          telefone: null,
          email: null,
          tipoDocumento: null,
          documento: null,
          cep: null,
          logradouro: null,
          numero: null,
          bairro: null,
          municipio: null,
          estado: null,
          complemento: null,
          status: null,
          empresa: 1,
          versao: null,
        });
      }

      onEditButtonClick(cliente: LoadEditCliente): void {
        const formattedDate = format(new Date(cliente.versao), 'dd/MM/yyyy HH:mm:ss');

        if (cliente.status === 'DESATIVADO') {
          this.confirmationService.confirm({
            header: 'Aviso',
            message: 'Não é permitido editar um usuário desativado.',
          });
        } else {
          this.showForm = true;

          this.clienteForm.patchValue({
            CODIGO: cliente.CODIGO,
            nome: cliente.nome,
            sobrenome: cliente.sobrenome,
            telefone: cliente.telefone,
            email: cliente.email,
            tipoDocumento: cliente.tipoDocumento,
            documento: cliente.documento,
            cep: cliente.cep,
            logradouro: cliente.logradouro,
            numero: cliente.numero,
            bairro: cliente.bairro,
            municipio: cliente.municipio,
            estado: cliente.estado,
            complemento: cliente.complemento,
            status: cliente.status,
            empresa: cliente.empresa,
            versao: formattedDate,
          });

          console.log(this.isEdicao());
        }
      }

      onDisableButtonClick(cliente: Clientes): void {
        this.clienteForm.patchValue({
          CODIGO: cliente.CODIGO,
        });
        this.desativarCliente(cliente.CODIGO as bigint);
      }

      disableSelectedClientes() {
        this.confirmationService.confirm({
          message: 'Tem certeza de que deseja excluir os usuarios selecionados?',
          header: 'Confirmar',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.clienteDatas = this.clienteDatas.filter((val) => !this.clienteSelecionado?.includes(val));
            this.clienteSelecionado = null;
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Usuarios Excluídos', life: 3000 });
          }
        });
      }

          /**
   * Cancela o formulário de adição/editação e limpa os campos.
   */
  cancelarFormulario() {
    this.clienteForm.reset();
    this.showForm = false;
    this.listarClientes();
  }

  /**
   * Lista os grupos de usuários chamando o serviço correspondente.
   */
  listarClientes() {
    this.clienteService
      .getAllCliente()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response) {
            this.clienteDatas = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar o usuários',
            detail: error.message,
            life: 3000,
          });
          this.router.navigate(['/home']);
        },
      });
  }

  /**
   * Adiciona ou edita um grupo de usuário com base no estado do formulário.
   */
  adicionarOuEditarCliente(): void {
    if (this.isEdicao()) {
      console.log("Editar Cliente")
      this.editarCliente();
    } else {
      console.log("Adicionar Cliente")
      this.adicionarCliente();
    }
  }

  /**
   * Adiciona um novo usuário.
   */
  adicionarCliente(): void {
    if (this.clienteForm.valid) {
      const requestCreateCliente: AddCliente = {
        nome: this.clienteForm.value.nome as string,
        sobrenome: this.clienteForm.value.sobrenome as string,
        telefone: this.clienteForm.value.telefone as string,
        email: this.clienteForm.value.email as string,
        tipoDocumento: JSON.parse(JSON.stringify(this.clienteForm.value.tipoDocumento)).value as string,
        documento: this.clienteForm.value.documento as string,
        cep: this.clienteForm.value.cep as string,
        logradouro: this.clienteForm.value.logradouro as string,
        numero: this.clienteForm.value.numero as string,
        bairro: this.clienteForm.value.bairro as string,
        municipio: this.clienteForm.value.municipio as string,
        estado: this.clienteForm.value.estado as string,
        complemento: this.clienteForm.value.complemento as string,
      };console.log(requestCreateCliente)
      this.clienteService
        .addCliente(requestCreateCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Sucesso ao cadastrar usuário:', response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Cliente criado com sucesso!',
              life: 3000,
            });

            // Resetar o formulário
            this.clienteForm.reset();

            // Voltar para a tabela
            this.showForm = false;

            // Recarregar os dados da tabela
            this.listarClientes();
          },
          error: (error) => {
            console.error('Erro ao cadastrar cliente:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar cliente!',
              life: 3000,
            });
          },
        });
    } else {
      console.log('Formulário inválido. Preencha todos os campos.', this.clienteForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }


  /**
   * Edita um cliente existente.
   */
  editarCliente(): void {
      //TODO - Carregar as informações preenchidas antes de editar
    if (this.clienteForm?.valid) {
      const requestEditCliente: EditCliente = {
        CODIGO: this.clienteForm.value.CODIGO as bigint,
        nome: this.clienteForm.value.nome as string,
        sobrenome: this.clienteForm.value.sobrenome as string,
        telefone: this.clienteForm.value.telefone as string,
        email: this.clienteForm.value.email as string,
        tipoDocumento: JSON.parse(JSON.stringify(this.clienteForm.value.tipoDocumento)).value as string,
        documento: this.clienteForm.value.documento as string,
        cep: this.clienteForm.value.cep as string,
        logradouro: this.clienteForm.value.logradouro as string,
        numero: this.clienteForm.value.numero as string,
        bairro: this.clienteForm.value.bairro as string,
        municipio: this.clienteForm.value.municipio as string,
        estado: this.clienteForm.value.estado as string,
        complemento: this.clienteForm.value.complemento as string,
      };

      // Chamar o serviço para editar o usuário
      this.clienteService
        .editCliente(requestEditCliente)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              console.log('Sucesso ao editar usuário:', response);
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Cliente editado com sucesso!',
                life: 3000,
              });
              this.clienteForm.reset();
              this.showForm = false;
              this.listarClientes();
            }
          },
          error: (error) => {
            console.error('Erro ao editar usuário:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar cliente!',
              life: 3000,
            });
          },
        });
    } else {
      console.warn('Formulário inválido. Preencha todos os campos.', this.clienteForm);
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos!',
        life: 3000,
      });
    }
  }

  /**
   * Desativa um cliente com o código fornecido.
   *
   * @param {bigint} CODIGO - Código do cliente a ser desativado.
   * @returns {void}
   */
  desativarCliente(CODIGO: bigint): void {
    console.log('Alterar o Status!:', CODIGO);
    if (CODIGO) {
      this.clienteService
        .desativarCliente(CODIGO)
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
              this.listarClientes();
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
      console.warn('Nenhum usuário selecionado.');
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um usuário!',
        life: 3000,
      });
    }
  }


  /**
   * Manipulador de eventos OnDestroy. Completa o subject de destruição.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
