import { Search, Sparkles } from "lucide-react";
import { memo, useEffect, useMemo, useState, useTransition } from "react";
import { personaMatchesSearch } from "./aliases";
import { buildFusionIndex, getFusionEmptyMessage, isPersona } from "./fusion";
import type { FusionCombo, FusionData, Persona, PersonaData } from "./types";

function PersonaList({
  personas,
  selectedId,
  onSelect,
}: {
  personas: Persona[];
  selectedId: string | null;
  onSelect: (persona: Persona) => void;
}) {
  if (!personas.length) {
    return <div className="empty">没有匹配的人格面具</div>;
  }

  return (
    <div className="persona-list">
      {personas.map((persona) => (
        <button
          className={`persona-item ${selectedId === persona.id ? "active" : ""}`}
          key={persona.id}
          onClick={() => onSelect(persona)}
          type="button"
        >
          <PersonaImage className="persona-item-thumb" key={persona.id} persona={persona} />
          <span className="persona-item-body">
            <span className="persona-item-top">
              <strong>{persona.name}</strong>
              <span className="level-pill">Lv {persona.level}</span>
            </span>
            <span className="arcana-pill">{persona.arcana}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="chip-list">
      {(items.length ? items : ["未记录"]).map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

const PersonaImage = memo(function PersonaImage({
  persona,
  className = "persona-image",
}: {
  persona: Persona;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [persona.id, persona.image]);

  const src = failed
    ? "/assets/personas/_placeholder.svg"
    : persona.image.startsWith("http")
      ? persona.image
      : `/${persona.image}`;

  return (
    <img
      alt={`${persona.name} 头像`}
      className={className}
      decoding="async"
      key={src}
      loading="lazy"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      src={src}
    />
  );
});

const PersonaDetail = memo(function PersonaDetail({ persona }: { persona: Persona }) {
  const tags = [persona.inheritanceType, persona.resistances || "属性未记录"];

  return (
    <section className="detail" aria-live="polite">
      <div className="persona-hero">
        <div className="persona-image-wrap">
          <PersonaImage key={persona.id} persona={persona} />
        </div>
        <div className="persona-title">
          <span className="arcana-pill">{persona.arcana}</span>
          <div className="meta-line">Lv {persona.level}</div>
          <h2>{persona.name}</h2>
          <div className="tag-row">
            {tags.map((tag, index) => (
              <span className="tag" key={`${tag}-${index}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="info-grid">
        <section className="panel">
          <h3 className="panel-title">基础属性</h3>
          <dl className="stats">
            <dt>初期等级</dt>
            <dd>Lv {persona.level}</dd>
            <dt>阿尔克那</dt>
            <dd>{persona.arcana}</dd>
            <dt>继承类型</dt>
            <dd>{persona.inheritanceType}</dd>
            <dt>属性耐性</dt>
            <dd>{persona.resistances || "未记录"}</dd>
          </dl>
        </section>

        <section className="panel">
          <h3 className="panel-title">技能列表</h3>
          <div className="skill-columns">
            <div>
              <h4>初期技能</h4>
              <ChipList items={persona.initialSkills} />
            </div>
            <div>
              <h4>习得技能</h4>
              <ChipList items={persona.learnedSkills} />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
});

function SearchEmptyState({ query }: { query: string }) {
  return (
    <section className="detail search-empty">
      <div className="panel">
        <h3>未找到匹配的人格面具</h3>
        <p className="formula-note">
          没有找到与「{query}」匹配的结果。可尝试简体/异体字（如「毘陀罗」与「昆陀罗」），或清空搜索重新浏览。
        </p>
      </div>
    </section>
  );
}

function MaterialCard({ material }: { material: FusionCombo["materials"][number] }) {
  if (!isPersona(material)) {
    return (
      <div className="material-card">
        <div className="material-thumb placeholder" />
        <div className="material-info">
          <strong>{material.name || "未知素材"}</strong>
          <span>{material.arcana || "资料未收录"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="material-card">
      <PersonaImage className="material-thumb" key={material.id} persona={material} />
      <div className="material-info">
        <strong>{material.name}</strong>
        <span>{material.arcana}</span>
      </div>
    </div>
  );
}

function FusionPanel({
  combos,
  emptyMessage,
  specialOnly,
  onSpecialOnlyChange,
}: {
  combos: FusionCombo[];
  emptyMessage: string;
  specialOnly: boolean;
  onSpecialOnlyChange: (value: boolean) => void;
}) {
  return (
    <aside aria-label="合成组合" className="fusion-panel">
      <div className="fusion-header">
        <div>
          <p className="eyebrow">Fusion</p>
          <h3>合成配方</h3>
        </div>
        <span className="count-pill">{combos.length}</span>
      </div>

      <label className="toggle-row">
        <input
          checked={specialOnly}
          onChange={(event) => onSpecialOnlyChange(event.target.checked)}
          type="checkbox"
        />
        <Sparkles aria-hidden="true" size={15} />
        只看特殊合体
      </label>

      <div className="fusion-list">
        {combos.length ? (
          combos.map((combo, index) => (
            <article className={`fusion-card ${combo.special ? "special" : ""}`} key={`${combo.type}-${index}`}>
              <div className="fusion-type">
                <span className="fusion-badge">{combo.type}</span>
              </div>
              <div className="material-row">
                {combo.materials.map((material, materialIndex) => (
                  <div className="material-chain" key={`${combo.type}-${index}-${materialIndex}`}>
                    {materialIndex > 0 ? <span className="fusion-op">×</span> : null}
                    <MaterialCard material={material} />
                  </div>
                ))}
              </div>
              {combo.condition ? <p className="formula-note">条件：{combo.condition}</p> : null}
            </article>
          ))
        ) : (
          <div className="empty fusion-empty">
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [fusion, setFusion] = useState<FusionData | null>(null);
  const [selected, setSelected] = useState<Persona | null>(null);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [arcana, setArcana] = useState("全部");
  const [specialOnly, setSpecialOnly] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    Promise.all([
      fetch("/data/personas.json").then(async (response) => {
        if (!response.ok) throw new Error(`personas.json 加载失败 (${response.status})`);
        return response.json() as Promise<PersonaData>;
      }),
      fetch("/data/fusion.json").then(async (response) => {
        if (!response.ok) throw new Error(`fusion.json 加载失败 (${response.status})`);
        return response.json() as Promise<FusionData>;
      }),
    ])
      .then(([personaData, fusionData]) => {
        const sorted = [...personaData.personas].sort(
          (a, b) => a.level - b.level || a.name.localeCompare(b.name, "zh-Hans-CN"),
        );
        setPersonas(sorted);
        setFusion(fusionData);
        setSelected(sorted.find((persona) => persona.name === "爱丽丝") ?? sorted[0] ?? null);
      })
      .catch((error: unknown) =>
        setLoadError(error instanceof Error ? error.message : "数据加载失败"),
      );
  }, []);

  const fusionIndex = useMemo(() => {
    if (!personas.length || !fusion) return null;
    if (!fusion.recipes?.length && !fusion.specials?.length) return null;
    return buildFusionIndex(personas, fusion);
  }, [fusion, personas]);

  const handleSelect = (persona: Persona) => {
    startTransition(() => setSelected(persona));
  };

  const arcanas = useMemo(() => ["全部", ...new Set(personas.map((persona) => persona.arcana))], [personas]);

  const filteredPersonas = useMemo(
    () =>
      personas.filter((persona) => {
        const queryOk = !searchQuery || personaMatchesSearch(persona, searchQuery);
        const arcanaOk = arcana === "全部" || persona.arcana === arcana;
        return queryOk && arcanaOk;
      }),
    [arcana, personas, searchQuery],
  );

  const hasActiveSearch = Boolean(searchQuery.trim());
  const showSearchEmpty = hasActiveSearch && filteredPersonas.length === 0;

  useEffect(() => {
    if (showSearchEmpty) return;
    if (!filteredPersonas.length) return;
    if (!selected || !filteredPersonas.some((persona) => persona.id === selected.id)) {
      startTransition(() => setSelected(filteredPersonas[0]));
    }
  }, [filteredPersonas, selected, showSearchEmpty, startTransition]);

  const allFusionCombos = useMemo(() => {
    if (!selected || !fusionIndex || showSearchEmpty) return [];
    return fusionIndex.get(selected.id) ?? [];
  }, [fusionIndex, selected, showSearchEmpty]);

  const fusionCombos = useMemo(() => {
    return specialOnly ? allFusionCombos.filter((combo) => combo.special) : allFusionCombos;
  }, [allFusionCombos, specialOnly]);

  const fusionEmptyMessage = useMemo(() => {
    if (!selected || !fusion) return "当前筛选下没有合成配方";
    return getFusionEmptyMessage(selected, fusion, allFusionCombos, specialOnly);
  }, [allFusionCombos, fusion, selected, specialOnly]);

  if (loadError) {
    return <main className="empty">数据加载失败：{loadError}</main>;
  }

  if (!personas.length) {
    return <main className="empty">正在加载人格面具资料...</main>;
  }

  const activePersona = showSearchEmpty ? null : selected;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div aria-hidden="true" className="brand-mark">
            P
          </div>
          <div className="brand-copy">
            <h1>人格面具合成查询</h1>
            <p>Persona 4 Golden · 图鉴与合体配方</p>
          </div>
        </div>
      </header>

      <main className="layout">
        <aside aria-label="人格面具搜索" className="sidebar">
          <div className="sidebar-head">
            <h2>图鉴</h2>
            <span className="count-pill">{filteredPersonas.length}</span>
          </div>
          <label className="search">
            <span>搜索</span>
            <div className="search-input">
              <Search aria-hidden="true" size={18} />
              <input
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
                  if (!isComposing) setSearchQuery(event.target.value);
                }}
                onCompositionEnd={(event) => {
                  setIsComposing(false);
                  setSearchQuery(event.currentTarget.value);
                }}
                onCompositionStart={() => setIsComposing(true)}
                placeholder="名称、阿尔克那或技能"
                type="search"
                value={query}
              />
            </div>
          </label>
          <div className="filter-wrap">
            <label htmlFor="arcana-filter">阿尔克那</label>
            <select
              aria-label="按阿尔克那筛选"
              id="arcana-filter"
              onChange={(event) => setArcana(event.target.value)}
              value={arcana}
            >
            {arcanas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
            </select>
          </div>
          <PersonaList
            onSelect={handleSelect}
            personas={filteredPersonas}
            selectedId={activePersona?.id ?? null}
          />
        </aside>

        {showSearchEmpty ? (
          <SearchEmptyState query={searchQuery} />
        ) : activePersona ? (
          <PersonaDetail persona={activePersona} />
        ) : (
          <div className="empty">正在加载 P4G 人格面具资料...</div>
        )}

        <FusionPanel
          combos={activePersona ? fusionCombos : []}
          emptyMessage={fusionEmptyMessage}
          onSpecialOnlyChange={setSpecialOnly}
          specialOnly={specialOnly}
        />
      </main>
    </div>
  );
}
