import type { FusionCombo, FusionData, FusionRecipe, Persona, SpecialFusion, SpecialMaterial } from "./types";
import { normalizePersonaName } from "./aliases";

export function isPersona(material: Persona | SpecialMaterial): material is Persona {
  return "id" in material;
}

function resolveMaterial(
  material: FusionRecipe["materials"][number],
  byName: Map<string, Persona>,
): Persona | SpecialMaterial {
  const canonicalName = normalizePersonaName(material.name);
  return byName.get(canonicalName) ?? { ...material, name: canonicalName };
}

function recipeToCombo(recipe: FusionRecipe, byName: Map<string, Persona>): FusionCombo {
  return {
    type: recipe.type,
    materials: recipe.materials.map((material) => resolveMaterial(material, byName)),
    condition: recipe.condition,
    note: recipe.special ? recipe.type : "",
    special: recipe.special,
  };
}

function specialToCombo(item: SpecialFusion, byName: Map<string, Persona>): FusionCombo {
  return {
    type: `特殊${item.materialCount}身`,
    materials: item.materials.map((material) => resolveMaterial(material, byName)),
    condition: item.condition,
    note: item.condition || "无额外条件",
    special: true,
  };
}

export function buildFusionIndex(
  personas: Persona[],
  fusion: FusionData,
): Map<string, FusionCombo[]> {
  const index = new Map<string, FusionCombo[]>();
  const byName = new Map(personas.map((persona) => [persona.name, persona]));
  const recipesByResult = new Map<string, FusionRecipe[]>();

  for (const persona of personas) {
    index.set(persona.id, []);
  }

  for (const recipe of fusion.recipes ?? []) {
    const resultName = normalizePersonaName(recipe.result);
    const bucket = recipesByResult.get(resultName);
    if (bucket) bucket.push(recipe);
    else recipesByResult.set(resultName, [recipe]);
  }

  for (const persona of personas) {
    const recipes = recipesByResult.get(persona.name) ?? [];
    index.set(persona.id, recipes.map((recipe) => recipeToCombo(recipe, byName)));
  }

  for (const item of fusion.specials ?? []) {
    const target = byName.get(normalizePersonaName(item.result));
    if (!target) continue;
    index.get(target.id)?.push(specialToCombo(item, byName));
  }

  return index;
}

export function getFusionEmptyMessage(
  persona: Persona,
  fusion: FusionData,
  allCombos: FusionCombo[],
  specialOnly: boolean,
): string {
  const generalCount = allCombos.filter((combo) => !combo.special).length;
  const specialCount = allCombos.filter((combo) => combo.special).length;

  if (specialOnly) {
    if (specialCount === 0 && generalCount > 0) {
      return "该人格面具没有特殊合体，取消勾选「只看特殊合体」可查看一般配方。";
    }
    if (specialCount === 0) {
      return getNoRecipeMessage(persona, fusion);
    }
  }

  if (allCombos.length === 0) {
    return getNoRecipeMessage(persona, fusion);
  }

  return "当前筛选下没有合成配方";
}

function getNoRecipeMessage(persona: Persona, fusion: FusionData): string {
  if (fusion.specialOnlyNames?.includes(persona.name)) {
    return "该人格面具为特殊/独家获得，一般合成表中无常规路线。";
  }

  const hasSpecialData = fusion.specials?.some(
    (item) => normalizePersonaName(item.result) === persona.name,
  );
  if (hasSpecialData) {
    return "该人格面具仅有特殊合体配方，若未显示请尝试重新加载数据。";
  }

  return "暂无收录的合成配方，可能为剧情限定、社群满级专属或 NG+ 内容。";
}
