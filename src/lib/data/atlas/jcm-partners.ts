/**
 * JCM (Joint Crediting Mechanism / 二国間クレジット制度) パートナー国一覧.
 *
 * - Carbomir 編集データ (一次出典: 環境省 / METI JCM 事務局 公開資料 2026 年版).
 * - World Bank の Article 6.2 cooperative_agreements とは別データセット.
 *   JCM は UNFCCC 体系外のスキームとして開始したが、Article 6.2 への変換が進行中.
 * - status は二国間合意の段階 (MOC = Memorandum of Cooperation / Implementing).
 *
 * [要確認]: 締結年と最新 status. METI/環境省の公式ページで定期検証推奨.
 */

export type JcmPartner = {
  /** 相手国名 (英語. country-geo.ts と整合する形) */
  partner: string;
  /** 二国間合意の年 */
  year: number;
  /** 進捗状況 */
  status: "MOC" | "Implementing" | "Article 6.2 converted";
  /** 主な対象セクター (任意, 抜粋表示用) */
  notes?: string;
};

/** JCM 29 か国 (2026 年 5 月時点想定). */
export const JCM_PARTNERS: JcmPartner[] = [
  // 2013 初期パートナー
  { partner: "Mongolia", year: 2013, status: "Article 6.2 converted" },
  { partner: "Bangladesh", year: 2013, status: "Implementing" },
  { partner: "Ethiopia", year: 2013, status: "Implementing" },
  { partner: "Kenya", year: 2013, status: "Implementing" },
  { partner: "Maldives", year: 2013, status: "Implementing" },
  { partner: "Vietnam", year: 2013, status: "Implementing" },
  { partner: "Lao PDR", year: 2013, status: "Implementing" },
  { partner: "Indonesia", year: 2013, status: "Implementing" },
  { partner: "Costa Rica", year: 2013, status: "Implementing" },
  // 2014
  { partner: "Palau", year: 2014, status: "Implementing" },
  { partner: "Cambodia", year: 2014, status: "Implementing" },
  { partner: "Mexico", year: 2014, status: "Implementing" },
  // 2015
  { partner: "Saudi Arabia", year: 2015, status: "MOC" },
  { partner: "Chile", year: 2015, status: "Implementing" },
  { partner: "Myanmar", year: 2015, status: "Implementing" },
  { partner: "Thailand", year: 2015, status: "Implementing" },
  // 2017
  { partner: "Philippines", year: 2017, status: "Implementing" },
  // 2024 拡大
  { partner: "Sri Lanka", year: 2024, status: "MOC" },
  { partner: "Tunisia", year: 2024, status: "MOC" },
  { partner: "Senegal", year: 2024, status: "MOC" },
  { partner: "Azerbaijan", year: 2024, status: "MOC" },
  { partner: "Kazakhstan", year: 2024, status: "MOC" },
  { partner: "Uzbekistan", year: 2024, status: "MOC" },
  { partner: "Kyrgyz Republic", year: 2024, status: "MOC" },
  { partner: "Moldova", year: 2024, status: "MOC" },
  { partner: "Georgia", year: 2024, status: "MOC" },
  { partner: "Ukraine", year: 2024, status: "MOC" },
  { partner: "Papua New Guinea", year: 2024, status: "MOC" },
  { partner: "United Arab Emirates", year: 2024, status: "MOC" },
];
