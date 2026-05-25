-- Carbomir seed: Phase 3c で追加した 5 新規 registry entities
-- OffsetsDB の全 7 registry を Carbomir entity と対応させるための補完.
-- ACR / CAR / ART TREES / Cercarbono / Isometric

begin;

insert into public.entities (
  slug, type, name_ja, name_en, abbreviation,
  summary, tags, status, last_reviewed_at,
  sections, related_matrix_slugs,
  jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit
) values
(
  'acr', 'regulation', 'ACR (American Carbon Registry)', 'American Carbon Registry', 'ACR',
  '1996 年に米国で設立された世界最古の任意カーボンクレジット基準。Winrock International の事業部門として運営。California Cap-and-Trade の ARB 認証オフセットプロトコル提供者の一つで、コンプライアンス需要にも対応する希少な民間レジストリ。',
  array['米国','ボランタリー市場','Cap and Trade','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "制度の概要", "body": "1996 年、Environmental Resources Trust (ERT) として設立 (米国最古の任意カーボン基準)。2007 年に Winrock International 傘下に編入。**ERT (Emission Reduction Ton)** クレジットを発行。森林・産業ガス・農業の各セクターで広い実績。", "source_urls": [{ "label": "ACR 公式", "url": "https://americancarbonregistry.org/" }] },
    { "heading": "コンプライアンスとの接続", "body": "**California Cap-and-Trade の ARB 認証** オフセットプロトコル提供者として指定された数少ない民間レジストリ。米国コンプライアンス需要にアクセスできる強みを持つ。Washington State CCA でも採用される見込み (要確認)。" },
    { "heading": "編集部の論点", "body": "Verra・Gold Standard と並ぶ「VCM の主要 3 スタンダード」の一角だが、規模は VCS の 1/5 程度。米国コンプライアンス接続が差別化要素で、米国向けの ESG/CSR 訴求案件で需要が安定している。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国 (民間)', 1996, 'Winrock International (米国非営利)', 'グローバル (米国中心)',
  'https://americancarbonregistry.org/', 'ERT (Emission Reduction Ton)'
),
(
  'car', 'regulation', 'CAR (Climate Action Reserve)', 'Climate Action Reserve', 'CAR',
  '2008 年に California で設立された任意カーボンクレジット基準。CRT (Climate Reserve Ton) を発行。California Cap-and-Trade の主要 ARB 認証オフセットプロトコル提供者で、森林・農業・冷媒系で強い実績を持つ。',
  array['米国','ボランタリー市場','Cap and Trade','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "制度の概要", "body": "California Climate Action Registry (2001 年州立委員会の自主排出登録制度) を起源として、2008 年に独立非営利として再編。**CRT (Climate Reserve Ton)** を発行し、設立から California Cap-and-Trade との接続を前提とした制度設計。", "source_urls": [{ "label": "Climate Action Reserve 公式", "url": "https://climateactionreserve.org/" }] },
    { "heading": "主要メソドロジー", "body": "- **森林**: US/Mexico Forest Project Protocol\n- **冷媒**: Ozone Depleting Substances Protocol\n- **農業**: Rice Cultivation, Livestock Project Protocols\n- **油田・ガス**: Coal Mine Methane, Plugging Abandoned Wells\n\n冷媒系 (Refrigerant) と森林の組み合わせが業界内で独自の存在感。" },
    { "heading": "編集部の論点", "body": "コンプライアンス志向の品質設計が強み。VCS と比較して mosthodology version 管理が厳格で、買い手企業の説明可能性が高い。一方、グローバル展開は限定的でラテンアメリカ・アジア案件は少ない。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国 California (民間)', 2008, 'Climate Action Reserve (米国非営利)', '北米中心 + 一部国際',
  'https://climateactionreserve.org/', 'CRT (Climate Reserve Ton)'
),
(
  'art-trees', 'regulation', 'ART TREES', 'ART TREES (The REDD+ Environmental Excellency Standard)', 'ART TREES',
  '2021 年に運用開始した REDD+ 専門レジストリ。**Jurisdictional-scale REDD+** (国・州レベル) に特化し、プロジェクトレベル REDD+ の品質議論を制度的に回避する設計。LEAF Coalition (米英独 + 民間連合) が需要側支援。',
  array['森林吸収','途上国','ボランタリー市場','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "制度の概要", "body": "**ART (Architecture for REDD+ Transactions)** が運営する、REDD+ 専門の任意カーボンクレジット基準。2021 年に最初のクレジット発行。設計思想は **「個別プロジェクトの追加性議論を回避するため、国・州レベルで REDD+ を測定する」** こと。", "source_urls": [{ "label": "ART 公式", "url": "https://www.artredd.org/" }] },
    { "heading": "LEAF Coalition の需要側支援", "body": "**LEAF Coalition** (Lowering Emissions by Accelerating Forest finance) — 米英独 + Amazon / Microsoft / Salesforce 等の民間企業による需要側支援連合 — が ART TREES クレジットを大規模に購入する仕組み。途上国 (Ghana, Guyana 等) からの発行が拡大中。" },
    { "heading": "編集部の論点", "body": "Jurisdictional 設計は **追加性議論を制度的に解決** する強みがあるが、(a) 各国政府の MRV 能力に依存、(b) 同一森林で他制度との二重計上リスク、の論点。Verra VCS の REDD+ 品質議論を背景に伸びてきており、今後の主要 REDD+ 標準として注目。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国 (民間)', 2021, 'Architecture for REDD+ Transactions (米国非営利)', 'REDD+ 対象国 (国・州単位)',
  'https://www.artredd.org/', 'TREES Credit'
),
(
  'cercarbono', 'regulation', 'Cercarbono', 'Cercarbono', null,
  '2016 年にコロンビアで設立された南米拠点の任意カーボンクレジット基準。**コロンビア炭素税のオフセット適格レジストリ** として急成長。森林・農業案件で実績、ラテンアメリカ域内で強い存在感。',
  array['国際','ボランタリー市場','森林吸収'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "制度の概要", "body": "**コロンビアの炭素税** (2017 年導入) のオフセット適格レジストリとして指定されたことで急成長。コロンビア国内・周辺南米諸国のクレジット創出ニーズに密接対応。**VCC (Voluntary Carbon Credit)** を発行。", "source_urls": [{ "label": "Cercarbono 公式", "url": "https://www.cercarbono.com/" }] },
    { "heading": "ラテンアメリカ展開", "body": "コロンビア・ブラジル・ペルー・チリ・メキシコ等のプロジェクトを集約。森林系 (REDD+ / ARR) が中心だが、再エネ・廃棄物・農業も対応。OffsetsDB 集計では発行量で世界 5 位 (140M tCO2 級) と既に規模ある。" },
    { "heading": "編集部の論点", "body": "(a) コロンビア炭素税との密接性、(b) 地域専門性、(c) Verra/Gold Standard より相対的に発行スピードが速い、の 3 点が訴求軸。日本企業の本格活用例はまだ限定的だが、ラテンアメリカ拠点企業や森林由来クレジットの多角化先として注目。CCP 適格性は個別メソドロジーで判定中。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  'コロンビア (民間)', 2016, 'Cercarbono (コロンビア)', 'ラテンアメリカ中心 + グローバル展開',
  'https://www.cercarbono.com/', 'VCC (Voluntary Carbon Credit)'
),
(
  'isometric', 'regulation', 'Isometric', 'Isometric', null,
  '2022 年に英国で設立された **Engineered Removal 専門の新興レジストリ**。Verra VCS や Gold Standard が REDD+ 等の品質議論に巻き込まれる中、CDR (Carbon Dioxide Removal) に絞り込んだ品質基準で参入。Microsoft 等の支持を得て急成長中。',
  array['Engineered Removal','ボランタリー市場','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "制度の概要", "body": "2022 年設立。**「Engineered Removal に絞った品質基準」** を掲げ、Verra VCS / Gold Standard が REDD+ 品質議論で揺れる中で参入。DAC、Biochar、ERW、Mineralization 等の Engineered Removal 系メソドロジーを優先整備。", "source_urls": [{ "label": "Isometric 公式", "url": "https://isometric.com/" }] },
    { "heading": "市場での位置", "body": "発行量はまだ少ない (60+ プロジェクト、~0.1M tCO2 issued) が、Microsoft をはじめとするテック大手の長期 offtake 契約で大規模需要を確保。CDR 市場の急成長 (2030 年に数千万-数億トン規模) を見越して急拡大が予想される。" },
    { "heading": "編集部の論点", "body": "従来 VCM の総合スタンダードに対する **「CDR 専門・新興」** ポジションは差別化として有効。一方、(a) 発行実績の蓄積がこれから、(b) MRV 厳格性が買い手から評価される必要、の 2 点が今後の試金石。日本企業の Engineered Removal 調達でも認識すべきレジストリ。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '英国 (民間)', 2022, 'Isometric (英国)', 'グローバル (CDR 案件中心)',
  'https://isometric.com/', 'Isometric Credit'
)
on conflict (slug) do update set
  type = excluded.type,
  name_ja = excluded.name_ja,
  name_en = excluded.name_en,
  abbreviation = excluded.abbreviation,
  summary = excluded.summary,
  tags = excluded.tags,
  status = excluded.status,
  last_reviewed_at = excluded.last_reviewed_at,
  sections = excluded.sections,
  jurisdiction = excluded.jurisdiction,
  established_year = excluded.established_year,
  operator = excluded.operator,
  geographic_scope = excluded.geographic_scope,
  website_url = excluded.website_url,
  credit_unit = excluded.credit_unit,
  updated_at = now();

-- ============================================================
-- entity_relations: 新規 registry と既存 entity の接続
-- ============================================================
insert into public.entity_relations (from_entity_id, to_entity_id, relation_type, notes)
select f.id, t.id, rel.relation_type, rel.notes
from (values
  -- ACR
  ('acr','verra-vcs','competes_with','VCM の主要民間スタンダード間の競合'),
  ('acr','gold-standard','competes_with','VCM の主要民間スタンダード間の競合'),
  ('acr','car','competes_with','米国 Cap-and-Trade 適格レジストリでの競合'),
  ('acr','california-cap-trade','depends_on','ARB 認証オフセットプロトコル提供'),
  ('acr','icvcm-ccp','depends_on','ACR メソドロジーも CCP で個別評価'),
  -- CAR
  ('car','verra-vcs','competes_with','VCM の主要民間スタンダード間の競合'),
  ('car','acr','competes_with','米国 Cap-and-Trade 適格レジストリでの競合'),
  ('car','california-cap-trade','depends_on','ARB 認証オフセットプロトコル提供'),
  ('car','icvcm-ccp','depends_on','CAR メソドロジーも CCP で個別評価'),
  -- ART TREES
  ('art-trees','verra-vcs','competes_with','REDD+ メソドロジーの代替設計 (jurisdictional vs project)'),
  ('art-trees','redd-plus','depends_on','Jurisdictional REDD+ クレジット発行'),
  -- Cercarbono
  ('cercarbono','verra-vcs','competes_with','VCM 民間スタンダード間競合 (地域特化)'),
  ('cercarbono','redd-plus','depends_on','REDD+ メソドロジー運用'),
  -- Isometric
  ('isometric','verra-vcs','competes_with','Engineered Removal セグメントでの競合'),
  ('isometric','dac','depends_on','DAC クレジット発行プラットフォーム'),
  ('isometric','biochar','depends_on','Biochar クレジット発行プラットフォーム'),
  ('isometric','erw','depends_on','ERW クレジット発行プラットフォーム'),
  ('isometric','microsoft','depends_on','Microsoft 等のテック大手が主要バックアップ')
) as rel(from_slug, to_slug, relation_type, notes)
join public.entities f on f.slug = rel.from_slug
join public.entities t on t.slug = rel.to_slug
on conflict (from_entity_id, to_entity_id, relation_type) do update set
  notes = excluded.notes;

commit;
