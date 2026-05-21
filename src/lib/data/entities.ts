import type { Entity } from "@/lib/types";

export const seedEntities: Entity[] = [
  {
    slug: "jcredit",
    type: "regulation",
    name_ja: "J-クレジット制度",
    name_en: "J-Credit Scheme",
    summary:
      "省エネ・再エネ・農業・森林管理・廃棄物等による国内の排出削減・吸収量を国が認証するクレジット制度。経済産業省・環境省・農林水産省共管。",
    last_reviewed_at: "2026-05-21",
    status: "published",
    tags: ["国内制度", "ボランタリー", "GX-ETS関連"],
    related: [
      { to_slug: "jcm", relation: "competes_with", note: "国内 vs 二国間で対象範囲が異なる" },
      { to_slug: "verra-vcs", relation: "competes_with", note: "国内追加性 vs グローバル受容性" },
    ],
    related_matrix_slugs: ["jcredit-jcm-verra"],
    sections: [
      {
        heading: "制度の概要",
        body: "J-クレジット制度は、省エネルギー設備の導入、再生可能エネルギーの利用、農業 (バイオ炭施用、水田水管理など)、森林管理、廃棄物処理等による温室効果ガスの排出削減量・吸収量を、国が認証し、クレジットとして発行・取引できる制度である。発行されたクレジットは、温対法・省エネ法の報告、カーボン・オフセット、CDP・SBT等の国際イニシアチブ報告、GX-ETS等での活用が可能となる。",
        source_urls: [
          { label: "J-クレジット制度公式", url: "https://japancredit.go.jp/" },
        ],
      },
      {
        heading: "沿革",
        body: "2013年10月、それまで個別に運用されていた「国内クレジット制度」 (2008年〜、経済産業省所管、中小企業の排出削減支援) と「J-VER制度」 (2008年〜、環境省所管、オフセット用) を統合して発足。統合により、対象セクター・メソドロジーが拡大し、認証プロセスも一本化された。",
      },
      {
        heading: "ガバナンス",
        body: "経済産業省・環境省・農林水産省の3省共管。J-クレジット制度認証委員会が個別案件の認証可否を判断する。認証機関 (第三者検証機関) による検証を経て、委員会が認証する二段構えの構造。事務局は公益財団法人地球環境戦略研究機関 (IGES) が担う場面が多い。",
        source_urls: [
          { label: "J-クレジット制度概要", url: "https://japancredit.go.jp/about/" },
        ],
      },
      {
        heading: "主要メソドロジー",
        body: "省エネルギー (高効率機器導入、コージェネレーション等)、再生可能エネルギー (太陽光、風力、バイオマス、小水力等)、工業プロセス、農業 (バイオ炭施用、水田水管理、家畜排せつ物管理等)、森林管理 (持続可能な森林経営、森林吸収)、廃棄物 (廃棄物処理過程の最適化、メタン回収等) の6カテゴリで多数のメソドロジーが整備されている。",
      },
      {
        heading: "市場と価格動向",
        body: "流通は入札 (年複数回、再エネ電源由来・省エネ等の用途別区分) と相対取引の二本立て。2026年初頭時点の入札参考価格は、再エネ電源由来で 1,500〜3,500円/t-CO2 程度、省エネ等で 1,000〜2,000円/t-CO2 程度。GX-ETS の本格運用開始に伴い、企業の遵守需要が拡大し、価格上昇圧力が継続している。",
        source_urls: [
          { label: "J-クレジット入札結果", url: "https://japancredit.go.jp/market/" },
        ],
      },
      {
        heading: "編集部の論点",
        body: "国内追加性とモニタリング基準が明確な点が最大の強み。一方、森林吸収由来クレジットは、ベースライン設定および永続性の観点から審査が厳格化される傾向にある。価格上昇局面で農林業案件への注目が集まる一方、創出ロットの小ささから流動性確保が課題。GX-ETS との接続でクレジット価値の制度的裏付けが強化される一方、対象セクター・適格性の細目は最新の運用規程確認が必須である。",
      },
    ],
  },
  {
    slug: "jcm",
    type: "regulation",
    name_ja: "JCM",
    name_en: "Joint Crediting Mechanism",
    abbreviation: "JCM",
    summary:
      "日本とパートナー国の二国間で温室効果ガス削減プロジェクトを実施し、削減量を両国でクレジットとして按分する政府間制度。",
    last_reviewed_at: "2026-05-21",
    status: "published",
    tags: ["二国間制度", "NDC", "GX-ETS関連"],
    related: [
      { to_slug: "jcredit", relation: "competes_with", note: "対象地域が異なる (国内 vs パートナー国)" },
      { to_slug: "verra-vcs", relation: "competes_with", note: "政府間 vs 民間スタンダード" },
    ],
    related_matrix_slugs: ["jcredit-jcm-verra"],
    sections: [
      {
        heading: "制度の概要",
        body: "JCM (Joint Crediting Mechanism、二国間クレジット制度) は、日本の優れた脱炭素技術・製品・システム・サービス・インフラ等の途上国への普及や緩和活動を実施し、その結果実現した温室効果ガス排出削減・吸収への日本の貢献を定量的に評価するとともに、日本の NDC (国別貢献) の達成に活用する制度である。",
        source_urls: [{ label: "JCM 公式", url: "https://www.jcm.go.jp/" }],
      },
      {
        heading: "沿革・パートナー国",
        body: "2013年に本格運用が開始され、以後パートナー国が順次拡大。2026年初頭時点で29か国 (モンゴル、バングラデシュ、エチオピア、ケニア、モルディブ、ベトナム、ラオス、インドネシア、コスタリカ、パラオ、カンボジア、メキシコ、サウジアラビア、チリ、ミャンマー、タイ、フィリピン、セネガル、チュニジア、アゼルバイジャン、モルドバ、ジョージア、スリランカ、ウズベキスタン、パプアニューギニア、UAE、キルギス、ウクライナ、ガーナ等) と協定締結済み。",
      },
      {
        heading: "ガバナンス",
        body: "両国政府で構成される合同委員会 (Joint Committee) がメソドロジーおよび個別プロジェクトを承認する。プロジェクト参加者は両国の指定された組織で、第三者機関 (Third Party Entity) による有効化審査・検証を経て、合同委員会が登録・発行を決定する。日本側の事務局は環境省・経済産業省・外務省共管。",
      },
      {
        heading: "主要案件カテゴリ",
        body: "再生可能エネルギー (太陽光、風力、地熱、小水力)、廃熱回収による発電・熱利用、高効率機器導入による省エネ、廃棄物処理過程のメタン回収・燃料化、運輸セクターの電動化・低燃費化、農業セクターの低炭素化等。パートナー国の経済発展段階に応じて、初期はインフラ整備型、近年は脱炭素技術導入型に重心が移行している。",
      },
      {
        heading: "市場と取引",
        body: "発行クレジットは協定上、両国政府で按分される。日本政府保有分は GX-ETS の遵守クレジットとしても活用されうる位置付け (最新の運用規程要確認)。民間流通量は限定的で、相対取引が中心。事業組成コストは案件規模・国により大きく変動し、市場価格としての標準化は未確立である。",
      },
      {
        heading: "編集部の論点",
        body: "パートナー国政府との合意ベースで二重計上回避が制度設計に組み込まれている点が、パリ協定 6条体制との親和性で強みとなる。一方、プロジェクト組成コストの高さ、相手国側の制度成熟度のばらつき、案件規模の小ささから、スケールには限界がある。日本企業の海外脱炭素貢献の可視化チャネルとしての価値が、定量的な NDC 貢献以上に重要視されている側面もある。",
      },
    ],
  },
  {
    slug: "verra-vcs",
    type: "regulation",
    name_ja: "Verra VCS",
    name_en: "Verified Carbon Standard",
    abbreviation: "VCS",
    summary:
      "米国非営利 Verra が運営する世界最大級の任意 (民間) カーボンクレジット基準。グローバル受容性とメソドロジー多様性で市場の標準的位置を占める。",
    last_reviewed_at: "2026-05-21",
    status: "published",
    tags: ["国際民間スタンダード", "ボランタリー市場", "REDD+"],
    related: [
      { to_slug: "jcredit", relation: "competes_with", note: "国内追加性 vs グローバル受容性" },
      { to_slug: "jcm", relation: "competes_with", note: "民間スタンダード vs 政府間制度" },
    ],
    related_matrix_slugs: ["jcredit-jcm-verra"],
    sections: [
      {
        heading: "制度の概要",
        body: "Verra VCS (Verified Carbon Standard) は、米国の非営利組織 Verra が運営する任意カーボンクレジット基準である。世界最大級の発行・流通量を持ち、グローバル市場における事実上の標準として機能する。クレジット単位は VCU (Verified Carbon Unit) と呼ばれ、1 VCU = 1 t-CO2 相当の削減・除去に対応する。",
        source_urls: [
          { label: "Verra VCS Program", url: "https://verra.org/programs/verified-carbon-standard/" },
        ],
      },
      {
        heading: "沿革",
        body: "2005年、The Climate Group、WBCSD (世界経済人会議)、IETA (国際排出量取引協会) が共同で設立。当初は VCS Association として運営され、その後 Verra が単独運営に移行。設立以来、メソドロジー数・対象セクター・パートナー国を継続拡大し、現在は世界160か国以上で発行実績を持つ。",
      },
      {
        heading: "主要メソドロジー",
        body: "森林・土地利用分野では REDD+ (森林減少・劣化防止)、IFM (改良森林管理)、ARR (新規植林・再植林) が中核。エネルギー分野では再生可能エネルギー、省エネルギー、廃棄物処理が広く採用される。近年は Engineered Removal 系 (DAC: 直接空気回収、Biochar: バイオ炭、ERW: 強化風化、海洋ベース除去等) のメソドロジー整備が加速しており、永続性の高い除去クレジットの主要発行プログラムとして位置付けられている。",
      },
      {
        heading: "市場での位置",
        body: "発行量・取引量で長年市場最大規模を維持。価格はメソドロジー・vintage (発行年)・原産地により極めて大きく変動する。2026年初頭の参考レンジでは、REDD+ で 3〜15 USD/t、再エネで 1〜5 USD/t、Engineered Removal で 100〜600 USD/t 程度。流動性は Engineered Removal を除けば概ね確保されているが、品質シグナルへの市場感応度が高く、需給以上に「どのラベル付きか」で価格が大きく分かれる。",
        source_urls: [
          { label: "Ecosystem Marketplace", url: "https://www.ecosystemmarketplace.com/" },
        ],
      },
      {
        heading: "品質をめぐる論点",
        body: "REDD+ ベースライン設定の妥当性については、2023年の West et al. をはじめとする学術論文・調査報道 (The Guardian 等) で批判が継続。これを受けて Verra は REDD+ メソドロジーの統合・刷新を進めている。グローバル品質基準としては ICVCM (Integrity Council for the Voluntary Carbon Market) の Core Carbon Principles (CCP) ラベルが業界標準シグナルとして機能し始めており、VCS 発行クレジットも CCP 適格性で個別評価される段階に入った。Engineered Removal は別ラベル運用が一般化し、Removal Certificates の分離発行も進む。",
      },
      {
        heading: "編集部の論点",
        body: "メソドロジー間の品質差が極めて大きく、「Verra だから安心」は実務上成立しない。提案資料・取引判断では、メソドロジー名・vintage・プロジェクト所在地・CCP 適格性まで個別に確認する必要がある。特に REDD+ は、批判への対応プロセス進行中のため、購入後に評価が下方修正されるレピュテーション・リスクを内包する。日本企業の任意取り組み・スコープ3相殺で使う場合、社内ガバナンス上の説明可能性を担保するクレジット選定基準の事前整備が望ましい。",
      },
    ],
  },
];

export function findEntityBySlug(slug: string): Entity | undefined {
  return seedEntities.find((e) => e.slug === slug);
}

export function listPublishedEntities(): Entity[] {
  return seedEntities.filter((e) => e.status === "published");
}

export function findEntityRef(slug: string): { slug: string; name_ja: string; name_en?: string } | undefined {
  const e = findEntityBySlug(slug);
  if (!e) return undefined;
  return { slug: e.slug, name_ja: e.name_ja, name_en: e.name_en };
}
