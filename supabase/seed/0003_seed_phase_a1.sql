-- Carbomir Phase A1 content expansion
-- 0001-0003 migration + 0001/0002 seed が適用済みの前提で実行する。
-- 既存 entities の relations / related_matrix_slugs を更新し、
-- 新規 6 エンティティ + 1 比較行列 + 3 タイムラインイベントを投入する。
-- すべて冪等で実行できる。

begin;

-- ============================================================
-- 既存エンティティの related_matrix_slugs を更新 (verra-vcs)
-- ============================================================
update public.entities
  set related_matrix_slugs = array['jcredit-jcm-verra','vcm-standards'],
      updated_at = now()
  where slug = 'verra-vcs';

-- ============================================================
-- 新規 6 エンティティ
-- ============================================================
insert into public.entities (
  slug, type, name_ja, name_en, abbreviation,
  summary, tags, status, last_reviewed_at,
  sections, related_matrix_slugs,
  jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit
) values
(
  'gx-ets',
  'regulation',
  'GX-ETS',
  'GX Emissions Trading Scheme',
  'GX-ETS',
  '日本の GX (グリーン・トランスフォーメーション) 政策の中核として段階的に導入される排出量取引制度。J-クレジット・JCM 等の国内クレジットを遵守目的に組み込む形で設計される。',
  array['国内制度','排出量取引','GX-ETS'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "制度の概要",
      "body": "GX-ETS は、GX 推進法 (2023 年公布) を制度的背景に持つ日本の排出量取引制度。第1フェーズ (2024-) は試行的な自主参加型として開始し、段階的に対象企業群への有償割当・本格運用へ移行する設計。J-クレジット制度および JCM の発行クレジットを遵守目的に活用できる位置付けで、国内クレジット市場の需要構造を制度的に下支えしている。",
      "source_urls": [
        { "label": "経済産業省 GX 政策", "url": "https://www.meti.go.jp/policy/energy_environment/global_warming/ggs/index.html" }
      ]
    },
    {
      "heading": "フェーズ構成",
      "body": "第1フェーズ (2024年4月-) は GX リーグ参加企業による試行段階。排出枠の自主目標設定および達成状況の公表が中心。第2フェーズ (2026年4月- 予定、要確認) で特定企業群への有償割当が始まり、本格的な排出量取引市場へ移行する想定。第3フェーズ以降の制度設計は政策議論で継続的に動く領域。"
    },
    {
      "heading": "クレジット活用",
      "body": "遵守目的の排出量調整に J-クレジット・JCM クレジット・場合により国際クレジットの活用が認められる方向で制度設計が進む。具体的な適格性・換算ルールは運用規程で定められ、最新版の参照が必須。Verra VCS や Gold Standard 等のグローバル民間クレジットの取扱は限定的とされる (2026年5月時点、要確認)。"
    },
    {
      "heading": "編集部の論点",
      "body": "GX-ETS は J-クレジット制度の需要基盤を制度的に下支えする位置付けにあり、近年の価格上昇圧力の主要因となっている。一方、対象セクター・有償割当比率・国際クレジット受入の細目は政策議論で動く領域。企業の中期排出戦略・クレジット調達計画の前提となるため、運用規程の最新版を継続的に確認することが実務上必須となる。"
    }
  ]$jsonb$::jsonb,
  array['jcredit-jcm-verra'],
  '日本',
  2024,
  '経済産業省 (GX 推進機構)',
  '日本国内',
  'https://www.meti.go.jp/policy/energy_environment/global_warming/ggs/index.html',
  '(排出量取引。遵守には J-クレジット・JCM 等を活用)'
),
(
  'redd-plus',
  'methodology',
  'REDD+',
  'Reducing Emissions from Deforestation and Forest Degradation+',
  'REDD+',
  '途上国の森林減少・劣化抑制を通じた排出削減・森林吸収によるクレジット創出メソドロジー群。Verra VCS や Gold Standard 等の主要レジストリで採用されているが、ベースライン設定の妥当性をめぐる品質議論が継続している。',
  array['森林吸収','途上国','ボランタリー市場'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "概念の概要",
      "body": "REDD+ は \"Reducing Emissions from Deforestation and forest Degradation + conservation, sustainable management of forests, and enhancement of forest carbon stocks\" の略。UNFCCC 交渉の文脈で発達した、途上国の森林由来排出を抑制する政策枠組みおよび、それをカーボンクレジット創出に応用するメソドロジー群を指す。"
    },
    {
      "heading": "メソドロジー類型",
      "body": "以下の 4 類型が代表:\n\n- **Avoided Unplanned Deforestation** (AUD) — 計画外森林減少の回避\n- **Avoided Planned Deforestation** (APD) — 計画的伐採の回避\n- **Improved Forest Management** (IFM) — 持続的森林管理への改善\n- **Afforestation, Reforestation and Revegetation** (ARR) — 新規植林・再植林・植生回復\n\nVerra VCS は **VM0007** (Jurisdictional and Nested REDD+ Framework) を含む複数の REDD+ メソドロジーを運用する。2023 年以降は統合メソドロジー (**VM0048** 等) への移行が進んでいる。"
    },
    {
      "heading": "ベースライン議論",
      "body": "クレジット発行量は \"ベースライン (REDD+ 介入がなかった場合の予想排出量)\" と実績の差として計算される。2023 年の West et al. (Science 誌) 等の学術検証で、Verra 認証 REDD+ クレジットの多くがベースラインを過大設定しているとの指摘がなされ、業界全体の品質基準見直しが進行中。",
      "source_urls": [
        { "label": "West et al. 2023 (Science)", "url": "https://www.science.org/doi/10.1126/science.ade3535" }
      ]
    },
    {
      "heading": "編集部の論点",
      "body": "REDD+ は森林保護のスケール手段として依然重要だが、品質シグナル (ICVCM CCP 適格性、メソドロジー version、permanence buffer 設計) の確認なしに購買判断するのは推奨できない。特に古い vintage (2015-2020) のクレジットは現在の品質基準で再評価される傾向にあり、購入後のレピュテーション・リスクを内包する。"
    }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (UNFCCC 枠組み + 各レジストリ)',
  2007,
  'UNFCCC (政策枠組み) + 各レジストリ (Verra / Gold Standard 等)',
  '途上国 (プロジェクト所在地)',
  'https://redd.unfccc.int/',
  '(運用レジストリのクレジット単位による)'
),
(
  'icvcm-ccp',
  'regulation',
  'ICVCM Core Carbon Principles',
  'ICVCM Core Carbon Principles',
  'CCP',
  'Integrity Council for the Voluntary Carbon Market (ICVCM) が定める任意市場の品質ガバナンス枠組み。10 原則 + メソドロジー別の Assessment Framework により、各レジストリ発行クレジットを CCP 適格 / 非適格に分類する。',
  array['国際ガバナンス','ボランタリー市場','品質基準'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "枠組みの概要",
      "body": "ICVCM は 2021 年設立の国際非営利。Voluntary Carbon Markets Integrity Initiative (**VCMI**、需要側) と対をなす **供給側ガバナンス機関** として位置付けられる。\n\nCCP (Core Carbon Principles) は 2023 年 7 月公表の **10 原則** で、主要要件は以下 (要確認: 公式リストとの一致):\n\n- **Governance** — 制度ガバナンス\n- **Tracking** — クレジット発行・移転・無効化の追跡\n- **Transparency** — 公開情報の十分性\n- **Independent Validation & Verification** — 独立第三者検証\n- **Robust Quantification** — 排出削減量・除去量の堅牢な算定\n- **Permanence** — クレジット効果の永続性\n- **Additionality** — 追加性\n- **Sustainable Development Benefits & Safeguards** — 持続可能な開発便益と保護措置\n- **Contribution to Net Zero** — ネットゼロへの貢献\n- **No Double Counting** — 二重計上の回避",
      "source_urls": [
        { "label": "ICVCM 公式", "url": "https://icvcm.org/" }
      ]
    },
    {
      "heading": "Assessment Framework",
      "body": "メソドロジー単位で CCP 適格性を判定する手続き。Verra・Gold Standard・ACR・CAR 等の主要レジストリのメソドロジーが順次評価される。CCP 適格と認定されたメソドロジー由来クレジットには CCP Eligible ラベルが付与され、品質シグナルとして機能する。"
    },
    {
      "heading": "市場への影響",
      "body": "CCP ラベルが付与された / 付与されないメソドロジー由来クレジット間で、価格・流動性に明確な差が生じる構造になっている。とりわけ REDD+ メソドロジーは複数が「CCP 適格性確認中 / 未適格」判定であり、買い手の品質審査基準として実質的に標準化されつつある。"
    },
    {
      "heading": "編集部の論点",
      "body": "CCP は VCM の品質シグナル分散を抑える機能を果たしつつあるが、業界全体の参照点として「CCP のみ見れば十分」とまでは言えない。発行レジストリのメソドロジー version、vintage、プロジェクト所在地、独立第三者検証、ICVCM の Assessment 結果書を総合的に確認するのが実務的。"
    }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (民間ガバナンス)',
  2021,
  'Integrity Council for the Voluntary Carbon Market (ICVCM)',
  'グローバル (任意市場全体)',
  'https://icvcm.org/',
  '(CCP ラベル付与、独自クレジット発行なし)'
),
(
  'gold-standard',
  'regulation',
  'Gold Standard',
  'Gold Standard',
  'GS',
  'WWF 主導で 2003 年に設立された VCM の任意品質基準。Verra VCS と並ぶ二大民間スタンダードの一角で、Sustainable Development Goals (SDGs) 連動の付加価値訴求が特徴。',
  array['国際民間スタンダード','ボランタリー市場','SDGs'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "制度の概要",
      "body": "Gold Standard は WWF を含む 80 以上の NGO の支持を得て、2003 年に設立された任意カーボンクレジット基準。発行クレジットは VER (Verified Emissions Reduction) と呼ばれる。Verra VCS と比較してプロジェクト規模は小さいが、SDGs (Sustainable Development Goals) への貢献を可視化する SDG Impact Tool がブランド差別化要素として機能している。",
      "source_urls": [
        { "label": "Gold Standard 公式", "url": "https://www.goldstandard.org/" }
      ]
    },
    {
      "heading": "主要メソドロジー",
      "body": "以下のメソドロジー領域を扱う:\n\n- **再生可能エネルギー** — 特にクリーンクッキングストーブ・コミュニティ太陽光・水浄化等の途上国コミュニティ案件\n- **エネルギー効率** — 産業・家庭部門\n- **森林・土地利用** — 植林・森林管理\n- **農業** — 堆肥化等\n\nVCS と異なり **Engineered Removal** (DAC・ERW 等) の取扱は限定的。"
    },
    {
      "heading": "市場での位置",
      "body": "クリーンクッキング系メソドロジー由来 VER は VCM 内で固有の需要ベース (CSR、コミュニティ・コベネフィット重視の企業) を持つ。価格レンジは VCS 同等の幅で、メソドロジー・vintage・所在地依存 (要確認: 直近価格レンジ)。「Gold Standard だから安心」は VCS と同様、メソドロジー個別評価なしには成立しない。"
    },
    {
      "heading": "編集部の論点",
      "body": "Verra VCS と Gold Standard は実務上「相補的」に使われる場面が多い。大量・低価格な森林案件は VCS、小規模・高ブランド価値の途上国コミュニティ案件は Gold Standard、という棲み分けが一般化。ICVCM CCP 適格性の評価結果が市場シグナルとして機能し始めており、両者の差異化要因は「メソドロジー多様性 vs SDGs 統合度」に収斂しつつある。"
    }
  ]$jsonb$::jsonb,
  array['vcm-standards'],
  'スイス (民間)',
  2003,
  'Gold Standard Foundation (本部ジュネーブ)',
  'グローバル',
  'https://www.goldstandard.org/',
  'VER (Verified Emissions Reduction)'
),
(
  'dac',
  'technology',
  'DAC (Direct Air Capture)',
  'Direct Air Capture',
  'DAC',
  '大気中の CO2 を化学吸着・吸収プロセスで直接捕集する技術。捕集した CO2 は地中貯留 (CCS) や鉱物化と組み合わせて高永続性のカーボン除去 (Engineered Removal) を実現する。商業化初期段階ながら高価格セグメントを形成。',
  array['Engineered Removal','CDR','気候技術'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "技術の概要",
      "body": "DAC は大気中の希薄な CO2 (約 420 ppm) を化学吸着剤 (固体アミン、液体ハイドロキシド等) で捕集し、加熱・減圧等で再生するプロセス。捕集 1 t-CO2 当たり必要なエネルギー (MWh) と捕集効率が技術競争の主要パラメータとなる。\n\n商業化規模では以下が代表的 (順不同):\n\n- **Climeworks** (スイス)\n- **Carbon Engineering** (カナダ)\n- **Heirloom** (米)\n- **Mission Zero Technologies** (英)\n\nこれら以外にも各国でスタートアップが台頭している。"
    },
    {
      "heading": "クレジット化",
      "body": "捕集した CO2 を地中貯留 (CCS) または鉱物化 (Mineralization) と組み合わせて発行する CDR (Carbon Dioxide Removal) クレジットが市場形成中。Verra VCS は Engineered Removal 系メソドロジーを整備しており、CAR (Climate Action Reserve) も同様の動き。Permanence (永続性) が森林系を圧倒する一方、価格が 100-600 USD/t-CO2 と高く、調達は前払い契約・長期 offtake が中心。"
    },
    {
      "heading": "市場動向",
      "body": "Microsoft、JPMorgan、Stripe 等のテック大手が前払い契約 (offtake agreement) で需要を創出。Climeworks の Mammoth プラント (2024 年稼働、アイスランド) が現時点の最大規模 (年 36,000 t 級)。米 Inflation Reduction Act の 45Q 税額控除 (DAC + 地中貯留で 180 USD/t、要確認: 制度詳細・最新値) が北米プロジェクト経済性の支柱になっている。"
    },
    {
      "heading": "編集部の論点",
      "body": "DAC は森林由来クレジットの品質リスク (ベースライン・永続性) から距離を置きたい買い手の最重要選択肢。一方、エネルギー集約度・スケール課題・コスト低減ペースは技術別に大きく異なるため、DAC と一括りにせずプロセス別 (固体 / 液体)、ベンダー別の精査が必要。長期 offtake では vintage 設計と価格上昇シナリオの整合が重要論点。"
    }
  ]$jsonb$::jsonb,
  array[]::text[],
  '(技術領域。中央管轄なし)',
  1999,
  '(各事業者: Climeworks / Carbon Engineering / Heirloom 等)',
  'グローバル',
  null,
  '(Engineered Removal credits、各レジストリ経由)'
),
(
  'plan-vivo',
  'regulation',
  'Plan Vivo',
  'Plan Vivo',
  null,
  '1990 年代発祥の VCM 認証基準。コミュニティ主導の小規模森林・土地利用プロジェクトに特化し、参加コミュニティへの便益還元と参加型ガバナンスを重視する。',
  array['国際民間スタンダード','ボランタリー市場','コミュニティベース'],
  'published',
  '2026-05-21',
  $jsonb$[
    {
      "heading": "制度の概要",
      "body": "Plan Vivo は 1990 年代にエジンバラ大学で開発された方式を起源とし、現在は英国の Plan Vivo Foundation が運営。クレジット単位は PVC (Plan Vivo Certificate) で、コミュニティ主導の小規模アグロフォレストリー・森林管理プロジェクトに特化している。",
      "source_urls": [
        { "label": "Plan Vivo Foundation", "url": "https://www.planvivo.org/" }
      ]
    },
    {
      "heading": "差別化要素",
      "body": "プロジェクト便益の最低 60% を参加コミュニティに還元することを義務付け、参加型ガバナンス (Producer Group Governance) を制度に組み込む。これは Verra VCS や Gold Standard と比較して顕著に強い社会的便益分配規範。"
    },
    {
      "heading": "市場での位置",
      "body": "発行量・流通量は VCS の数十分の一規模で、機関買い手による大口取引よりも、特定企業の CSR・サステナビリティブランド案件としての需要が中心。価格レンジは 10-30 USD/t 程度の幅 (要確認: 直近実勢)。"
    },
    {
      "heading": "編集部の論点",
      "body": "Plan Vivo は規模よりも「コミュニティへの便益分配」のストーリーで採用される傾向が強い。買い手企業のサステナビリティ報告で「社会的便益のあるクレジット」を差別化要素として位置付けたい場合の選択肢。VCS や Gold Standard の代替ではなく、ポートフォリオの一部として組み合わせる前提で評価するのが実務的。"
    }
  ]$jsonb$::jsonb,
  array['vcm-standards'],
  '英国 (民間)',
  1994,
  'Plan Vivo Foundation (本部エディンバラ)',
  '途上国コミュニティ案件中心',
  'https://www.planvivo.org/',
  'PVC (Plan Vivo Certificate)'
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
  updated_at = now();

-- ============================================================
-- entity_relations 追加
-- ============================================================
insert into public.entity_relations (from_entity_id, to_entity_id, relation_type, notes)
select f.id, t.id, rel.relation_type, rel.notes
from (values
  ('jcredit','gx-ets','depends_on','GX-ETS の遵守クレジットとして組込'),
  ('jcm','gx-ets','depends_on','GX-ETS の遵守クレジットとして組込'),
  ('verra-vcs','gold-standard','competes_with','VCM の二大民間スタンダード'),
  ('verra-vcs','plan-vivo','competes_with','規模感は小さいがコミュニティ案件で差別化'),
  ('verra-vcs','redd-plus','parent_of','VCS で主要メソドロジー群として運用'),
  ('verra-vcs','icvcm-ccp','depends_on','VCS 発行クレジットの品質を CCP で個別評価'),
  ('verra-vcs','dac','parent_of','Engineered Removal メソドロジーで運用'),
  ('gx-ets','jcredit','depends_on','遵守クレジットとして組込'),
  ('gx-ets','jcm','depends_on','遵守クレジットとして組込'),
  ('redd-plus','verra-vcs','depends_on','VCS で主要メソドロジー群として運用'),
  ('redd-plus','icvcm-ccp','depends_on','CCP 適格性が個別に評価される'),
  ('icvcm-ccp','verra-vcs','supersedes','VCS 発行クレジットの個別評価基準として機能'),
  ('icvcm-ccp','redd-plus','supersedes','メソドロジー単位で CCP 適格性を判定'),
  ('gold-standard','verra-vcs','competes_with','VCM の二大民間スタンダード'),
  ('gold-standard','icvcm-ccp','depends_on','Gold Standard メソドロジーも CCP で個別評価'),
  ('dac','verra-vcs','depends_on','VCS で Engineered Removal メソドロジーを運用'),
  ('plan-vivo','verra-vcs','competes_with','規模感は小さいがコミュニティ案件で差別化'),
  ('plan-vivo','gold-standard','competes_with','SDGs 連動の競合スタンダード')
) as rel(from_slug, to_slug, relation_type, notes)
join public.entities f on f.slug = rel.from_slug
join public.entities t on t.slug = rel.to_slug
on conflict (from_entity_id, to_entity_id, relation_type) do update set
  notes = excluded.notes;

-- ============================================================
-- VCM スタンダード比較行列
-- ============================================================
insert into public.comparison_matrices (
  slug, title, description,
  dimensions, entity_ids, entity_refs, cells,
  status, last_reviewed_at, category, tags
) values (
  'vcm-standards',
  'VCM 主要スタンダード比較 (Verra VCS / Gold Standard / Plan Vivo)',
  '任意市場 (VCM) で実務上参照される 3 つの民間品質スタンダードの比較。発行規模、メソドロジー特性、品質シグナル、社会的便益分配等の軸で対比し、調達ポートフォリオ設計の前提を整理する。',
  $jsonb$[
    { "key": "scope", "label_ja": "対象スコープ", "description": "どの種類のプロジェクトを主に扱うか" },
    { "key": "scale", "label_ja": "発行・流通規模" },
    { "key": "methodology_breadth", "label_ja": "メソドロジー多様性", "description": "森林・再エネ・除去技術等の網羅範囲" },
    { "key": "community_benefit", "label_ja": "コミュニティ便益分配", "description": "プロジェクト便益の現地還元規範" },
    { "key": "ccp_status", "label_ja": "ICVCM CCP 適格性", "description": "メソドロジー別個別評価。最新の Assessment 結果を要確認" },
    { "key": "price_range", "label_ja": "価格レンジ参考", "description": "メソドロジー・vintage 大幅依存" },
    { "key": "carbomir_quality_view", "label_ja": "Carbomir 編集部の品質観" }
  ]$jsonb$::jsonb,
  (
    select array_agg(e.id order by s.ord)
    from unnest(array['verra-vcs','gold-standard','plan-vivo']::text[]) with ordinality as s(slug_in, ord)
    join public.entities e on e.slug = s.slug_in
  ),
  $jsonb$[
    { "slug": "verra-vcs", "name_ja": "Verra (VCS)", "name_en": "Verified Carbon Standard" },
    { "slug": "gold-standard", "name_ja": "Gold Standard", "name_en": "Gold Standard" },
    { "slug": "plan-vivo", "name_ja": "Plan Vivo", "name_en": "Plan Vivo" }
  ]$jsonb$::jsonb,
  $jsonb$
  {
    "verra-vcs": {
      "scope": { "value": "森林・土地利用 (REDD+ 等)、再エネ、省エネ、Engineered Removal を網羅", "source_url": "https://verra.org/programs/verified-carbon-standard/", "source_label": "Verra VCS Program" },
      "scale": { "value": "市場最大規模 (発行量・流通量で長年首位)" },
      "methodology_breadth": { "value": "極めて広い。再エネ・REDD+・ARR・IFM・DAC・ERW・Biochar 等。VM 番号で個別管理" },
      "community_benefit": { "value": "メソドロジーによる。CCB Standards 併用案件で社会便益の独立評価可", "note": "Plan Vivo のような全プロジェクト一律の還元規範はない" },
      "ccp_status": { "value": "メソドロジー別評価が進行中。REDD+ の旧 vintage は適格性議論の中心" },
      "price_range": { "value": "REDD+ で 3-15 USD/t、再エネで 1-5 USD/t、Engineered Removal で 100-600 USD/t (2026年初頭参考)" },
      "carbomir_quality_view": { "value": "規模・多様性で市場標準だが、メソドロジー間の品質差が極めて大きい。個別案件の評価必須", "note": "個別評価は株式会社クレイドルトゥー CDR 調達アドバイザリーへ" }
    },
    "gold-standard": {
      "scope": { "value": "途上国コミュニティ案件 (クリーンクッキング・小規模再エネ)、農業、森林・土地利用", "source_url": "https://www.goldstandard.org/", "source_label": "Gold Standard 公式" },
      "scale": { "value": "VCS の数分の一規模、ニッチ需要セグメントで存在感" },
      "methodology_breadth": { "value": "中程度。Engineered Removal の取扱は限定的" },
      "community_benefit": { "value": "SDG Impact Tool で SDGs 貢献を可視化、付加価値訴求" },
      "ccp_status": { "value": "メソドロジー別評価が進行中。クリーンクッキング系で個別判定あり (要確認)" },
      "price_range": { "value": "クリーンクッキング系で 10-25 USD/t、再エネで 3-10 USD/t 程度 (要確認: 直近実勢)" },
      "carbomir_quality_view": { "value": "SDGs 連動の付加価値が買い手企業の説明可能性を強化する場面で有用" }
    },
    "plan-vivo": {
      "scope": { "value": "コミュニティ主導の小規模森林・土地利用・アグロフォレストリー", "source_url": "https://www.planvivo.org/", "source_label": "Plan Vivo Foundation" },
      "scale": { "value": "VCS の数十分の一規模、特定需要に特化" },
      "methodology_breadth": { "value": "狭い。森林・土地利用に絞り込み" },
      "community_benefit": { "value": "プロジェクト便益の最低 60% をコミュニティに還元する義務 + 参加型ガバナンス", "note": "Carbomir 編集部の知る限り業界最強の還元規範" },
      "ccp_status": { "value": "CCP 評価は限定的 (規模・適用範囲の関係)。CCP 適格性以外の独自シグナルが主軸" },
      "price_range": { "value": "10-30 USD/t 程度 (要確認: 直近実勢)" },
      "carbomir_quality_view": { "value": "規模よりも社会的便益分配のストーリーで採用される選択肢。ポートフォリオの一部として組み合わせる前提で評価" }
    }
  }
  $jsonb$::jsonb,
  'published',
  '2026-05-21',
  'standard',
  array['国際民間スタンダード','ボランタリー市場','品質基準']
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  dimensions = excluded.dimensions,
  entity_ids = excluded.entity_ids,
  entity_refs = excluded.entity_refs,
  cells = excluded.cells,
  status = excluded.status,
  last_reviewed_at = excluded.last_reviewed_at,
  category = excluded.category,
  tags = excluded.tags,
  updated_at = now();

-- ============================================================
-- タイムライン 3 件
-- ============================================================
insert into public.timeline_events (
  slug, event_date, title, summary,
  category, importance, status,
  affected_entity_ids, affected_entity_slugs, source_urls
) values
(
  '2015-12-paris-agreement-adoption',
  '2015-12-12',
  'パリ協定 (Paris Agreement) 採択',
  'COP21 (パリ) で 196 締約国により採択。第 6 条で国際的に移転される緩和成果 (ITMOs) およびメカニズム ベースのクレジット (6.4) の枠組みを定め、JCM など二国間制度の国際的位置付けの法的基礎を提供する。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcm')),
  array['jcm'],
  $jsonb$[{"label": "UNFCCC Paris Agreement", "url": "https://unfccc.int/process-and-meetings/the-paris-agreement"}]$jsonb$::jsonb
),
(
  '2021-11-cop26-article6-rulebook',
  '2021-11-13',
  'COP26 でパリ協定 6 条運用ルール (Rulebook) 合意',
  'グラスゴーで開催の COP26 で、パリ協定 6.2 (協調的アプローチ) および 6.4 (パリメカニズム) の運用ルールが採択。JCM をはじめとする二国間制度・市場メカニズムの透明性・二重計上回避ルールが具体化された。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcm')),
  array['jcm'],
  $jsonb$[{"label": "UNFCCC COP26 outcomes", "url": "https://unfccc.int/conference/glasgow-climate-change-conference-october-november-2021"}]$jsonb$::jsonb
),
(
  '2024-05-climeworks-mammoth',
  '2024-05-08',
  'Climeworks Mammoth プラント稼働開始',
  'アイスランドで Climeworks が年間 36,000 t 級の DAC + 鉱物化貯留プラント Mammoth を稼働。当時時点で世界最大規模の商業 DAC 施設で、長期 offtake 契約による Engineered Removal クレジット供給拡大の節目に位置付けられる (要確認: 公表値の最新性)。',
  'technology', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('dac')),
  array['dac'],
  $jsonb$[{"label": "Climeworks Mammoth (公式)", "url": "https://climeworks.com/plant/mammoth"}]$jsonb$::jsonb
)
on conflict (slug) do update set
  event_date = excluded.event_date,
  title = excluded.title,
  summary = excluded.summary,
  category = excluded.category,
  importance = excluded.importance,
  status = excluded.status,
  affected_entity_ids = excluded.affected_entity_ids,
  affected_entity_slugs = excluded.affected_entity_slugs,
  source_urls = excluded.source_urls,
  updated_at = now();

commit;
