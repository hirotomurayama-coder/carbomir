/**
 * 世界マップ可視化用の国別 lat/lng データ.
 *
 * - jurisdiction 文字列 (Atlas データの表記揺れあり) → 標準 ISO3 + 緯度経度
 * - 緯度経度は首都 or 国土中心の概算 (可視化用途で十分な精度)
 * - 60+ か国カバー (Atlas データに登場する主要国を網羅)
 * - 別名マッピング (例: "EU27+" → EU 中心の座標, "British Columbia" → カナダ西部)
 */

export type CountryGeo = {
  iso3: string;
  /** 緯度 (北が +) */
  lat: number;
  /** 経度 (東が +) */
  lng: number;
  /** 表示用日本語名 (任意) */
  name_ja: string;
  /** 大陸 / 地域グループ */
  region:
    | "North America"
    | "South America"
    | "Europe"
    | "Africa"
    | "Asia"
    | "Oceania"
    | "Middle East";
};

/** ISO3 (3 文字大文字) からの主要国データ */
export const COUNTRY_GEO: Record<string, CountryGeo> = {
  // === North America ===
  USA: { iso3: "USA", lat: 39.8, lng: -98.6, name_ja: "アメリカ", region: "North America" },
  CAN: { iso3: "CAN", lat: 56.1, lng: -106.3, name_ja: "カナダ", region: "North America" },
  MEX: { iso3: "MEX", lat: 23.6, lng: -102.6, name_ja: "メキシコ", region: "North America" },

  // === South America ===
  BRA: { iso3: "BRA", lat: -14.2, lng: -51.9, name_ja: "ブラジル", region: "South America" },
  ARG: { iso3: "ARG", lat: -38.4, lng: -63.6, name_ja: "アルゼンチン", region: "South America" },
  CHL: { iso3: "CHL", lat: -35.7, lng: -71.5, name_ja: "チリ", region: "South America" },
  COL: { iso3: "COL", lat: 4.6, lng: -74.3, name_ja: "コロンビア", region: "South America" },
  PER: { iso3: "PER", lat: -9.2, lng: -75.0, name_ja: "ペルー", region: "South America" },
  URY: { iso3: "URY", lat: -32.5, lng: -55.8, name_ja: "ウルグアイ", region: "South America" },
  VEN: { iso3: "VEN", lat: 6.4, lng: -66.6, name_ja: "ベネズエラ", region: "South America" },
  ECU: { iso3: "ECU", lat: -1.8, lng: -78.2, name_ja: "エクアドル", region: "South America" },
  PAN: { iso3: "PAN", lat: 8.5, lng: -80.8, name_ja: "パナマ", region: "South America" },
  GTM: { iso3: "GTM", lat: 15.8, lng: -90.2, name_ja: "グアテマラ", region: "South America" },
  CRI: { iso3: "CRI", lat: 9.7, lng: -83.8, name_ja: "コスタリカ", region: "South America" },

  // === Europe ===
  GBR: { iso3: "GBR", lat: 55.4, lng: -3.4, name_ja: "イギリス", region: "Europe" },
  DEU: { iso3: "DEU", lat: 51.2, lng: 10.4, name_ja: "ドイツ", region: "Europe" },
  FRA: { iso3: "FRA", lat: 46.2, lng: 2.2, name_ja: "フランス", region: "Europe" },
  ITA: { iso3: "ITA", lat: 41.9, lng: 12.6, name_ja: "イタリア", region: "Europe" },
  ESP: { iso3: "ESP", lat: 40.5, lng: -3.7, name_ja: "スペイン", region: "Europe" },
  POL: { iso3: "POL", lat: 51.9, lng: 19.1, name_ja: "ポーランド", region: "Europe" },
  NLD: { iso3: "NLD", lat: 52.1, lng: 5.3, name_ja: "オランダ", region: "Europe" },
  CHE: { iso3: "CHE", lat: 46.8, lng: 8.2, name_ja: "スイス", region: "Europe" },
  AUT: { iso3: "AUT", lat: 47.5, lng: 14.5, name_ja: "オーストリア", region: "Europe" },
  SWE: { iso3: "SWE", lat: 60.1, lng: 18.6, name_ja: "スウェーデン", region: "Europe" },
  NOR: { iso3: "NOR", lat: 60.5, lng: 8.5, name_ja: "ノルウェー", region: "Europe" },
  DNK: { iso3: "DNK", lat: 56.3, lng: 9.5, name_ja: "デンマーク", region: "Europe" },
  FIN: { iso3: "FIN", lat: 61.9, lng: 25.7, name_ja: "フィンランド", region: "Europe" },
  ISL: { iso3: "ISL", lat: 64.9, lng: -19.0, name_ja: "アイスランド", region: "Europe" },
  IRL: { iso3: "IRL", lat: 53.4, lng: -8.2, name_ja: "アイルランド", region: "Europe" },
  PRT: { iso3: "PRT", lat: 39.4, lng: -8.2, name_ja: "ポルトガル", region: "Europe" },
  GRC: { iso3: "GRC", lat: 39.1, lng: 21.8, name_ja: "ギリシャ", region: "Europe" },
  CZE: { iso3: "CZE", lat: 49.8, lng: 15.5, name_ja: "チェコ", region: "Europe" },
  ROU: { iso3: "ROU", lat: 45.9, lng: 24.9, name_ja: "ルーマニア", region: "Europe" },
  HUN: { iso3: "HUN", lat: 47.2, lng: 19.5, name_ja: "ハンガリー", region: "Europe" },
  UKR: { iso3: "UKR", lat: 48.4, lng: 31.2, name_ja: "ウクライナ", region: "Europe" },
  BEL: { iso3: "BEL", lat: 50.5, lng: 4.5, name_ja: "ベルギー", region: "Europe" },
  LIE: { iso3: "LIE", lat: 47.2, lng: 9.6, name_ja: "リヒテンシュタイン", region: "Europe" },
  SVN: { iso3: "SVN", lat: 46.2, lng: 14.99, name_ja: "スロベニア", region: "Europe" },
  EST: { iso3: "EST", lat: 58.6, lng: 25.0, name_ja: "エストニア", region: "Europe" },
  LVA: { iso3: "LVA", lat: 56.9, lng: 24.6, name_ja: "ラトビア", region: "Europe" },
  LTU: { iso3: "LTU", lat: 55.2, lng: 23.9, name_ja: "リトアニア", region: "Europe" },
  BGR: { iso3: "BGR", lat: 42.7, lng: 25.5, name_ja: "ブルガリア", region: "Europe" },
  HRV: { iso3: "HRV", lat: 45.1, lng: 15.2, name_ja: "クロアチア", region: "Europe" },
  ALB: { iso3: "ALB", lat: 41.2, lng: 20.2, name_ja: "アルバニア", region: "Europe" },
  MNE: { iso3: "MNE", lat: 42.7, lng: 19.4, name_ja: "モンテネグロ", region: "Europe" },
  SRB: { iso3: "SRB", lat: 44.0, lng: 21.0, name_ja: "セルビア", region: "Europe" },

  // === Asia ===
  JPN: { iso3: "JPN", lat: 36.2, lng: 138.3, name_ja: "日本", region: "Asia" },
  CHN: { iso3: "CHN", lat: 35.9, lng: 104.2, name_ja: "中国", region: "Asia" },
  KOR: { iso3: "KOR", lat: 35.9, lng: 127.8, name_ja: "韓国", region: "Asia" },
  IND: { iso3: "IND", lat: 20.6, lng: 78.96, name_ja: "インド", region: "Asia" },
  IDN: { iso3: "IDN", lat: -0.8, lng: 113.9, name_ja: "インドネシア", region: "Asia" },
  SGP: { iso3: "SGP", lat: 1.4, lng: 103.8, name_ja: "シンガポール", region: "Asia" },
  THA: { iso3: "THA", lat: 15.9, lng: 100.99, name_ja: "タイ", region: "Asia" },
  VNM: { iso3: "VNM", lat: 14.06, lng: 108.3, name_ja: "ベトナム", region: "Asia" },
  MYS: { iso3: "MYS", lat: 4.2, lng: 101.99, name_ja: "マレーシア", region: "Asia" },
  PHL: { iso3: "PHL", lat: 12.9, lng: 121.8, name_ja: "フィリピン", region: "Asia" },
  KAZ: { iso3: "KAZ", lat: 48.0, lng: 66.9, name_ja: "カザフスタン", region: "Asia" },
  PAK: { iso3: "PAK", lat: 30.4, lng: 69.3, name_ja: "パキスタン", region: "Asia" },
  BGD: { iso3: "BGD", lat: 23.7, lng: 90.4, name_ja: "バングラデシュ", region: "Asia" },
  LKA: { iso3: "LKA", lat: 7.9, lng: 80.8, name_ja: "スリランカ", region: "Asia" },
  KHM: { iso3: "KHM", lat: 12.6, lng: 104.99, name_ja: "カンボジア", region: "Asia" },
  LAO: { iso3: "LAO", lat: 19.9, lng: 102.5, name_ja: "ラオス", region: "Asia" },
  MNG: { iso3: "MNG", lat: 46.9, lng: 103.8, name_ja: "モンゴル", region: "Asia" },
  NPL: { iso3: "NPL", lat: 28.4, lng: 84.1, name_ja: "ネパール", region: "Asia" },

  // === Middle East ===
  TUR: { iso3: "TUR", lat: 38.96, lng: 35.2, name_ja: "トルコ", region: "Middle East" },
  ISR: { iso3: "ISR", lat: 31.0, lng: 34.85, name_ja: "イスラエル", region: "Middle East" },
  SAU: { iso3: "SAU", lat: 23.9, lng: 45.1, name_ja: "サウジアラビア", region: "Middle East" },
  ARE: { iso3: "ARE", lat: 23.4, lng: 53.85, name_ja: "UAE", region: "Middle East" },
  KWT: { iso3: "KWT", lat: 29.3, lng: 47.5, name_ja: "クウェート", region: "Middle East" },
  QAT: { iso3: "QAT", lat: 25.4, lng: 51.2, name_ja: "カタール", region: "Middle East" },
  IRN: { iso3: "IRN", lat: 32.4, lng: 53.7, name_ja: "イラン", region: "Middle East" },
  IRQ: { iso3: "IRQ", lat: 33.2, lng: 43.7, name_ja: "イラク", region: "Middle East" },
  JOR: { iso3: "JOR", lat: 30.6, lng: 36.2, name_ja: "ヨルダン", region: "Middle East" },

  // === Africa ===
  ZAF: { iso3: "ZAF", lat: -30.6, lng: 22.9, name_ja: "南アフリカ", region: "Africa" },
  EGY: { iso3: "EGY", lat: 26.8, lng: 30.8, name_ja: "エジプト", region: "Africa" },
  MAR: { iso3: "MAR", lat: 31.8, lng: -7.1, name_ja: "モロッコ", region: "Africa" },
  KEN: { iso3: "KEN", lat: -0.0, lng: 37.9, name_ja: "ケニア", region: "Africa" },
  NGA: { iso3: "NGA", lat: 9.1, lng: 8.7, name_ja: "ナイジェリア", region: "Africa" },
  GHA: { iso3: "GHA", lat: 7.95, lng: -1.0, name_ja: "ガーナ", region: "Africa" },
  ETH: { iso3: "ETH", lat: 9.15, lng: 40.5, name_ja: "エチオピア", region: "Africa" },
  TZA: { iso3: "TZA", lat: -6.4, lng: 34.9, name_ja: "タンザニア", region: "Africa" },
  UGA: { iso3: "UGA", lat: 1.4, lng: 32.3, name_ja: "ウガンダ", region: "Africa" },
  SEN: { iso3: "SEN", lat: 14.5, lng: -14.5, name_ja: "セネガル", region: "Africa" },
  COG: { iso3: "COG", lat: -0.2, lng: 15.8, name_ja: "コンゴ共和国", region: "Africa" },
  COD: { iso3: "COD", lat: -2.9, lng: 23.6, name_ja: "コンゴ民主共和国", region: "Africa" },
  RWA: { iso3: "RWA", lat: -1.95, lng: 29.9, name_ja: "ルワンダ", region: "Africa" },
  MWI: { iso3: "MWI", lat: -13.3, lng: 34.3, name_ja: "マラウイ", region: "Africa" },
  MDG: { iso3: "MDG", lat: -18.8, lng: 46.9, name_ja: "マダガスカル", region: "Africa" },
  MOZ: { iso3: "MOZ", lat: -18.7, lng: 35.5, name_ja: "モザンビーク", region: "Africa" },
  ZMB: { iso3: "ZMB", lat: -13.1, lng: 27.85, name_ja: "ザンビア", region: "Africa" },
  BFA: { iso3: "BFA", lat: 12.2, lng: -1.6, name_ja: "ブルキナファソ", region: "Africa" },

  // === Oceania ===
  AUS: { iso3: "AUS", lat: -25.3, lng: 133.8, name_ja: "オーストラリア", region: "Oceania" },
  NZL: { iso3: "NZL", lat: -40.9, lng: 174.9, name_ja: "ニュージーランド", region: "Oceania" },
  FJI: { iso3: "FJI", lat: -16.6, lng: 179.4, name_ja: "フィジー", region: "Oceania" },
  PNG: { iso3: "PNG", lat: -6.3, lng: 143.96, name_ja: "パプアニューギニア", region: "Oceania" },
  VUT: { iso3: "VUT", lat: -15.4, lng: 166.96, name_ja: "バヌアツ", region: "Oceania" },

  // === Additional sellers / atlas coverage ===
  BTN: { iso3: "BTN", lat: 27.5, lng: 90.4, name_ja: "ブータン", region: "Asia" },
  UZB: { iso3: "UZB", lat: 41.4, lng: 64.6, name_ja: "ウズベキスタン", region: "Asia" },
  GEO: { iso3: "GEO", lat: 42.3, lng: 43.4, name_ja: "ジョージア", region: "Asia" },
  PRY: { iso3: "PRY", lat: -23.4, lng: -58.4, name_ja: "パラグアイ", region: "South America" },
  DOM: { iso3: "DOM", lat: 18.7, lng: -70.2, name_ja: "ドミニカ共和国", region: "South America" },
  DMA: { iso3: "DMA", lat: 15.4, lng: -61.4, name_ja: "ドミニカ国", region: "South America" },
  BEN: { iso3: "BEN", lat: 9.3, lng: 2.3, name_ja: "ベナン", region: "Africa" },
  GAB: { iso3: "GAB", lat: -0.8, lng: 11.6, name_ja: "ガボン", region: "Africa" },
  TUN: { iso3: "TUN", lat: 33.9, lng: 9.6, name_ja: "チュニジア", region: "Africa" },
};

/**
 * Atlas データの jurisdiction 文字列 → ISO3 マッピング.
 * 表記揺れ吸収 (例: "EU27+" → DEU, "British Columbia" → CAN).
 */
export const JURISDICTION_TO_ISO3: Record<string, string> = {
  // === Direct mappings ===
  Albania: "ALB",
  Argentina: "ARG",
  Australia: "AUS",
  Austria: "AUT",
  Bangladesh: "BGD",
  Belgium: "BEL",
  Brazil: "BRA",
  Bulgaria: "BGR",
  Cambodia: "KHM",
  Canada: "CAN",
  Chile: "CHL",
  China: "CHN",
  Colombia: "COL",
  "Costa Rica": "CRI",
  Croatia: "HRV",
  "Czech Republic": "CZE",
  Czechia: "CZE",
  Denmark: "DNK",
  Ecuador: "ECU",
  Egypt: "EGY",
  Estonia: "EST",
  Ethiopia: "ETH",
  Finland: "FIN",
  France: "FRA",
  Germany: "DEU",
  Ghana: "GHA",
  Greece: "GRC",
  Guatemala: "GTM",
  Hungary: "HUN",
  Iceland: "ISL",
  India: "IND",
  Indonesia: "IDN",
  Iran: "IRN",
  Iraq: "IRQ",
  Ireland: "IRL",
  Israel: "ISR",
  Italy: "ITA",
  Japan: "JPN",
  Jordan: "JOR",
  Kazakhstan: "KAZ",
  Kenya: "KEN",
  "Korea, Rep.": "KOR",
  Korea: "KOR",
  Kuwait: "KWT",
  Laos: "LAO",
  Latvia: "LVA",
  Liechtenstein: "LIE",
  Lithuania: "LTU",
  Malaysia: "MYS",
  Mexico: "MEX",
  Mongolia: "MNG",
  Montenegro: "MNE",
  Morocco: "MAR",
  Nepal: "NPL",
  Netherlands: "NLD",
  "New Zealand": "NZL",
  Nigeria: "NGA",
  Norway: "NOR",
  Pakistan: "PAK",
  Panama: "PAN",
  "Papua New Guinea": "PNG",
  Peru: "PER",
  Philippines: "PHL",
  Poland: "POL",
  Portugal: "PRT",
  Qatar: "QAT",
  Romania: "ROU",
  "Saudi Arabia": "SAU",
  Senegal: "SEN",
  Serbia: "SRB",
  Singapore: "SGP",
  Slovenia: "SVN",
  "South Africa": "ZAF",
  Spain: "ESP",
  "Sri Lanka": "LKA",
  Sweden: "SWE",
  Switzerland: "CHE",
  Tanzania: "TZA",
  Thailand: "THA",
  Turkey: "TUR",
  Türkiye: "TUR",
  Uganda: "UGA",
  Ukraine: "UKR",
  "United Arab Emirates": "ARE",
  "United Kingdom": "GBR",
  UK: "GBR",
  "United States": "USA",
  USA: "USA",
  Uruguay: "URY",
  Venezuela: "VEN",
  Vietnam: "VNM",

  // === Additional countries (OffsetsDB Top30 + others) ===
  Rwanda: "RWA",
  Malawi: "MWI",
  Madagascar: "MDG",
  Mozambique: "MOZ",
  Zambia: "ZMB",
  "Burkina Faso": "BFA",
  "DR Congo": "COD",
  "Democratic Republic of the Congo": "COD",
  Congo: "COG",
  "Republic of the Congo": "COG",

  // === EU aggregate ===
  EU27: "DEU",
  "EU27+": "DEU",
  "European Union": "DEU",
  EU: "DEU",

  // === Subnational rollups (collapse to parent country) ===
  Alberta: "CAN",
  "British Columbia": "CAN",
  Quebec: "CAN",
  Saskatchewan: "CAN",
  Manitoba: "CAN",
  "New Brunswick": "CAN",
  "Newfoundland and Labrador": "CAN",
  "Nova Scotia": "CAN",
  Ontario: "CAN",
  "Prince Edward Island": "CAN",
  "Northwest Territories": "CAN",
  Nunavut: "CAN",
  Yukon: "CAN",
  California: "USA",
  Oregon: "USA",
  Washington: "USA",
  Massachusetts: "USA",
  "New York": "USA",
  RGGI: "USA",
  WCI: "USA",
  Tokyo: "JPN",
  Saitama: "JPN",
  Shanghai: "CHN",
  Beijing: "CHN",
  Guangdong: "CHN",
  Shenzhen: "CHN",
  Tianjin: "CHN",
  Hubei: "CHN",
  Chongqing: "CHN",
  Fujian: "CHN",

  // === WB / OffsetsDB の表記揺れ & typo 吸収 ===
  "Lao PDR": "LAO",
  Phillipines: "PHL", // cooperative.json の typo
  Bhutan: "BTN",
  Vanuatu: "VUT",
  Uzbekistan: "UZB",
  Georgia: "GEO",
  Paraguay: "PRY",
  "Dominican Republic": "DOM",
  Dominica: "DMA",
  Benin: "BEN",
  Gabon: "GAB",
  Tunisia: "TUN",
};

/** jurisdiction 文字列を ISO3 に変換. 見つからなければ null. */
export function jurisdictionToIso3(jur: string | null | undefined): string | null {
  if (!jur) return null;
  // 完全一致 -> trim 一致 -> なし
  if (JURISDICTION_TO_ISO3[jur]) return JURISDICTION_TO_ISO3[jur];
  const trimmed = jur.trim();
  if (JURISDICTION_TO_ISO3[trimmed]) return JURISDICTION_TO_ISO3[trimmed];
  // ISO3 そのもの (大文字 3 文字) ならそれを返す
  if (/^[A-Z]{3}$/.test(trimmed) && COUNTRY_GEO[trimmed]) return trimmed;
  return null;
}

/**
 * 国名 (jurisdiction / WB country / OffsetsDB country) を日本語に変換.
 * 解決できないものは元のラベルをそのまま返す.
 */
export function countryNameJa(label: string | null | undefined): string {
  if (!label) return "—";
  const iso3 = jurisdictionToIso3(label);
  if (iso3 && COUNTRY_GEO[iso3]) return COUNTRY_GEO[iso3].name_ja;
  return label;
}
