-- Carbomir seed: Phase 3d timeline 補強
-- 京都議定書から COP29 まで 12 件の主要マイルストーン追加.

begin;

insert into public.timeline_events (
  slug, event_date, title, summary,
  category, importance, status,
  affected_entity_ids, affected_entity_slugs, source_urls
) values
(
  '1997-12-kyoto-protocol',
  '1997-12-11',
  '京都議定書採択',
  'UNFCCC 第 3 回締約国会議 (COP3、京都) で先進国の温室効果ガス排出削減目標を法的拘束力で定める初の国際合意として採択。クリーン開発メカニズム (CDM)、共同実施 (JI)、排出量取引の 3 メカニズムを規定し、現代カーボン市場の基礎を作った。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcm','paris-article-6-2','paris-article-6-4')),
  array['jcm','paris-article-6-2','paris-article-6-4'],
  $jsonb$[{"label":"UNFCCC 京都議定書","url":"https://unfccc.int/process-and-meetings/the-kyoto-protocol/what-is-the-kyoto-protocol"}]$jsonb$::jsonb
),
(
  '2003-09-gold-standard-founding',
  '2003-09-01',
  'Gold Standard 設立',
  'WWF を中心とする NGO 連合により、CDM 等の任意カーボンクレジットに「SDGs 連動」の品質基準を提供することを目的に設立 (要確認: 正確な月日)。後に独立スタンダードへ拡張し、Verra VCS と並ぶ VCM の二大民間基準に成長。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('gold-standard','gold-standard-foundation')),
  array['gold-standard','gold-standard-foundation'],
  $jsonb$[{"label":"Gold Standard 公式","url":"https://www.goldstandard.org/"}]$jsonb$::jsonb
),
(
  '2005-01-eu-ets-launch',
  '2005-01-01',
  'EU ETS 運用開始 (世界初の主要 ETS)',
  'EU 排出量取引制度 Phase 1 (2005-2007) として運用開始。発電・産業セクターを対象に、世界初の本格的な cap-and-trade スキームを実装。価格シグナルを通じた排出削減誘導の有効性の議論を実証データで提供する原点となった。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('eu-ets')),
  array['eu-ets'],
  $jsonb$[{"label":"European Commission - EU ETS","url":"https://climate.ec.europa.eu/eu-action/eu-emissions-trading-system-eu-ets_en"}]$jsonb$::jsonb
),
(
  '2008-09-car-founding',
  '2008-09-01',
  'Climate Action Reserve (CAR) 設立',
  'California Climate Action Registry (2001 年州立) を起源として独立非営利として再編 (要確認: 正確な月日)。CRT (Climate Reserve Ton) を発行し、California Cap-and-Trade 接続を前提とした制度設計で米国コンプライアンス需要に応える主要レジストリへ。',
  'regulatory', 3, 'published',
  (select array_agg(id) from public.entities where slug in ('car','california-cap-trade')),
  array['car','california-cap-trade'],
  $jsonb$[{"label":"Climate Action Reserve 公式","url":"https://climateactionreserve.org/"}]$jsonb$::jsonb
),
(
  '2013-01-california-cap-trade-launch',
  '2013-01-01',
  'California Cap-and-Trade 運用開始',
  '米国 California 州の AB32 (Global Warming Solutions Act of 2006) を法的根拠に、北米初の経済全体型 cap-and-trade 制度として運用開始。発電・産業 + 後に輸送燃料も対象化し、米国 ETS の先駆けとなった。CAR/ACR のオフセットプロトコルが連動。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('california-cap-trade','car','acr')),
  array['california-cap-trade','car','acr'],
  $jsonb$[{"label":"California Air Resources Board","url":"https://ww2.arb.ca.gov/our-work/programs/cap-and-trade-program"}]$jsonb$::jsonb
),
(
  '2015-01-k-ets-launch',
  '2015-01-01',
  'K-ETS (韓国 ETS) 運用開始',
  '韓国がアジア初の経済全体型 cap-and-trade 制度として K-ETS を運用開始。発電・産業・航空・海運をカバーし、排出量の約 73% を対象とする広範囲設計。アジア地域における ETS 設計の先行事例となった。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('k-ets')),
  array['k-ets'],
  $jsonb$[{"label":"Korean Ministry of Environment (K-ETS)","url":"https://eng.me.go.kr/eng/web/index.do?menuId=460"}]$jsonb$::jsonb
),
(
  '2020-01-microsoft-carbon-negative',
  '2020-01-16',
  'Microsoft が 2030 年 Carbon Negative 目標を宣言',
  'Microsoft が 2030 年までに事業活動の総排出量を超える Carbon Removal を達成する "Carbon Negative" 目標を発表。10 億 USD の Climate Innovation Fund 設立と長期 CDR offtake 契約により、Engineered Removal 市場の本格的な需要側プレイヤーとして登場した。',
  'market', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('microsoft','dac','verra-vcs','isometric')),
  array['microsoft','dac','verra-vcs','isometric'],
  $jsonb$[{"label":"Microsoft Sustainability","url":"https://www.microsoft.com/sustainability"}]$jsonb$::jsonb
),
(
  '2021-07-china-national-ets-launch',
  '2021-07-16',
  '中国全国 ETS 運用開始',
  '8 地域パイロット ETS (2013-2020) を経て、中国全国 ETS が発電セクターを対象に運用開始。約 2,000 社・40 億トン規模で世界最大の ETS として稼働。原単位ベース (rate-based) の割当方式が特徴で、絶対量上限を持つ EU ETS とは制度設計が異なる。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('china-national-ets')),
  array['china-national-ets'],
  $jsonb$[{"label":"Ministry of Ecology and Environment (中国 MEE)","url":"https://english.mee.gov.cn/"}]$jsonb$::jsonb
),
(
  '2021-12-art-trees-first-issuance',
  '2021-12-01',
  'ART TREES 初発行 (Jurisdictional REDD+ の本格化)',
  'ART (Architecture for REDD+ Transactions) が運営する **Jurisdictional REDD+** 専門レジストリ ART TREES が初のクレジット発行 (要確認: 正確な月日)。プロジェクトレベル REDD+ の品質議論を制度的に回避する設計が、Guardian/Verra 報道以降の REDD+ 信頼回復の鍵として注目される。LEAF Coalition (米英独 + テック大手) が需要側支援。',
  'regulatory', 3, 'published',
  (select array_agg(id) from public.entities where slug in ('art-trees','redd-plus')),
  array['art-trees','redd-plus'],
  $jsonb$[{"label":"ART 公式","url":"https://www.artredd.org/"}]$jsonb$::jsonb
),
(
  '2022-08-us-ira-enacted',
  '2022-08-16',
  '米国 Inflation Reduction Act (IRA) 成立 (45Q 拡張)',
  'Biden 政権下で気候投資・CCS / DAC 支援を中核とする IRA が成立。**45Q 税額控除** を拡張し、DAC + 地中貯留で 180 USD/t-CO2 (要確認: 制度詳細) の手厚い支援を提供。北米 Engineered Removal 商業化経済性の支柱となり、Climeworks STRATOS や 1PointFive プロジェクト等を加速させた。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('ira-45q','dac','beccs','carbon-engineering')),
  array['ira-45q','dac','beccs','carbon-engineering'],
  $jsonb$[{"label":"US IRS - Section 45Q","url":"https://www.irs.gov/businesses/section-45q-credit-for-carbon-oxide-sequestration"}]$jsonb$::jsonb
),
(
  '2023-10-eu-cbam-transition-start',
  '2023-10-01',
  'EU CBAM 移行期間開始',
  '国境炭素調整メカニズム (CBAM) の移行期間が開始。鉄鋼・アルミ・セメント・肥料・水素・電力の 6 品目を対象に、EU 域内輸入時に **排出量報告義務** が課される。2026 年 1 月の本格運用 (CBAM 証書購入義務) に向けた段階的導入で、グローバルサプライチェーンに広範な影響。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('cbam','eu-ets')),
  array['cbam','eu-ets'],
  $jsonb$[{"label":"European Commission - CBAM","url":"https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en"}]$jsonb$::jsonb
),
(
  '2024-11-cop29-article-6-4-methodologies',
  '2024-11-23',
  'COP29 (バクー) で Article 6.4 メソドロジー基準を採択',
  'COP29 でパリ協定第 6.4 条 (PACM = Paris Agreement Crediting Mechanism) の運用詳細が大きく前進。Article 6.4 Supervisory Body が策定したメソドロジー基準と除去活動基準を締約国が承認し、初の PACM クレジット発行に向けた制度的準備が整った (要確認: 詳細日付・採択内容)。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('paris-article-6-4','paris-article-6-2')),
  array['paris-article-6-4','paris-article-6-2'],
  $jsonb$[{"label":"UNFCCC - Article 6.4 Mechanism","url":"https://unfccc.int/process-and-meetings/the-paris-agreement/article-64-mechanism"}]$jsonb$::jsonb
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
