// English — the canonical dictionary.
//
// This file defines the SHAPE every other locale must match: add a key here
// first and TypeScript will flag the three translations that still lack it.
// Strings containing {placeholders} are filled via fmt() from ./config.
//
// Source copy: "Mikasa marketing material.pdf" (4 pages). Three wordings were
// corrected against the deck rather than reproduced verbatim — see
// docs/CONTENT.md for the list and the reasoning.

const en = {
    meta: {
        title: 'Old Karuizawa · Mikasa | A Private Woodland Estate | Hirafu Capital GK',
        description:
            'A 2,926.84 m² (878.6 tsubo) private woodland estate site in the exclusive Mikasa district of Old Karuizawa, Nagano — four minutes from Old Ginza Street.',
    },

    nav: {
        overview: 'Overview',
        location: 'Location',
        land: 'The Land',
        concept: 'Concept',
        inquire: 'Enquire',
        menuLabel: 'Toggle navigation menu',
        menuDialogLabel: 'Navigation menu',
        placeLine: 'Old Karuizawa · Mikasa · Nagano',
        langLabel: 'Change language',
        backToTop: 'Back to top',
    },

    // First-visit language suggestion. Never a forced redirect — the visitor
    // keeps whatever page they landed on unless they act on this.
    langPrompt: {
        message: 'View this page in English?',
        accept: 'View in English',
        dismiss: 'Stay on this page',
    },

    hero: {
        eyebrow: 'Old Karuizawa — 旧軽井沢',
        heading: 'A private woodland estate.',
        scroll: 'Scroll',
        alt: 'Aerial view over the forested hills of Karuizawa at golden hour, with layered mountain ridges receding into warm haze.',
    },

    overview: {
        eyebrow: 'Old Karuizawa',
        heading: 'One of the Most Prestigious Addresses',
        body1: 'Old Karuizawa has long been recognised as one of Japan’s most prestigious villa destinations, where mature woodland, historic villas and timeless architecture define an exceptional lifestyle.',
        body2: 'Nestled within the exclusive Mikasa district, the estate offers an increasingly rare opportunity to create a private residence surrounded by nature while remaining just moments from the heart of Karuizawa.',
        imageAlt: 'A quiet tree-lined private lane in Old Karuizawa leading to a traditional wooden villa gate, dappled with summer light.',
        features: {
            district: 'Located in the exclusive Old Karuizawa district',
            privacy: 'Exceptional privacy',
            greenery: 'Surrounded by rich greenery and natural landscapes',
            ginza: 'Four minutes to Old Ginza Street',
        },
    },

    location: {
        eyebrow: 'Location Highlights',
        heading: 'Moments from the heart of Karuizawa.',
        body: 'The site sits north of the town centre, where the residential grid dissolves into forest. Old Ginza Street, Karuizawa Station and the Shinkansen line to Tokyo all remain within easy reach — yet the estate itself is screened entirely by mature trees.',
        mapAlt: 'Illustrated map of Karuizawa showing the site location north of Old Ginza Street and Karuizawa Station.',
        // Small print directly under the map panel, distinct from `note`
        // below (which qualifies the travel-time figures, not the map).
        mapCaption: 'Illustrative map, not to scale.',
        pins: {
            site: 'Site location',
            ginza: 'Old Ginza Street',
            station: 'Karuizawa Station',
        },
        // `note` is the small print under the travel-time list.
        note: 'Travel times are approximate and by car unless stated otherwise.',
        times: {
            ginza: { label: 'Old Ginza Street', value: '4 min' },
            station: { label: 'Karuizawa Station', value: '9 min' },
            tokyo: { label: 'Tokyo Station', value: '70 min', via: 'via Hokuriku Shinkansen' },
            haneda: { label: 'Haneda Airport', value: '2 hr 20 min' },
        },
    },

    land: {
        eyebrow: 'Land at a Glance',
        headingLine1: 'A site of remarkable scale,',
        headingLine2: 'rarely available within Mikasa.',
        tableHeading: 'Development Information',
        rows: {
            location: { label: 'Location', value: 'Kyu-Karuizawa, Mikasa, Karuizawa, Nagano' },
            area: { label: 'Site Area', value: '2,926.84 m² (878.6 tsubo)' },
            use: { label: 'Current Land Use', value: 'Residential Land' },
            zoning: { label: 'Zoning', value: 'Category I Low-rise Exclusive Residential District' },
            coverage: { label: 'Building Coverage Ratio', value: '30%' },
            far: { label: 'Floor Area Ratio', value: '50%' },
        },
        // Counter under the site plan. {n} is animated from 0 on scroll.
        counter: { value: '2,926.84', unit: 'm²', sub: '878.6 tsubo' },
        plan: {
            caption: 'Indicative site plan — parcel 1369-11',
            parcel: '1369-11',
            north: 'N',
            road: 'Road',
            scaleLabel: 'metres',
            // Shown only below lg, where the survey drawing is too small to
            // read its own dimension figures. Opens the full-resolution scan.
            enlarge: 'View full survey',
            // Boundary dimensions as surveyed, in metres.
            disclaimer:
                'Diagram is indicative and not to survey accuracy. Boundary dimensions are as stated in the vendor’s survey; buyers should verify against the registered plan.',
        },
    },

    concept: {
        eyebrow: 'Development Concept',
        heading: 'A secluded estate embraced by nature.',
        body: 'With a building coverage ratio of 30% and a floor area ratio of 50%, the parcel invites a single, generously proportioned residence set well back behind its own treeline — architecture that sits low in the landscape and lets the woodland remain the principal view from every room.',
        note: 'Images are conceptual and illustrate one possible approach to the site. They do not represent an approved design, and no building is included in the sale.',
        // Short labels for the desktop plate switcher. Deliberately NOT the
        // `images` strings above — those are long descriptive alt text, right
        // for a screen reader describing the picture, far too long for the
        // name of a button that selects it.
        plates: {
            aerial: 'Aerial view',
            exterior: 'Exterior',
            bathroom: 'Bathroom',
            bedroom: 'Bedroom',
        },
        images: {
            aerial: 'Conceptual aerial view of a low, single-storey residence with a broad hipped roof set in a forest clearing at golden hour.',
            exterior: 'Conceptual view of the residence from the meadow, its deck cantilevered over the sloping ground.',
            bathroom: 'Conceptual interior view of a stone-lined bathroom with twin basins and a deep soaking tub facing the forest.',
            bedroom: 'Conceptual interior view of a bedroom opening through full-height glazing onto the surrounding woodland.',
        },
    },

    // Same shape as hc-property's `inquire` — this is a real form, posting to
    // public/inquiry.php (see docs/CONTACT-FORM.md), not a mailto link.
    inquire: {
        eyebrow: 'Enquiries',
        heading: 'Register your interest.',
        body: 'The estate is offered privately. For the full information pack, including the survey drawing and title particulars, please leave your details below.',
        name: 'Name',
        email: 'Email',
        message: 'Message',
        submit: 'Submit Enquiry',
        sending: 'Sending...',
        successTitle: 'Thank you for your interest.',
        successBody:
            'We have received your enquiry and will be in touch shortly with the full information pack.',
        // Shown only if the send actually fails, so the visitor is never left
        // believing a message went through when it did not.
        // ⚠ PLACEHOLDER address — the real enquiry mailbox is not decided yet.
        // Update alongside public/inquiry.php and inquiry-config.sample.php.
        error: 'Sorry — your message could not be sent. Please email us directly at info@mikasa-karuizawa.com.',
        privacy:
            'Your details are used only to respond to this enquiry and are never shared with third parties.',
    },

    footer: {
        company: 'Hirafu Capital GK',
        tagline: 'Old Karuizawa · Mikasa',
        rights: 'All rights reserved.',
        disclaimer:
            'Particulars are believed correct at the time of publication but are not warranted and do not form part of any contract. Areas, dimensions and travel times are approximate.',
    },
};

export default en;

/** Every locale file must satisfy this shape. */
export type Dict = typeof en;
