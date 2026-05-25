-- Carbomir seed data: timeline events
-- 0001/0002/0003 migration 適用後に冪等で実行できる。
-- entities seed (0001_seed_data.sql) を先に流しておくこと
-- (affected_entity_ids 解決のため)。

begin;

insert into public.timeline_events (
  slug, event_date, title, summary,
  category, importance, status,
  affected_entity_ids, affected_entity_slugs, source_urls
) values
(
  '2005-11-vcs-founding',
  '2005-11-01',
  'VCS (Verified Carbon Standard) 発足',
  'The Climate Group、WBCSD、IETA が共同で任意市場向け品質基準を設立。後の Verra による単独運営へと移行する。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('verra-vcs')),
  array['verra-vcs'],
  $jsonb$[{"label": "Verra Program History", "url": "https://verra.org/programs/verified-carbon-standard/"}]$jsonb$::jsonb
),
(
  '2008-10-domestic-credit-launch',
  '2008-10-01',
  '国内クレジット制度開始',
  '経済産業省所管の中小企業排出削減支援制度として開始。同時期に環境省所管の J-VER 制度も稼働し、後年 J-クレジット制度として統合される。',
  'regulatory', 3, 'published',
  (select array_agg(id) from public.entities where slug in ('jcredit')),
  array['jcredit'],
  $jsonb$[{"label": "J-クレジット制度概要", "url": "https://japancredit.go.jp/about/"}]$jsonb$::jsonb
),
(
  '2013-04-jcm-launch',
  '2013-04-01',
  'JCM 本格運用開始',
  '二国間クレジット制度の本格運用開始。当初の枠組署名国はモンゴル、バングラデシュ、エチオピア、ケニア、モルディブ等。以降パートナー国を順次拡大。',
  'regulatory', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('jcm')),
  array['jcm'],
  $jsonb$[{"label": "JCM 公式", "url": "https://www.jcm.go.jp/"}]$jsonb$::jsonb
),
(
  '2013-10-jcredit-launch',
  '2013-10-01',
  'J-クレジット制度発足',
  '経済産業省所管の「国内クレジット制度」と環境省所管の「J-VER制度」を統合。経済産業省・環境省・農林水産省の3省共管体制で再出発。対象セクター・メソドロジーが拡大した。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcredit')),
  array['jcredit'],
  $jsonb$[{"label": "J-クレジット制度公式", "url": "https://japancredit.go.jp/"}]$jsonb$::jsonb
),
(
  '2023-01-guardian-verra-redd',
  '2023-01-18',
  'The Guardian による Verra REDD+ 批判記事',
  'The Guardian、Die Zeit、SourceMaterial の合同調査で Verra 認証 REDD+ クレジットの大半がベースライン設定に問題ありと報じられる。VCM 全体の品質シグナル議論が一気に加速。',
  'market', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('verra-vcs')),
  array['verra-vcs'],
  $jsonb$[{"label": "The Guardian (調査報道)", "url": "https://www.theguardian.com/environment/2023/jan/18/revealed-forest-carbon-offsets-biggest-provider-worthless-verra-aoe"}]$jsonb$::jsonb
),
(
  '2023-07-icvcm-ccp-launch',
  '2023-07-27',
  'ICVCM Core Carbon Principles (CCP) 公表',
  'Integrity Council for the Voluntary Carbon Market が任意市場全体の品質基準として Core Carbon Principles を発表。以降、Verra 含む各レジストリのメソドロジーが CCP 適格性で個別評価されるフェーズに入る。',
  'market', 4, 'published',
  (select array_agg(id) from public.entities where slug in ('verra-vcs')),
  array['verra-vcs'],
  $jsonb$[{"label": "ICVCM CCP", "url": "https://icvcm.org/the-core-carbon-principles/"}]$jsonb$::jsonb
),
(
  '2024-04-gx-ets-phase1',
  '2024-04-01',
  'GX-ETS 第1フェーズ開始 (試行排出量取引)',
  '日本の GX (グリーン・トランスフォーメーション) 政策の一環として、GX-ETS 第1フェーズが試行段階で開始。J-クレジットおよび JCM クレジットが遵守クレジットとして位置付けられた。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcredit','jcm')),
  array['jcredit','jcm'],
  $jsonb$[{"label": "経済産業省 GX-ETS 関連", "url": "https://www.meti.go.jp/policy/energy_environment/global_warming/ggs/index.html"}]$jsonb$::jsonb
),
(
  '2026-04-gx-ets-paid-phase',
  '2026-04-01',
  'GX-ETS 排出量取引制度の有償化開始',
  'GX-ETS の本格運用に向け、特定企業群に対する排出枠の有償割当が開始される段階。国内クレジット制度の需要拡大要因として価格圧力が継続している。',
  'regulatory', 5, 'published',
  (select array_agg(id) from public.entities where slug in ('jcredit','jcm')),
  array['jcredit','jcm'],
  $jsonb$[{"label": "経済産業省 GX-ETS 関連", "url": "https://www.meti.go.jp/policy/energy_environment/global_warming/ggs/index.html"}]$jsonb$::jsonb
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
