/**
 * 文脈化した相談 CTA のコピー (STRATEGY §4-5 / §9).
 *
 * ツールは判断を「囲む」(理解・比較・論点・監視)。判断そのもの (どれを選ぶか・
 * 量・タイミング・稟議の物語) は会社固有なので人 = コンサル (CradleTo) が持つ。
 *
 * 分界線を「正直に引く」こと自体が価値:
 *   「ここまではツールで出揃った。ここから先は貴社固有なので人が要る」
 * と言うことが信頼になり、同時に文脈化された (汎用「相談する」より強い) ハンドオフ
 * になる。コピーはこの一貫した型で書く:
 *   「上記は〈ツールが出したもの〉まで。〈会社固有の判断〉は CradleTo が対応する。」
 *
 * 純粋関数 (UI 非依存) にして、コピーをこの 1 ファイルで編集できるようにする。
 */

import type { EntityType } from "./types";

export const CONTACT_URL = "https://carboncredits.jp/contact";

export type ConsultCopy = {
  /** CTA 見出し */
  title: string;
  /** 分界線を示す本文 */
  body: string;
};

const ENTITY_COPY: Record<EntityType, (name: string) => ConsultCopy> = {
  regulation: (name) => ({
    title: "貴社への影響評価・対応方針",
    body: `上記は ${name} の制度構造と論点の整理まで。開示・調達・コストへの効き方と対応の優先順位づけは貴社固有の判断になる。株式会社クレイドルトゥーが伴走する。`,
  }),
  methodology: (name) => ({
    title: "調達・創出計画への落とし込み",
    body: `上記は ${name} の手法・適格性の構造化まで。貴社のポートフォリオへの組み込みと個別プロジェクトのデューデリは会社固有の判断になる。クレイドルトゥーが対応する。`,
  }),
  technology: (name) => ({
    title: "技術選定・事業化のご相談",
    body: `上記は ${name} の技術・市場の整理まで。貴社の脱炭素計画や投資判断への落とし込みは個別案件の判断になる。クレイドルトゥーが対応する。`,
  }),
  market: (name) => ({
    title: "市場動向の個別評価",
    body: `上記は ${name} の構造と論点の整理まで。貴社の調達・開示戦略への翻訳は会社固有の判断になる。クレイドルトゥーが対応する。`,
  }),
  player: (name) => ({
    title: "取引・選定のご相談",
    body: `上記は ${name} の役割整理まで。取引条件の評価・選定は個別案件の判断になる。クレイドルトゥーが対応する。`,
  }),
  project: (name) => ({
    title: "個別プロジェクトの評価",
    body: `上記は ${name} の概要整理まで。投資・調達の可否判断と現地デューデリは会社固有の判断になる。クレイドルトゥーが対応する。`,
  }),
};

export function consultCopyForEntity(type: EntityType, name: string): ConsultCopy {
  return ENTITY_COPY[type](name);
}

export function consultCopyForMatrix(): ConsultCopy {
  return {
    title: "貴社要件への翻訳・個別判断",
    body: "上記の比較は判断材料の整理まで。どれを選ぶかは予算・リスク許容度・目的という貴社固有の要件への翻訳が要る。株式会社クレイドルトゥー CDR 調達アドバイザリー / Recroma 本格コンサルが対応する。",
  };
}

export function consultCopyForTimeline(): ConsultCopy {
  return {
    title: "この動きの影響評価・対応",
    body: "上記はイベントの解釈と関連整理まで。貴社の事業・開示・調達にどう響くかの評価と対応方針は会社固有の判断になる。クレイドルトゥーが対応する。",
  };
}
