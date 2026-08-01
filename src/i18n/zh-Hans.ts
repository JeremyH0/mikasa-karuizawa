// Simplified Chinese — written for the mainland market.
//
// DRAFT — not yet natively reviewed. Tone target: restrained, formal, no
// exclamation. Avoid Taiwan-only vocabulary here (物业 not 房產, 平方米 not
// 平方公尺, 面积 not 坪數) — the Traditional file is a separate register, not
// a character conversion of this one.
//
// ⚠ Japanese statutory zoning terms are kept in their Japanese form with a
// Chinese gloss, because 第一種低層住居専用地域 has no Chinese equivalent and
// buyers will need the exact term to search the registry.
// ⚠ Nothing on this page may load from fonts.googleapis.com — it is blocked in
// mainland China. CJK glyphs come from system fonts; see global.css.

import type { Dict } from './en';

const zhHans: Dict = {
    meta: {
        title: '旧轻井泽 · 三笠 | 森林私邸用地 | Hirafu Capital GK',
        description:
            '位于长野县旧轻井泽三笠地区的稀有私邸用地，占地 2,926.84 平方米（878.6 坪），距旧轻银座大街车程 4 分钟。',
    },

    nav: {
        overview: '概览',
        location: '位置',
        land: '土地',
        concept: '理念',
        inquire: '咨询',
        menuLabel: '打开或关闭导航菜单',
        menuDialogLabel: '导航菜单',
        placeLine: '旧轻井泽 · 三笠 · 长野',
        langLabel: '切换语言',
    },

    langPrompt: {
        message: '是否以简体中文浏览本页？',
        accept: '简体中文',
        dismiss: '留在当前页面',
    },

    hero: {
        eyebrow: '旧轻井泽 — 三笠',
        headingLine1: '静卧于日本最负盛名的',
        headingLine2: '别墅胜地之一，',
        headingLine3: '一处森林环抱的私邸用地。',
        place: '旧轻井泽',
        placeLocal: 'Old Karuizawa',
        scroll: '向下滚动',
        alt: '黄昏时分俯瞰轻井泽森林，层叠山峦在暖色薄雾中渐次远去。',
    },

    overview: {
        eyebrow: '旧轻井泽',
        heading: '最负盛名的地址之一',
        body1: '旧轻井泽长久以来被视为日本最负盛名的别墅胜地之一。参天的林木、历史悠久的别墅与历久弥新的建筑，共同构筑起独树一帜的生活方式。',
        body2: '本用地坐落于静谧的三笠地区，既可在自然环抱中营造私人宅邸，又与轻井泽的中心地带近在咫尺——这样的机会已日渐稀有。',
        imageAlt: '旧轻井泽林荫私道，夏日光影斑驳，尽头是一座传统木构门庭。',
        features: {
            district: '坐落于尊贵的旧轻井泽地区',
            privacy: '极致私密',
            greenery: '被丰饶绿意与自然景观环抱',
            ginza: '距旧轻银座大街 4 分钟',
        },
    },

    location: {
        eyebrow: '位置优势',
        heading: '与轻井泽中心，仅咫尺之遥。',
        body: '用地位于市镇中心以北，住宅街区渐次隐入森林之处。旧轻银座大街、轻井泽车站以及通往东京的新干线均近在咫尺，而用地本身则被成熟林木完全遮蔽。',
        mapAlt: '轻井泽地图，标示用地位于旧轻银座大街与轻井泽车站以北。',
        pins: {
            site: '用地位置',
            ginza: '旧轻银座大街',
            station: '轻井泽车站',
        },
        note: '所需时间为大致估算，除另有注明外均为驾车时间。',
        times: {
            ginza: { label: '旧轻银座大街', value: '4 分钟' },
            station: { label: '轻井泽车站', value: '9 分钟' },
            tokyo: { label: '东京站', value: '70 分钟', via: '经北陆新干线' },
            haneda: { label: '羽田机场', value: '2 小时 20 分' },
        },
    },

    land: {
        eyebrow: '土地概要',
        headingLine1: '规模难得的用地，',
        headingLine2: '在三笠地区实属罕见。',
        tableHeading: '物业信息',
        rows: {
            location: { label: '所在地', value: '长野县轻井泽町旧轻井泽 三笠' },
            area: { label: '用地面积', value: '2,926.84 平方米（878.6 坪）' },
            use: { label: '土地用途', value: '宅地（住宅用地）' },
            zoning: { label: '用途地区', value: '第一种低层住居专用地域' },
            coverage: { label: '建蔽率', value: '30%' },
            far: { label: '容积率', value: '50%' },
        },
        counter: { value: '2,926.84', unit: '平方米', sub: '878.6 坪' },
        plan: {
            caption: '用地示意图 — 地号 1369-11',
            parcel: '1369-11',
            north: '北',
            road: '道路',
            scaleLabel: '米',
            disclaimer:
                '本图为示意图，未按实测精度绘制。边界尺寸依据卖方提供的测量图，买方应以登记地籍图核实为准。',
        },
    },

    concept: {
        eyebrow: '开发理念',
        heading: '为森林所环抱的静谧宅邸。',
        body: '建蔽率 30%，容积率 50%。这样的条件，容得下一座从容舒展的宅邸，深藏于自家林木之后。建筑低伏于地景之中，让森林始终是每一扇窗外的主角。',
        note: '图片为概念示意，仅呈现本用地的一种可能方案，并非已获批准的设计。建筑不包含在本次交易范围内。',
        images: {
            aerial: '概念图：林中空地上，一座覆以宽阔歇山屋顶的平层宅邸，沐浴在黄昏光线中。',
            exterior: '概念图：自草地望向宅邸，露台悬挑于坡地之上。',
            bathroom: '概念图：石材浴室内设双洗手盆与深浸浴缸，正对森林。',
            bedroom: '概念图：卧室通过通高玻璃开向四周林木。',
        },
    },

    inquiry: {
        eyebrow: '咨询',
        heading: '欢迎垂询。',
        body: '本物业以非公开方式洽售。如需完整资料（含测量图与产权明细），敬请联系 Hirafu Capital 合同会社。',
        emailLabel: '电子邮件',
        email: 'info@hirafucapital.com',
        companyLabel: '卖方',
        company: 'Hirafu Capital 合同会社',
        cta: '通过邮件咨询',
        mailSubject: '咨询 — 旧轻井泽 三笠 用地',
    },

    footer: {
        company: 'Hirafu Capital 合同会社',
        tagline: '旧轻井泽 · 三笠',
        rights: '版权所有。',
        disclaimer:
            '本资料所载内容于发布时确信无误，但不作任何保证，亦不构成合同的组成部分。面积、尺寸及所需时间均为约数。',
    },
};

export default zhHans;
