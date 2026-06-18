export interface Persona {
  id: string;
  level: number;
  name: string;
  arcana: string;
  initialSkills: string[];
  learnedSkills: string[];
  resistances: string;
  inheritanceType: string;
  image: string;
  story?: string;
}

export interface Source {
  name: string;
  url: string;
  fetchedAt: string;
}

export interface PersonaData {
  sources: Source[];
  personas: Persona[];
}

export interface SpecialMaterial {
  arcana: string;
  name: string;
}

export interface SpecialFusion {
  result: string;
  materialCount: number;
  materials: SpecialMaterial[];
  condition: string;
}

export interface FusionRecipe {
  result: string;
  arcanaPage: string;
  materialCount: number;
  materials: SpecialMaterial[];
  condition: string;
  type: string;
  special: boolean;
}

export interface FusionData {
  sources: Source[];
  inheritance: Record<string, Record<string, boolean>>;
  arcanaMatrix: Record<string, Record<string, string | null>>;
  triangleMatrix: Record<string, Record<string, string | null>>;
  specialOnlyNames: string[];
  specials: SpecialFusion[];
  recipes: FusionRecipe[];
}

export interface FusionCombo {
  type: string;
  materials: Array<Persona | SpecialMaterial>;
  condition: string;
  note: string;
  special: boolean;
}
