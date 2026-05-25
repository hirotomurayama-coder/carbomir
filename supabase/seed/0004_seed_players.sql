-- Carbomir seed: players (Phase B1)
-- 0006 migration (player 属性) 適用後に実行。
-- レジストリ運営者・DAC 事業者・大手需要家・国内取扱業者の 10 件を投入する。

begin;

insert into public.entities (
  slug, type, name_ja, name_en, abbreviation,
  summary, tags, status, last_reviewed_at,
  sections, related_matrix_slugs,
  jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit,
  parent_company, business_role
) values
(
  'verra-org', 'player', 'Verra (組織)', 'Verra', null,
  'VCS (Verified Carbon Standard) を運営する米国非営利。VCM の世界最大級レジストリ。',
  array['レジストリ運営','国際民間スタンダード'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "組織の概要", "body": "Verra は VCM (任意カーボン市場) で発行量・流通量ともに最大級のクレジット標準である VCS を運営する米国非営利。2005 年に The Climate Group、WBCSD、IETA が共同で設立した VCS Association から派生し、現在は Verra として単独運営。", "source_urls": [{ "label": "Verra 公式", "url": "https://verra.org/" }] },
    { "heading": "事業展開", "body": "発行クレジットの累計発行量は 10 億 VCU 規模 (要確認: 最新数値)。160 か国以上でプロジェクトを認証。2023 年以降の REDD+ 品質議論を受け、メソドロジー統合 (VM0048 等) を継続中。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国', 2007, null, 'グローバル', 'https://verra.org/', null,
  null, 'レジストリ運営'
),
(
  'gold-standard-foundation', 'player', 'Gold Standard Foundation', 'Gold Standard Foundation', null,
  'Gold Standard スタンダードを運営するスイスの財団。WWF を含む 80 以上の NGO の支持を得て 2003 年に設立。',
  array['レジストリ運営','国際民間スタンダード','SDGs'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "組織の概要", "body": "WWF を中心とする 80 以上の NGO の支持の下、2003 年に設立。本部はジュネーブ。VCS と並ぶ VCM の二大民間スタンダード。SDGs 連動の付加価値訴求が組織アイデンティティ。", "source_urls": [{ "label": "Gold Standard 公式", "url": "https://www.goldstandard.org/" }] }
  ]$jsonb$::jsonb,
  array[]::text[],
  'スイス', 2003, null, 'グローバル', 'https://www.goldstandard.org/', null,
  null, 'レジストリ運営'
),
(
  'plan-vivo-foundation', 'player', 'Plan Vivo Foundation', 'Plan Vivo Foundation', null,
  'Plan Vivo を運営する英国財団。コミュニティ主導の小規模森林・土地利用プロジェクトに特化したレジストリ。',
  array['レジストリ運営','国際民間スタンダード','コミュニティベース'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "組織の概要", "body": "1990 年代にエジンバラ大学で開発された手法を起源とし、現在は Plan Vivo Foundation として本部エディンバラで運営。プロジェクト便益の最低 60% を参加コミュニティに還元する独自規範を持つ。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '英国', 1994, null, 'グローバル (途上国コミュニティ中心)', 'https://www.planvivo.org/', null,
  null, 'レジストリ運営'
),
(
  'icvcm-org', 'player', 'ICVCM (組織)', 'Integrity Council for the Voluntary Carbon Market', 'ICVCM',
  '任意市場の品質ガバナンス枠組み Core Carbon Principles (CCP) を策定・運営する国際非営利。2021 年設立。',
  array['国際ガバナンス','品質基準'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "組織の概要", "body": "Voluntary Carbon Markets Integrity Initiative (VCMI、需要側) と対をなす供給側ガバナンス機関として 2021 年設立。CCP は 2023 年 7 月に公表され、Verra・Gold Standard 等のメソドロジーを順次評価している。", "source_urls": [{ "label": "ICVCM 公式", "url": "https://icvcm.org/" }] }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (英国本部)', 2021, null, 'グローバル (VCM 全体)', 'https://icvcm.org/', null,
  null, '国際ガバナンス'
),
(
  'climeworks', 'player', 'Climeworks', 'Climeworks AG', null,
  'スイス本拠の DAC 事業者。世界最大規模の商業 DAC プラント Mammoth (アイスランド、2024 年稼働) を運営。',
  array['DAC','Engineered Removal','CDR'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "事業の概要", "body": "ETH Zurich 出身者により 2009 年設立。固体アミン系吸着剤を用いた DAC プラントを運営。地中貯留パートナー Carbfix と組んでアイスランドで Orca (2021)、Mammoth (2024 年稼働、年 36,000 t 級) を運用。", "source_urls": [{ "label": "Climeworks 公式", "url": "https://climeworks.com/" }] },
    { "heading": "オフテイク契約", "body": "Microsoft、JPMorgan、Stripe、Swiss Re、Boston Consulting Group 等の大手企業と長期 offtake 契約 (要確認: 最新ラインナップ)。クレジットは Verra VCS や Puro.earth 等のレジストリを通じて発行。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  'スイス', 2009, null, 'グローバル (主にアイスランド・米国)', 'https://climeworks.com/', null,
  '独立 (非公開、スイス本拠)', 'DAC 事業者'
),
(
  'carbon-engineering', 'player', 'Carbon Engineering', 'Carbon Engineering Ltd.', null,
  'カナダ本拠の DAC 事業者。液体ハイドロキシド方式が特徴。2023 年に Occidental Petroleum 傘下入り (要確認)。',
  array['DAC','Engineered Removal','CDR'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "事業の概要", "body": "ハーバード大学物理学者の David Keith により 2009 年に設立。液体ハイドロキシド (KOH) を用いた DAC プロセスを開発。2023 年に Occidental Petroleum 傘下の 1PointFive と組み、テキサスで世界最大級の DAC プラント STRATOS の建設を進めている (要確認: 稼働状況)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  'カナダ', 2009, null, '北米中心', 'https://carbonengineering.com/', null,
  'Occidental Petroleum (2023 年買収、要確認)', 'DAC 事業者'
),
(
  'microsoft', 'player', 'Microsoft', 'Microsoft Corporation', null,
  '大手テック企業。長期 CDR offtake 契約 (DAC・Biochar・Engineered Removal 等) で Engineered Removal 市場の最大需要家。2030 年 Carbon Negative 目標を掲げる。',
  array['需要家','CDR','テック大手'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "カーボン戦略", "body": "2020 年に 2030 年までの Carbon Negative 目標を宣言。Microsoft Climate Innovation Fund (10 億ドル規模) を通じて Engineered Removal の長期 offtake 契約を多数締結。Carbon Engineering、Climeworks、Heirloom 等の DAC 事業者および Biochar・ERW 事業者と契約 (要確認: 最新ラインナップ)。", "source_urls": [{ "label": "Microsoft Sustainability", "url": "https://www.microsoft.com/sustainability" }] }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国', 1975, null, 'グローバル', 'https://www.microsoft.com/sustainability', null,
  null, '大手需要家 (CDR offtake)'
),
(
  'mitsubishi-corporation', 'player', '三菱商事', 'Mitsubishi Corporation', null,
  '日本の総合商社。カーボンクレジットの取扱・組成・販売を含むカーボンビジネス事業を展開。J-クレジット・JCM・国際クレジットを横断的に扱う。',
  array['商社','国内取扱業者','クレジット販売'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "事業の概要", "body": "総合商社として、エネルギー・素材・脱炭素技術を含む幅広い領域を扱う。カーボンクレジット事業は再生可能エネルギー部門・脱炭素ソリューション部門等を中心に展開。事業会社向けのクレジット調達支援および海外プロジェクト組成を行う (要確認: 直近の体制)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '日本', 1950, null, 'グローバル', 'https://www.mitsubishicorp.com/', null,
  null, '国内取扱業者 (商社)'
),
(
  'mitsui-co', 'player', '三井物産', 'Mitsui & Co.', null,
  '日本の総合商社。脱炭素ソリューションの一環としてカーボンクレジット事業を展開。',
  array['商社','国内取扱業者'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "事業の概要", "body": "総合商社として、エネルギー・素材分野での脱炭素事業を展開。Carbon Neutral & Energy 部門でカーボンクレジット取扱・プロジェクト組成・需給仲介を行う (要確認: 最新の組織体制)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '日本', 1947, null, 'グローバル', 'https://www.mitsui.com/', null,
  null, '国内取扱業者 (商社)'
),
(
  'byowill', 'player', 'バイウィル', 'byowill', null,
  '日本のクレジット創出・販売プラットフォーム事業者。J-クレジット創出支援とマーケットプレイスを運営。',
  array['国内プラットフォーム','J-クレジット','クレジット販売'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "事業の概要", "body": "国内クレジット (主に J-クレジット) の創出支援とマーケットプレイスを運営。中小規模の発行者と需要家を繋ぐ役割を担う。設立年・組織体制は要確認 (公表情報の精緻化が必要)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '日本', 2021, null, '日本国内', 'https://byowill.com/', null,
  null, '国内取扱業者 (プラットフォーム)'
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
  related_matrix_slugs = excluded.related_matrix_slugs,
  jurisdiction = excluded.jurisdiction,
  established_year = excluded.established_year,
  operator = excluded.operator,
  geographic_scope = excluded.geographic_scope,
  website_url = excluded.website_url,
  credit_unit = excluded.credit_unit,
  parent_company = excluded.parent_company,
  business_role = excluded.business_role,
  updated_at = now();

-- ============================================================
-- entity_relations (player → 既存 entity)
-- ============================================================
insert into public.entity_relations (from_entity_id, to_entity_id, relation_type, notes)
select f.id, t.id, rel.relation_type, rel.notes
from (values
  ('verra-org','verra-vcs','parent_of','VCS スタンダードを運営'),
  ('gold-standard-foundation','gold-standard','parent_of','Gold Standard スタンダードを運営'),
  ('plan-vivo-foundation','plan-vivo','parent_of','Plan Vivo スタンダードを運営'),
  ('icvcm-org','icvcm-ccp','parent_of','CCP 枠組みを策定・運営'),
  ('climeworks','dac','depends_on','DAC 技術の代表事業者'),
  ('carbon-engineering','dac','depends_on','DAC 技術の代表事業者 (液体方式)'),
  ('microsoft','dac','depends_on','DAC クレジットの長期 offtake'),
  ('microsoft','climeworks','depends_on','Climeworks との offtake 契約あり'),
  ('mitsubishi-corporation','jcredit','depends_on','国内クレジットの主要取扱業者'),
  ('mitsui-co','jcredit','depends_on','国内クレジットの取扱業者'),
  ('byowill','jcredit','depends_on','J-クレジットの主要取扱プラットフォーム')
) as rel(from_slug, to_slug, relation_type, notes)
join public.entities f on f.slug = rel.from_slug
join public.entities t on t.slug = rel.to_slug
on conflict (from_entity_id, to_entity_id, relation_type) do update set
  notes = excluded.notes;

commit;
