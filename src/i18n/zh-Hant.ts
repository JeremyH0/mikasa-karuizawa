// Traditional Chinese — written for the Taiwan market.
//
// DRAFT — not yet natively reviewed. This is NOT a character conversion of
// zh-Hans: the register and vocabulary differ deliberately.
//   平方公尺 (not 平方米) · 車程 (not 车程) · 洽詢 (not 咨询)
//   建蔽率 / 容積率 are the standard Taiwanese planning terms and happen to
//   match the Japanese concepts closely, so they are used directly.
//
// ⚠ Japanese statutory zoning terms keep their Japanese form, as in zh-Hans —
// buyers need the exact string to search the Japanese registry.

import type { Dict } from './en';

const zhHant: Dict = {
    meta: {
        title: '舊輕井澤 · 三笠 | 森林私邸用地 | Hirafu Capital GK',
        description:
            '位於長野縣舊輕井澤三笠地區的稀有私邸用地，基地面積 2,926.84 平方公尺（878.6 坪），距舊輕銀座大街車程 4 分鐘。',
    },

    nav: {
        overview: '概覽',
        location: '位置',
        land: '土地',
        concept: '理念',
        inquire: '洽詢',
        menuLabel: '開啟或關閉導覽選單',
        menuDialogLabel: '導覽選單',
        placeLine: '舊輕井澤 · 三笠 · 長野',
        langLabel: '切換語言',
        backToTop: '返回頂部',
    },

    langPrompt: {
        message: '是否以繁體中文瀏覽本頁？',
        accept: '繁體中文',
        dismiss: '留在目前頁面',
    },

    hero: {
        eyebrow: 'Old Karuizawa · 旧軽井沢',
        heading: '森林環抱的私邸用地。',
        scroll: '向下捲動',
        alt: '黃昏時分俯瞰輕井澤森林，層疊山巒在暖色薄霧中漸次遠去。',
    },

    overview: {
        eyebrow: '舊輕井澤',
        heading: '最負盛名的地址之一',
        body1: '舊輕井澤長久以來被視為日本最負盛名的別墅勝地之一。參天林木、歷史悠久的別墅與歷久彌新的建築，共同構築起獨樹一幟的生活方式。',
        body2: '本基地座落於靜謐的三笠地區，既可在自然環抱中營造私人宅邸，又與輕井澤的中心地帶近在咫尺。這樣的機會已日漸稀有。',
        imageAlt: '舊輕井澤林蔭私道，夏日光影斑駁，盡頭是一座傳統木構門庭。',
        features: {
            district: '座落於尊貴的舊輕井澤地區',
            privacy: '極致私密',
            greenery: '為豐饒綠意與自然景觀所環抱',
            ginza: '距舊輕銀座大街 4 分鐘',
        },
    },

    location: {
        eyebrow: '位置優勢',
        heading: '與輕井澤中心，僅咫尺之遙。',
        body: '基地位於市鎮中心以北，住宅街區漸次隱入森林之處。舊輕銀座大街、輕井澤車站以及通往東京的新幹線皆近在咫尺，而基地本身則為成熟林木完全遮蔽。',
        mapAlt: '輕井澤地圖，標示基地位於舊輕銀座大街與輕井澤車站以北。',
        mapCaption: '此圖為示意圖，非按實際比例繪製。',
        // Two labels drawn ON the map. The deck's artwork already names Old
        // Ginza Street and marks the site with a star; these add the star's
        // name and the station, which the artwork leaves unlabelled.
        mapLabels: {
            site: '基地位置',
            station: '輕井澤車站',
        },
        note: '所需時間為約略估算，除另有註明外均為車程。',
        times: {
            ginza: { label: '舊輕銀座大街', value: '4 分鐘' },
            station: { label: '輕井澤車站', value: '9 分鐘' },
            tokyo: { label: '東京車站', value: '70 分鐘', via: '經北陸新幹線' },
            haneda: { label: '羽田機場', value: '2 小時 20 分' },
        },
    },

    land: {
        eyebrow: '土地概要',
        headingLine1: '規模難得的基地，',
        headingLine2: '在三笠地區實屬罕見。',
        tableHeading: '物件資訊',
        rows: {
            location: { label: '所在地', value: '長野縣輕井澤町舊輕井澤 三笠' },
            area: { label: '基地面積', value: '2,926.84 平方公尺（878.6 坪）' },
            use: { label: '土地用途', value: '宅地（住宅用地）' },
            zoning: { label: '使用分區', value: '第一種低層住居專用地域' },
            coverage: { label: '建蔽率', value: '30%' },
            far: { label: '容積率', value: '50%' },
        },
        counter: { value: '2,926.84', unit: '平方公尺', sub: '878.6 坪' },
        plan: {
            caption: '基地示意圖（地號 1369-11）',
            parcel: '1369-11',
            north: '北',
            road: '道路',
            scaleLabel: '公尺',
            enlarge: '檢視完整測量圖',
            disclaimer:
                '本圖為示意圖，未依實測精度繪製。境界尺寸依賣方提供之測量圖，買方應以登記地籍圖核實為準。',
        },
    },

    concept: {
        eyebrow: '開發理念',
        heading: '為森林所環抱的靜謐宅邸。',
        body: '建蔽率 30%，容積率 50%。這樣的條件，容得下一座從容舒展的宅邸，深藏於自家林木之後。建築低伏於地景之中，讓森林始終是每一扇窗外的主角。',
        note: '圖片為概念示意，僅呈現本基地的一種可能方案，並非已核准之設計。建物不包含在本次交易範圍內。',
        // Short labels for the desktop plate switcher. Deliberately NOT the
        // `images` strings above — those are long descriptive alt text, right
        // for a screen reader describing the picture, far too long for the
        // name of a button that selects it.
        // One short line beside each plate on desktop. Kept to a single
        // sentence: these sit in the white space of the cascade, and anything
        // longer turns that breathing room into a second column of body copy.
        notes: {
            exterior: '露台向草地探出，身後林木悄然合攏。',
            bathroom: '石材、暖湯，與窗外逼近的綠意。',
            bedroom: '醒來即在樹冠之中，眼前別無他物。',
        },
        plates: {
            aerial: '鳥瞰',
            exterior: '外觀',
            bathroom: '浴室',
            bedroom: '臥室',
        },
        images: {
            aerial: '概念圖：林中空地上，一座覆以寬闊歇山屋頂的平層宅邸，沐浴在黃昏光線中。',
            exterior: '概念圖：自草地望向宅邸，露臺懸挑於坡地之上。',
            bathroom: '概念圖：石材衛浴內設雙面盆與深浸浴缸，正對森林。',
            bedroom: '概念圖：臥室透過通高玻璃開向四周林木。',
        },
    },

    inquire: {
        eyebrow: '洽詢',
        heading: '歡迎洽詢。',
        body: '本物件以非公開方式洽售。如需完整資料（含測量圖與產權明細），敬請透過下方表單與我們聯繫。',
        name: '姓名',
        email: '電子郵件',
        message: '留言',
        submit: '送出諮詢',
        sending: '傳送中...',
        successTitle: '感謝您的關注。',
        successBody: '我們已收到您的諮詢，將盡快為您送上完整資料。',
        error: '很抱歉，訊息傳送失敗。請直接寄送電子郵件至 info@mikasa-karuizawa.com。',
        privacy: '您填寫的資訊僅用於回覆本次諮詢，絕不會提供給第三方。',
    },

    footer: {
        company: 'Hirafu Capital 合同會社',
        tagline: '舊輕井澤 · 三笠',
        rights: '版權所有。',
        disclaimer:
            '本資料所載內容於發布時確信無誤，惟不作任何保證，亦不構成契約之一部。面積、尺寸及所需時間均為約數。',
    },
};

export default zhHant;
