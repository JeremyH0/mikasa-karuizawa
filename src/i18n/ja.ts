// Japanese.
//
// DRAFT — written to be idiomatic luxury-property Japanese, but it has not yet
// had a native review. Tone target: quiet, restrained, 敬体 (です・ます), no
// exclamation, no hard sell. Edit freely here; no markup lives in this file.
//
// ⚠ Legal/regulatory terms below are the statutory Japanese wording under the
// 都市計画法 / 建築基準法 and must NOT be paraphrased:
//   第一種低層住居専用地域 (Category I Low-rise Exclusive Residential District)
//   建ぺい率 (building coverage ratio) · 容積率 (floor area ratio) · 宅地
// ⚠ land.rows.location.value is a real registered address — confirm against
//   the 登記簿 before launch. See docs/CONTENT.md.

import type { Dict } from './en';

const ja: Dict = {
    meta: {
        title: '旧軽井沢・三笠 | 森に抱かれた邸宅用地 | Hirafu Capital GK',
        description:
            '長野県旧軽井沢、三笠エリアの希少な邸宅用地。敷地面積2,926.84㎡（878.6坪）。旧軽銀座まで車で4分。',
    },

    nav: {
        overview: '概要',
        location: '立地',
        land: '土地',
        concept: 'コンセプト',
        inquire: 'お問い合わせ',
        menuLabel: 'メニューを開閉する',
        menuDialogLabel: 'ナビゲーションメニュー',
        placeLine: '旧軽井沢・三笠・長野',
        langLabel: '言語を変更する',
        backToTop: 'ページ上部へ戻る',
    },

    langPrompt: {
        message: 'このページを日本語でご覧になりますか。',
        accept: '日本語で見る',
        dismiss: 'このページのまま',
    },

    hero: {
        eyebrow: 'Old Karuizawa — 旧軽井沢',
        headingLine1: '日本有数の別荘地に佇む、',
        headingLine2: '森に抱かれた',
        headingLine3: 'プライベートな邸宅用地。',
        scroll: 'スクロール',
        alt: '黄金色の光に包まれた軽井沢の森を空から望む。幾重にも連なる山並みが霞の奥へと続いていく。',
    },

    overview: {
        eyebrow: '旧軽井沢',
        heading: '最も格式ある住所のひとつ',
        body1: '旧軽井沢は、古くから日本有数の別荘地として知られてきました。深い森、歴史ある別荘、そして時を経ても色褪せない建築が、ここにしかない暮らしを形づくっています。',
        body2: '閑静な三笠エリアに位置するこの敷地は、自然に囲まれた私邸を構えながら、軽井沢の中心にもほど近いという、今となっては得がたい機会をご提供します。',
        imageAlt: '木立に包まれた旧軽井沢の私道。夏の木漏れ日の先に、伝統的な木造の門が佇む。',
        features: {
            district: '格式ある旧軽井沢エリアに立地',
            privacy: '卓越したプライバシー',
            greenery: '豊かな緑と自然に囲まれた環境',
            ginza: '旧軽銀座まで4分',
        },
    },

    location: {
        eyebrow: '立地',
        heading: '軽井沢の中心に、ほど近く。',
        body: '敷地は市街地の北側、住宅地が森へと溶け込んでいくあたりに位置します。旧軽銀座、軽井沢駅、そして東京へと向かう新幹線。そのいずれもが手の届く距離にありながら、敷地そのものは深い木立にすっかりと守られています。',
        mapAlt: '軽井沢の地図。旧軽銀座と軽井沢駅の北側に敷地の位置を示す。',
        mapCaption: 'イメージ図であり、縮尺は正確ではありません。',
        pins: {
            site: '敷地',
            ginza: '旧軽銀座',
            station: '軽井沢駅',
        },
        note: '所要時間は目安です。特に記載のない場合はお車での時間となります。',
        times: {
            ginza: { label: '旧軽銀座', value: '4分' },
            station: { label: '軽井沢駅', value: '9分' },
            tokyo: { label: '東京駅', value: '70分', via: '北陸新幹線利用' },
            haneda: { label: '羽田空港', value: '2時間20分' },
        },
    },

    land: {
        eyebrow: '土地概要',
        headingLine1: '希有な広さを備えた敷地。',
        headingLine2: '三笠エリアでは滅多に出ることのない規模です。',
        tableHeading: '物件概要',
        rows: {
            location: { label: '所在地', value: '長野県軽井沢町旧軽井沢 三笠' },
            area: { label: '敷地面積', value: '2,926.84㎡（878.6坪）' },
            use: { label: '地目', value: '宅地' },
            zoning: { label: '用途地域', value: '第一種低層住居専用地域' },
            coverage: { label: '建ぺい率', value: '30%' },
            far: { label: '容積率', value: '50%' },
        },
        counter: { value: '2,926.84', unit: '㎡', sub: '878.6坪' },
        plan: {
            caption: '敷地概念図 — 1369-11',
            parcel: '1369-11',
            north: '北',
            road: '道路',
            scaleLabel: 'メートル',
            enlarge: '測量図を拡大表示',
            disclaimer:
                '図は概念図であり、実測に基づく正確な形状を示すものではありません。境界寸法は売主提供の測量図によるものです。ご購入にあたっては公図・地積測量図にてご確認ください。',
        },
    },

    concept: {
        eyebrow: '開発コンセプト',
        heading: '森に抱かれた、静謐な邸宅。',
        body: '建ぺい率30%、容積率50%。この敷地は、自らの木立の奥深くにゆったりと構える一邸を招き入れます。低く水平に伸び、風景に静かに沿う建築。どの部屋からも、主役はあくまで森であり続けます。',
        note: '画像はイメージであり、この敷地における計画の一例を示すものです。確定した設計ではなく、建物は販売対象に含まれません。',
        // Short labels for the desktop plate switcher. Deliberately NOT the
        // `images` strings above — those are long descriptive alt text, right
        // for a screen reader describing the picture, far too long for the
        // name of a button that selects it.
        plates: {
            aerial: '俯瞰',
            exterior: '外観',
            bathroom: '浴室',
            bedroom: '寝室',
        },
        images: {
            aerial: '森の中の開けた場所に、大きな寄棟屋根を戴く平屋の邸宅が佇むイメージ。夕暮れの光に包まれて。',
            exterior: '草地側から見た邸宅のイメージ。デッキが傾斜地の上へと張り出している。',
            bathroom: '石張りの浴室のイメージ。二つの洗面ボウルと深い浴槽が森に面する。',
            bedroom: '寝室のイメージ。全面のガラス開口が周囲の木立へと開かれている。',
        },
    },

    inquire: {
        eyebrow: 'お問い合わせ',
        heading: 'ご関心をお寄せください。',
        body: '本物件は非公開でのご紹介となります。測量図および権利関係を含む詳細資料をご希望の方は、下記フォームよりお問い合わせください。',
        name: 'お名前',
        email: 'メールアドレス',
        message: 'ご用件',
        submit: '送信する',
        sending: '送信中...',
        successTitle: 'ありがとうございます。',
        successBody: 'お問い合わせを承りました。詳細資料とともに、追ってご連絡いたします。',
        error: '送信できませんでした。お手数ですが info@mikasa-karuizawa.com まで直接メールをお送りください。',
        privacy: 'ご記入いただいた情報は、本件へのご返信のみに使用し、第三者に提供することはありません。',
    },

    footer: {
        company: 'Hirafu Capital 合同会社',
        tagline: '旧軽井沢・三笠',
        rights: 'All rights reserved.',
        disclaimer:
            '記載内容は公開時点のものであり、正確性を保証するものではなく、契約の一部を構成するものではありません。面積・寸法・所要時間はいずれも概算です。',
    },
};

export default ja;
