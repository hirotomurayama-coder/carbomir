-- Carbomir seed: 中身の厚みフェーズで追加した methodology + technology entities
-- 0006 migration までが適用されている前提.
-- IFM / ARR / Biochar / Cookstoves (methodology) + ERW / BECCS / OAE (technology)

begin;

insert into public.entities (
  slug, type, name_ja, name_en, abbreviation,
  summary, tags, status, last_reviewed_at,
  sections, related_matrix_slugs,
  jurisdiction, established_year, geographic_scope,
  parent_company, business_role
) values
(
  'ifm', 'methodology', 'IFM (改良森林管理)', 'Improved Forest Management', 'IFM',
  '既存森林の管理手法を改善することで炭素ストックを増大させるメソドロジー群。伐採周期延長、択伐等の戦略を含む。Verra VCS で主要発行カテゴリの一つ。',
  array['森林吸収','ボランタリー市場','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "アプローチの種類", "body": "代表的なサブ手法:\n\n- **Extended Rotation (ER)** — 伐採周期を延長して炭素蓄積を増やす\n- **Logged-to-Protected (LtP)** — 商業伐採林を保護林へ転換\n- **Low Impact Logging (LIL)** — 高効率・低撹乱の伐採実施\n- **Conifer to Hardwood (CtH)** — 樹種転換による長期炭素蓄積\n\nプロジェクト所在地・所有形態・規制環境により採用手法が分かれる。" },
    { "heading": "市場での位置", "body": "Verra VCS の IFM メソドロジーは森林由来クレジットで REDD+ に次ぐ規模。買い手は森林由来でも「劣化抑制ではなく管理改善」を選好する傾向 (劣化リスクの曖昧さを回避)。価格は REDD+ 同等以上の場合が多い (要確認: 直近実勢)。" },
    { "heading": "編集部の論点", "body": "「ベースラインが何だったか」(IFM 無しでどれくらい伐採される予定だったか) の検証が品質の核。森林所有者の経済合理性に依存するため、規制環境変化に弱い。CCP 適格性は個別メソドロジーで判定段階。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (主要レジストリ運用)', 2006, 'グローバル (温帯・熱帯両域)', null, null
),
(
  'arr', 'methodology', 'ARR (新規植林・再植林・植生回復)', 'Afforestation, Reforestation and Revegetation', 'ARR',
  '森林がなかった土地への新規植林、過去に森林だった土地への再植林、植生回復によるクレジット創出メソドロジー群。最も古典的な森林由来クレジット類型。',
  array['森林吸収','ボランタリー市場','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "3 つの類型", "body": "- **Afforestation (新規植林)** — 過去 50 年以上森林でなかった土地に新たに植林\n- **Reforestation (再植林)** — 1989 年 12 月 31 日時点で森林でなかったが過去には森林だった土地への植林\n- **Revegetation (植生回復)** — 森林に至らない植生 (草地・低木地) の回復による炭素蓄積\n\n各類型の境界は CDM 由来のルールで歴史的に厳格に区別されてきた。" },
    { "heading": "永続性の課題", "body": "森林は火災・病虫害・違法伐採等で長期保有が脅かされる。各レジストリは **Buffer Pool** (発行クレジットの 10-20% を準備金として留保) で永続性リスクを補償する仕組みを持つ。" },
    { "heading": "編集部の論点", "body": "比較的「分かりやすい」クレジットだが、(a) 単一樹種大規模植林の生物多様性影響、(b) 土地利用変化による先住民・地元住民影響、(c) Buffer Pool の実効性、の 3 点が品質シグナルとして個別評価対象。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際 (主要レジストリ運用)', 2000, 'グローバル', null, null
),
(
  'biochar', 'methodology', 'Biochar (バイオ炭)', 'Biochar', null,
  'バイオマスを酸素制限環境で熱分解し、安定した固体炭素 (バイオ炭) として土壌等に施用する技術・メソドロジー。永続性 (>100 年想定) が高く Engineered Removal の一翼を担う。',
  array['Engineered Removal','森林吸収','ボランタリー市場'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "技術の概要", "body": "農林業残渣・廃材等のバイオマスを **熱分解 (pyrolysis)** で炭化させ、得られた biochar を土壌改良材として施用する。気候 + 土壌肥沃度改善のコベネフィットあり。原料ソース・熱分解条件 (温度・時間) により永続性 (BC+/BC- 比率) が変動。" },
    { "heading": "市場での位置", "body": "Engineered Removal セグメントで DAC・ERW に次ぐ規模で発行が拡大中。価格帯は 50-200 USD/t-CO2 程度 (DAC の 1/3-1/2、要確認)。Microsoft、Stripe Climate 等のテック需要家が前払い契約で需要創出。Puro.earth、Carbonfuture 等の専門レジストリ + Verra VCS が主要発行プラットフォーム。" },
    { "heading": "編集部の論点", "body": "永続性主張は biochar の安定炭素画分 (fixed carbon fraction) と土壌微生物分解率の不確実性に依存。施用後のモニタリング困難。原料サプライ (廃材確保) が事業スケール制約。EU CRCF (Carbon Removal Certification Framework) が認可した最初の Removal 類型の一つ (要確認: 制度詳細)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際', 2010, 'グローバル', null, null
),
(
  'cookstoves', 'methodology', 'クリーンクッキングストーブ', 'Clean Cookstoves', null,
  '途上国コミュニティの調理用バイオマス燃料を高効率・低排出のクリーンクッキングストーブで代替するメソドロジー。Gold Standard / Verra での主要発行カテゴリで、SDGs (健康・ジェンダー・貧困) コベネフィット強い。',
  array['途上国','ボランタリー市場','SDGs 連動','コミュニティベース'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "アプローチ", "body": "従来の薪・木炭による調理を、高効率ストーブまたは電気/LPG/エタノール調理器具で代替。\n\n- **排出削減源**: 不完全燃焼の CH4/N2O 削減、非再生バイオマス (fNRB) の削減\n- **追加価値**: 室内大気汚染削減 (女性・子どもの呼吸器疾患減)、薪集めの労働時間削減 (ジェンダー)、調理時間短縮" },
    { "heading": "品質議論", "body": "クリーンクッキング系クレジットは ICVCM の品質精査の対象。特に **fNRB (非再生バイオマス率)** のベースライン推定、**ストーブ利用率 (utilization rate)** の継続モニタリングが論点。2024 年に複数のメソドロジー version が CCP 適格性評価を受けた (要確認: 結果)。" },
    { "heading": "編集部の論点", "body": "SDGs 訴求力は VCM 内最強クラスで、CSR 訴求型の買い手企業の選好が強い。ただし品質シグナル動向で評価が変動するセグメント。価格は 10-30 USD/t 程度の幅 (要確認: 直近実勢、Gold Standard 系で高め)。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際', 2008, '途上国全域 (アフリカ・南アジア中心)', null, null
),
(
  'erw', 'technology', 'ERW (強化風化)', 'Enhanced Rock Weathering', 'ERW',
  '粉砕した玄武岩・カンラン岩等のケイ酸塩鉱物を農地や沿岸に散布し、自然風化を加速させて CO2 を炭酸塩として固定する Engineered Removal 技術。永続性 >10,000 年想定。',
  array['Engineered Removal','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "技術の概要", "body": "玄武岩・カンラン岩等のケイ酸塩鉱物の粉末を農地等に散布し、雨水・CO2 との反応で炭酸イオン化させる過程を加速する。\n\n反応の主要ステップ:\n\n1. 鉱物の粉砕 (粒径 < 100 μm)\n2. 農地等への散布\n3. 雨水で溶解 → 重炭酸イオン形成\n4. 河川経由で海洋に流入、最終的に炭酸塩として固定" },
    { "heading": "市場動向", "body": "Lithos Carbon、Eion、UNDO Carbon、Mati Carbon 等が商業化を進める。価格帯は 100-400 USD/t-CO2 程度 (DAC より低め、要確認)。Microsoft、Frontier (テック大手連合) が大口 offtake。" },
    { "heading": "編集部の論点", "body": "永続性は化学反応の不可逆性により高い (>10,000 年)。一方、**MRV (測定・報告・検証)** が課題: 鉱物溶解率、地下水・河川流出の追跡、海洋到達 CO2 量の推定に大きな不確実性。MRV ステンダードが確立してから本格スケール期待。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際', 2018, 'グローバル (大規模火成岩産地 + 農地)', null, null
),
(
  'beccs', 'technology', 'BECCS (バイオエネルギー + CCS)', 'Bio-energy with Carbon Capture and Storage', 'BECCS',
  'バイオマスを燃料源としてエネルギー生成し、発生する CO2 を回収・地中貯留する技術。植物の光合成 + CCS により大気から CO2 を引き抜く Engineered Removal 系。IPCC のシナリオで主要負排出技術として位置付けられる。',
  array['Engineered Removal','CCS','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "技術の概要", "body": "原料: 残渣バイオマス (農林業廃材) または専用バイオマス。燃焼・気化等の熱変換で電力・熱・水素を生成。発生 CO2 をアミン吸収等で回収し、地中貯留 (saline aquifer / depleted oil-gas field) または鉱物化で固定。Drax (英国)、Ørsted (デンマーク) 等が大規模商業化を進める。" },
    { "heading": "課題と論点", "body": "理論上ネガティブ排出だが、(a) バイオマス調達のサステナビリティ (土地利用変化・食料競合)、(b) 燃焼効率、(c) CCS 回収率、の三重の不確実性。原料を sustainable に確保できる規模は地理的に限定的 (Drax の英国産バイオマス輸入は批判対象)。" },
    { "heading": "編集部の論点", "body": "クレジット発行ではなく **政策補助** で経済性が成立する事業が多い (UK CfD 等)。VCS 等のクレジット枠組みでも整備中だが、ライフサイクル評価 (LCA) の標準化が前提。「Engineered Removal の主流」より「特定地域での補助型ニッチ」と捉える方が実態に近い。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際', 2009, 'グローバル (バイオマス産地 + CCS インフラ近接)', null, null
),
(
  'oae', 'technology', 'OAE (海洋アルカリ強化)', 'Ocean Alkalinity Enhancement', 'OAE',
  'アルカリ性物質を海洋に投入して海水の pH を上げ、CO2 吸収能を強化する Engineered Removal 技術。理論上の容量は数十億トン規模だが、商業段階は最初期。',
  array['Engineered Removal','国際'],
  'published', '2026-05-25',
  $jsonb$[
    { "heading": "技術の概要", "body": "アルカリ性物質を海洋に投入し、海水の重炭酸塩濃度を上げる手法。\n\n- **沿岸 OAE**: 石灰岩粉末を沿岸投入\n- **電解 OAE (Electrochemical OAE)**: 海水を電気分解で酸 / アルカリに分離、アルカリ画分を海に返す (Equatic、Captura 等)\n- **海洋鉄施肥との混同に注意**: OAE と鉄施肥は別アプローチ" },
    { "heading": "事業者", "body": "Planetary Technologies、Ebb Carbon、Equatic、Captura、Vesta 等が初期商業化を進める。Frontier、Microsoft 等が小規模 offtake で初期需要を提供。価格帯 200-500 USD/t-CO2 程度 (要確認: 商業化初期で参考値)。" },
    { "heading": "編集部の論点", "body": "理論容量は大きいが、**MRV (海洋への影響継続観測)** と **海洋環境への影響** (pH 変化、生態系) の科学的不確実性が極めて大きい。許認可 (国連海洋法、各国沿岸規制) のグレーゾーン領域。2030 年以降のスケール期待で、現時点では研究段階の延長線上。" }
  ]$jsonb$::jsonb,
  array[]::text[],
  '国際', 2022, '沿岸・外洋', null, null
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
  geographic_scope = excluded.geographic_scope,
  updated_at = now();

-- ============================================================
-- entity_relations: 新規 entity と既存 entity を双方向に接続
-- ============================================================
insert into public.entity_relations (from_entity_id, to_entity_id, relation_type, notes)
select f.id, t.id, rel.relation_type, rel.notes
from (values
  -- Verra VCS → new methodologies (parent_of)
  ('verra-vcs','ifm','parent_of','森林管理改善メソドロジーで運用'),
  ('verra-vcs','arr','parent_of','新規植林・再植林メソドロジーで運用'),
  ('verra-vcs','biochar','parent_of','Biochar 系 Engineered Removal メソドロジー'),
  -- Gold Standard → ARR, Cookstoves
  ('gold-standard','cookstoves','parent_of','クリーンクッキング系の主力レジストリ'),
  ('gold-standard','arr','parent_of','ARR メソドロジー運用'),
  -- DAC → ERW/BECCS/Biochar (competes_with)
  ('dac','erw','competes_with','Engineered Removal の別アプローチ (鉱物溶解系)'),
  ('dac','beccs','competes_with','Engineered Removal の別アプローチ (バイオマス + CCS)'),
  ('dac','biochar','competes_with','Engineered Removal の代替手段 (永続性は劣る)'),
  -- REDD+ ↔ IFM, ARR (competes_with)
  ('redd-plus','ifm','competes_with','同じ森林由来クレジットの代替アプローチ'),
  ('redd-plus','arr','competes_with','同じ森林由来クレジットの代替アプローチ'),
  -- IFM/ARR ↔ existing
  ('ifm','verra-vcs','depends_on','VCS で主要メソドロジーとして運用'),
  ('ifm','redd-plus','competes_with','同じ森林由来クレジット戦略の代替'),
  ('arr','verra-vcs','depends_on','VCS で複数メソドロジーとして運用'),
  ('arr','gold-standard','depends_on','Gold Standard でも主要メソドロジー'),
  ('arr','plan-vivo','depends_on','Plan Vivo のコミュニティ・アグロフォレストリーの中核'),
  -- Biochar
  ('biochar','verra-vcs','depends_on','VCS で Engineered Removal カテゴリのメソドロジー'),
  ('biochar','dac','competes_with','Engineered Removal の代替手段、価格帯は DAC より低い'),
  -- Cookstoves
  ('cookstoves','gold-standard','depends_on','Gold Standard で主要メソドロジー'),
  ('cookstoves','verra-vcs','depends_on','VCS でもメソドロジーとして運用'),
  -- ERW
  ('erw','verra-vcs','depends_on','VCS で Engineered Removal メソドロジー整備中'),
  ('erw','dac','competes_with','Engineered Removal の別アプローチ'),
  ('erw','biochar','competes_with','農地施用型 Engineered Removal の代替'),
  -- BECCS
  ('beccs','dac','competes_with','Engineered Removal の代替アプローチ'),
  ('beccs','ira-45q','depends_on','米国 45Q 税額控除の対象'),
  -- OAE
  ('oae','dac','competes_with','Engineered Removal の代替'),
  ('oae','erw','equivalent_to','鉱物溶解による炭酸塩化という化学経路は近い')
) as rel(from_slug, to_slug, relation_type, notes)
join public.entities f on f.slug = rel.from_slug
join public.entities t on t.slug = rel.to_slug
on conflict (from_entity_id, to_entity_id, relation_type) do update set
  notes = excluded.notes;

commit;
