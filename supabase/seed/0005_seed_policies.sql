-- Carbomir seed: 海外/国際 制度 (Phase B2)
-- 0007 migration (policy_status, next_milestone) 適用後に実行。
-- EU ETS / CBAM / California / IRA 45Q / Article 6.2 / Article 6.4 / K-ETS / 中国 ETS の 8 件。

begin;

insert into public.entities (
  slug, type, name_ja, name_en, abbreviation,
  summary, tags, status, last_reviewed_at,
  sections, related_matrix_slugs,
  jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit,
  parent_company, business_role, policy_status, next_milestone
) values
(
  'eu-ets', 'regulation', 'EU 排出量取引制度', 'EU Emissions Trading System', 'EU ETS',
  'EU の排出量取引制度。2005 年開始、世界最大規模・最古参の cap-and-trade 制度。Phase 4 (2021-2030) 運用中で、対象セクター拡大と無償割当削減が進む。',
  array['EU 制度','排出量取引','Cap and Trade'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "EU 排出量取引制度 (EU ETS) は 2005 年に開始された世界最大規模の cap-and-trade 制度。発電・産業・域内航空を対象とし、対象企業に毎年の排出枠 (EUA) を割当・取引させる。Phase 1 (2005-2007) パイロット、Phase 2 (2008-2012)、Phase 3 (2013-2020) を経て、現在 Phase 4 (2021-2030) 運用中。2030 年に 2005 年比 -62% 削減を目標。", "source_urls": [{ "label": "European Commission EU ETS", "url": "https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en" }] },
    { "heading": "Phase 4 の論点", "body": "Market Stability Reserve (MSR) による余剰枠吸収、無償割当の段階的削減、CBAM との接続、海運セクターの統合 (2024-)、ビルディング・道路輸送セクターの新規 ETS2 (2027 年予定) など、制度拡張が継続中。" },
    { "heading": "編集部の論点", "body": "EU ETS の価格動向は国際的なクレジット価格水準のベンチマークとして機能する。日本企業にも、EU 域内事業・サプライチェーン経由で影響。CBAM (国境調整) との一体運用で「EU 市場へのアクセス = EU ETS 価格を反映したコスト」という構造が固まりつつある。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  'EU', 2005, 'European Commission', 'EU 加盟国 + アイスランド・リヒテンシュタイン・ノルウェー', 'https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en', 'EUA (EU Allowance)',
  null, null, 'active', '2026: 航空セクター無償割当の段階的廃止、海運の本格統合 (要確認)'
),
(
  'cbam', 'regulation', 'EU CBAM', 'Carbon Border Adjustment Mechanism', 'CBAM',
  'EU の国境炭素調整メカニズム。域外から EU に輸入される一定対象品目に対し、域内産品との炭素価格差を調整する。2023-2025 移行期間、2026 本格運用開始予定。',
  array['EU 制度','国境調整','輸入規制'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "CBAM は EU の Carbon Leakage 対策として導入された。対象品目 (鉄鋼・アルミニウム・セメント・肥料・水素・電力) を EU 域外から輸入する事業者は、域内産品と同等の炭素価格を CBAM 証書として支払う必要がある。移行期間 (2023-10 〜 2025-12) は報告義務のみ、本格運用 (2026-) で証書購入が義務化される。", "source_urls": [{ "label": "European Commission CBAM", "url": "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en" }] },
    { "heading": "対象拡大の議論", "body": "現状の対象 6 品目に加え、化学品・有機化学品・ポリマー等への拡大が検討されている (要確認: 最新法案ステータス)。最終消費財への適用は依然議論段階。" },
    { "heading": "編集部の論点", "body": "日本企業の EU 輸出案件 (鉄鋼・自動車部品・素材) で実務影響大。サプライチェーン全体の炭素計算 (Scope 3 含む) の精緻化が必要に。CBAM 対応コストは事実上の輸出関税として価格転嫁圧力を生む。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  'EU', 2023, 'European Commission (DG TAXUD)', 'EU 輸入品 (鉄鋼・アルミ・セメント・肥料・電力・水素等)', 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en', 'CBAM 証書 (CBAM Certificate)',
  null, null, 'transition', '2026-01: 本格運用開始、輸入者の CBAM 証書購入義務化 (要確認)'
),
(
  'california-cap-trade', 'regulation', 'California Cap-and-Trade', 'California Cap-and-Trade Program', null,
  '米国カリフォルニア州の排出量取引制度。AB 32 (2006) 制定、2013 年開始。州レベル ETS として米国最大規模、ケベック州と連携。',
  array['米国制度','排出量取引','州レベル'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "AB 32 (Global Warming Solutions Act, 2006) を法的根拠とし、CARB が運営。発電・大規模産業・燃料供給を対象。WCI (Western Climate Initiative) を通じてケベック州と市場統合済み。米国連邦レベル ETS が存在しない中、州レベルでは最大の cap-and-trade。", "source_urls": [{ "label": "CARB Cap-and-Trade", "url": "https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program" }] },
    { "heading": "オフセット制度", "body": "排出枠の最大 4% (Phase 4) までを Compliance Offset として使用可能。CAR (Climate Action Reserve) や ACR (American Carbon Registry) 発行のクレジットが認証されたメソドロジー由来であれば適格。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国カリフォルニア州', 2013, 'California Air Resources Board (CARB)', 'California + Quebec (Western Climate Initiative)', 'https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program', 'California Carbon Allowance (CCA)',
  null, null, 'active', '2030: 1990 年比 -40% 目標達成に向けたキャップ強化 (要確認)'
),
(
  'ira-45q', 'regulation', '米国 IRA 45Q 税額控除', 'U.S. IRA Section 45Q Tax Credit', '45Q',
  '米国 Inflation Reduction Act (2022) で大幅拡充された CCS / CCUS / DAC 向けの税額控除制度。DAC + 地中貯留で最大 180 USD/t-CO2、CCS で最大 85 USD/t-CO2。',
  array['米国制度','税額控除','CCS','DAC'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "Section 45Q は米国内国歳入法に基づく税額控除で、CCS (Carbon Capture and Storage)、CCUS (CCS + Utilization)、DAC (Direct Air Capture) プロジェクトに対し、捕集・貯留した CO2 量に応じて税額控除を提供する。2022 年 IRA で控除率が大幅拡大され、DAC + 地中貯留で 180 USD/t-CO2、CCS で 85 USD/t-CO2 が上限 (要確認: 詳細条件)。", "source_urls": [{ "label": "IRS Section 45Q", "url": "https://www.irs.gov/businesses/section-45q-credit-for-carbon-oxide-sequestration" }] },
    { "heading": "編集部の論点", "body": "DAC 経済性の支柱として機能している。Climeworks、Carbon Engineering、Heirloom 等の米国プロジェクト経済性は 45Q なしには成立しない水準。2032 年の建設開始期限に向けたプロジェクト集中が見込まれる。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '米国', 2008, 'U.S. Internal Revenue Service (IRS) + U.S. Department of Energy (DOE)', '米国', 'https://www.irs.gov/businesses/section-45q-credit-for-carbon-oxide-sequestration', '税額控除 (tax credit)',
  null, null, 'active', '2032 までの建設開始がクレジット要件 (12 年間の控除期間、要確認)'
),
(
  'paris-article-6-2', 'regulation', 'パリ協定 6.2 条 (協調的アプローチ)', 'Paris Agreement Article 6.2 (Cooperative Approaches)', 'Article 6.2',
  'パリ協定第 6 条 2 項。締約国間で国際的に移転される緩和成果 (ITMOs) を NDC 達成に活用する協調的アプローチ。JCM が代表例。',
  array['国際','パリ協定','二国間'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "枠組みの概要", "body": "パリ協定第 6 条 2 項は、締約国が自発的に協調する形で実施する排出削減プロジェクトの成果 (ITMOs) を、参加国の NDC 達成に活用できる枠組み。日本の JCM、スイス・ペルー、シンガポール・ガーナ等の二国間協定が代表例。COP26 (2021) でルールブック合意。", "source_urls": [{ "label": "UNFCCC Article 6 Cooperative Implementation", "url": "https://unfccc.int/process-and-meetings/the-paris-agreement/cooperative-implementation" }] },
    { "heading": "Corresponding Adjustment", "body": "ITMO を発行 (移転) した側の国は、自国の NDC からその分を差し引く必要がある (Corresponding Adjustment)。これにより二重計上を回避する設計。これは VCM (任意市場) クレジットとの大きな違い。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (UNFCCC 締約国間)', 2015, 'UNFCCC + 締約国', 'グローバル (締約国間)', 'https://unfccc.int/process-and-meetings/the-paris-agreement/cooperative-implementation', 'ITMO (Internationally Transferred Mitigation Outcomes)',
  null, null, 'active', '各国の二国間協定締結が継続中 (要確認: 主要協定の進捗)'
),
(
  'paris-article-6-4', 'regulation', 'パリ協定 6.4 条 (PACM)', 'Paris Agreement Article 6.4 (Paris Agreement Crediting Mechanism)', 'Article 6.4 / PACM',
  'パリ協定第 6 条 4 項。京都議定書 CDM の後継となる国際市場メカニズム。UNFCCC 監督下の Supervisory Body が運営し、PACM クレジットを発行。',
  array['国際','パリ協定','市場メカニズム'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "枠組みの概要", "body": "京都議定書下の CDM (Clean Development Mechanism) の後継として位置付けられる国際市場メカニズム。COP24 (2018) で構想合意、COP26 (2021) でルール合意、その後 Supervisory Body によるメソドロジー基準・除去活動基準等の段階的採択を経て、初の発行に向けた準備段階。", "source_urls": [{ "label": "UNFCCC Article 6.4 Mechanism", "url": "https://unfccc.int/process-and-meetings/the-paris-agreement/article-64-mechanism" }] },
    { "heading": "CDM 移行", "body": "京都議定書 CDM の登録プロジェクトのうち、所定の条件を満たすものは Article 6.4 への移行が認められる。これにより既存プロジェクトの継続活用と新規発行の両立を図る。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (UNFCCC)', 2015, 'UNFCCC Article 6.4 Supervisory Body', 'グローバル', 'https://unfccc.int/process-and-meetings/the-paris-agreement/article-64-mechanism', 'PACM クレジット',
  null, null, 'pilot', '2025-: 初の PACM クレジット発行開始予定 (要確認: 最新進捗)'
),
(
  'k-ets', 'regulation', '韓国 K-ETS', 'Korea Emissions Trading Scheme', 'K-ETS',
  '韓国の全国排出量取引制度。2015 年開始、アジア初の全国 cap-and-trade。Phase 3 (2021-2025) 運用中。',
  array['韓国制度','排出量取引'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "韓国温室効果ガス排出量取引制度法 (2012) を法的根拠とし、2015 年 1 月開始。アジアで最初の全国 cap-and-trade。発電・産業・建物・廃棄物・輸送等を対象に、全国排出量の約 70-75% をカバー。Phase 1 (2015-2017)、Phase 2 (2018-2020)、Phase 3 (2021-2025) と段階的に進んできた。" },
    { "heading": "オフセット", "body": "韓国国内排出削減プロジェクト (KOC: Korean Offset Credit) および海外プロジェクト (限定的範囲) のオフセット使用可。最大使用比率は Phase ごとに調整される。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '韓国', 2015, 'Ministry of Environment of Korea', '韓国', 'https://www.gir.go.kr/', 'KAU (Korean Allowance Unit)',
  null, null, 'active', '2026-: Phase 4 開始、無償割当縮小と有償割当拡大 (要確認)'
),
(
  'china-national-ets', 'regulation', '中国全国 ETS', 'China National Emissions Trading Scheme', null,
  '中国全国排出量取引制度。2021 年運用開始、世界最大規模の ETS (排出量カバー率 = 全国の約 40%)。当初は発電セクターのみ、段階的拡大が進む。',
  array['中国制度','排出量取引'],
  'published', '2026-05-22',
  $jsonb$[
    { "heading": "制度の概要", "body": "8 地域パイロット ETS (2013-2020) を経て、2021 年 7 月に全国 ETS が運用開始。当初対象は発電セクターのみだが、約 2,000 社・40 億トン規模で世界最大の ETS。原単位ベース (rate-based) の割当方式が特徴で、絶対量上限 (cap) を持つ EU ETS とは制度設計が異なる。" },
    { "heading": "対象拡大の動き", "body": "鉄鋼・化学・セメント・アルミ・紙等の対象セクター拡大が計画されている。CCER (中国独自オフセットクレジット制度) は 2017 年に新規発行停止していたが 2024 年に再開、対象メソドロジーも拡大。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '中国', 2021, 'Ministry of Ecology and Environment of China', '中国', 'https://english.mee.gov.cn/', 'CEA (China Emission Allowance) + CCER (China Certified Emission Reduction)',
  null, null, 'active', '2026-: 鉄鋼・化学・セメント等の対象セクター拡大 (要確認: 法案進捗)'
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
  policy_status = excluded.policy_status,
  next_milestone = excluded.next_milestone,
  updated_at = now();

-- ============================================================
-- entity_relations (新規制度 → 既存制度)
-- ============================================================
insert into public.entity_relations (from_entity_id, to_entity_id, relation_type, notes)
select f.id, t.id, rel.relation_type, rel.notes
from (values
  ('cbam','eu-ets','depends_on','EU ETS 価格を基準に CBAM 証書価格を決定'),
  ('paris-article-6-2','jcm','parent_of','JCM は Article 6.2 の代表的実装'),
  ('ira-45q','dac','depends_on','DAC + 地中貯留で最大 180 USD/t-CO2')
) as rel(from_slug, to_slug, relation_type, notes)
join public.entities f on f.slug = rel.from_slug
join public.entities t on t.slug = rel.to_slug
on conflict (from_entity_id, to_entity_id, relation_type) do update set
  notes = excluded.notes;

-- ============================================================
-- 既存 regulation entity に policy_status / next_milestone を補完
-- ============================================================
update public.entities set
  policy_status = 'active',
  next_milestone = 'GX-ETS 第2フェーズの遵守需要拡大局面 (2026-)',
  updated_at = now()
  where slug = 'jcredit';

update public.entities set
  policy_status = 'active',
  next_milestone = 'パリ協定 6.2 ルール下での運用継続、パートナー国拡大',
  updated_at = now()
  where slug = 'jcm';

update public.entities set
  policy_status = 'active',
  next_milestone = 'REDD+ 統合メソドロジー (VM0048 等) への移行継続',
  updated_at = now()
  where slug = 'verra-vcs';

update public.entities set
  policy_status = 'transition',
  next_milestone = '2026-04: 第2フェーズ開始、特定企業群への有償割当 (要確認)',
  updated_at = now()
  where slug = 'gx-ets';

update public.entities set
  policy_status = 'active',
  next_milestone = 'Verra 統合メソドロジー (VM0048) への移行と CCP 評価結果反映',
  updated_at = now()
  where slug = 'redd-plus';

update public.entities set
  policy_status = 'active',
  next_milestone = 'メソドロジー別 Assessment Framework の継続適用',
  updated_at = now()
  where slug = 'icvcm-ccp';

update public.entities set
  policy_status = 'active',
  next_milestone = 'CCP 評価結果のメソドロジー別反映',
  updated_at = now()
  where slug = 'gold-standard';

update public.entities set
  policy_status = 'active',
  next_milestone = 'コミュニティベース案件の継続認証',
  updated_at = now()
  where slug = 'plan-vivo';

commit;
