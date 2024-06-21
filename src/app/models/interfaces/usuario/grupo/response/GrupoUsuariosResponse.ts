import { Perfil } from "src/app/models/enums/group/user/Perfil.enum";

export interface GrupoUsuarios {
  CODIGO: bigint;
  descricao: string;
  perfil: Perfil;
  status: string;
  empresa: number;
  versao: string;
}

