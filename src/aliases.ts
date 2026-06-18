import type { Persona } from "./types";
import aliasData from "../shared/aliases.json";

export const personaNameAliases: Record<string, string> = aliasData.personaNameAliases;
const extraSearchAliases: Record<string, string[]> = aliasData.extraSearchAliases;

export function normalizePersonaName(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, "");
  const normalizedKey = trimmed.replace(/\u2f94/g, "言");
  return personaNameAliases[normalizedKey] || personaNameAliases[trimmed] || trimmed;
}

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .toLowerCase();
}

function getPersonaSearchNames(personaName: string): string[] {
  const names = new Set<string>([personaName]);
  for (const [alias, canonical] of Object.entries(personaNameAliases)) {
    if (canonical === personaName) names.add(alias);
  }
  for (const alias of extraSearchAliases[personaName] ?? []) {
    names.add(alias);
  }
  return [...names];
}

export function personaMatchesSearch(persona: Persona, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const canonicalFromQuery = normalizePersonaName(rawQuery.replace(/\s+/g, ""));
  if (canonicalFromQuery === persona.name) return true;

  const haystack = normalizeSearchText(
    [
      ...getPersonaSearchNames(persona.name),
      persona.arcana,
      persona.inheritanceType,
      persona.resistances,
      ...persona.initialSkills,
      ...persona.learnedSkills,
    ].join(" "),
  );

  return haystack.includes(query);
}
