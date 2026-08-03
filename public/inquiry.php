<?php
declare(strict_types=1);

/**
 * Contact form endpoint — mikasa-karuizawa.com
 * ---------------------------------------------------------------------------
 * Ported from thekaruizawaestate.com/hc-property (public/inquiry.php) — same
 * mechanism, same hardening, same reasoning. Keep the two in sync if either
 * is patched for a real problem.
 *
 * Lives in public/ so Astro copies it to the web root and the rsync deploy
 * (scripts/deploy.sh) uploads it. No workflow change, no server-side install.
 *
 * Delivery uses PHP's mail() on purpose. The destination mailbox sits on the
 * SAME Xserver machine, so this is local delivery — it never crosses the
 * internet and cannot be spam-filtered in transit. Authenticated SMTP only
 * earns its keep when sending outward (e.g. an autoreply to the enquirer),
 * which this version deliberately does not do. Switching later is a config
 * change, not a rewrite.
 *
 * SETTINGS LIVE OUTSIDE THIS FILE. See inquiry-config.sample.php and
 * docs/CONTACT-FORM.md. The real config sits ABOVE the web root so it can
 * never be served, and because deploys are additive it survives every upload.
 */

// ---------------------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------------------
$config = [
    // Every address here receives a copy. Add more by appending to the list —
    // though adding a forwarder on the mailbox in the Xserver panel is easier
    // and needs no file access at all.
    //
    // ⚠ PLACEHOLDER — the real recipient mailbox is not decided yet (see
    // Jeremy's note in the conversation). Nothing sends correctly until this,
    // 'from', and 'site_host' below are set to real values. See
    // inquiry-config.sample.php for the override file that keeps the real
    // address out of git entirely.
    'recipients' => ['info@mikasa-karuizawa.com'],

    // Must be a mailbox ON this domain. Using the visitor's address here would
    // fail SPF/DMARC and get the mail spam-foldered or rejected outright.
    'from'         => 'info@mikasa-karuizawa.com',
    'from_name'    => 'Old Karuizawa — Mikasa',
    'site_host'    => 'mikasa-karuizawa.com',
    'rate_dir'     => sys_get_temp_dir(),
    'rate_max'     => 5,     // submissions per window, per IP
    'rate_window'  => 3600,  // seconds
    'min_seconds'  => 3,     // reject anything submitted faster than a human could
];

$configPath = __DIR__ . '/../inquiry-config.php';
if (is_readable($configPath)) {
    $override = require $configPath;
    if (is_array($override)) {
        $config = array_merge($config, $override);
    }
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/**
 * Strip CR/LF before any value reaches a mail header.
 *
 * This is THE vulnerability in naive contact forms: a newline in the name or
 * email field lets an attacker inject extra headers (Bcc:, Content-Type:) and
 * turn the form into an open spam relay sending from your domain — which
 * destroys the domain's sending reputation. Never remove this.
 */
function header_safe(string $value): string
{
    return trim(str_replace(["\r", "\n", "\0", '%0a', '%0d'], '', $value));
}

/** RFC 2047 encode so Japanese/Chinese names survive in the Subject line. */
function encode_header(string $text): string
{
    if (preg_match('//u', $text) && preg_match('/[\x80-\xFF]/', $text)) {
        return '=?UTF-8?B?' . base64_encode($text) . '?=';
    }
    return $text;
}

/**
 * Make a value safe to use as the display name in `Name <addr@host>`.
 *
 * Stripping CR/LF alone is NOT enough. A name of
 *     Bob,victim@evil.com
 * survives header_safe() intact, and an address header is a comma-separated
 * LIST — so a lenient mail client can read that as a second recipient and
 * quietly send the reply to the attacker. Colons and angle brackets can be
 * abused the same way.
 *
 * None of these characters belong in a person's name, so they are removed
 * outright rather than escaped.
 */
function display_name_safe(string $name): string
{
    return trim(str_replace([',', ';', ':', '<', '>', '"', '\\', '@'], ' ', $name));
}

function field(string $name, int $max = 5000): string
{
    $raw = isset($_POST[$name]) ? (string) $_POST[$name] : '';
    // Normalise line endings, drop control chars except tab/newline.
    $raw = str_replace(["\r\n", "\r"], "\n", $raw);
    $raw = preg_replace('/[^\P{C}\n\t]/u', '', $raw) ?? '';
    return mb_substr(trim($raw), 0, $max);
}

/**
 * Where to send the visitor back to, chosen from a fixed whitelist.
 * Never reflect Referer or user input into a redirect — that is an open
 * redirect.
 */
function locale_path(string $locale): string
{
    $map = ['en' => '/', 'ja' => '/jp/', 'zh-Hans' => '/zh/', 'zh-Hant' => '/zh-hant/'];
    return $map[$locale] ?? '/';
}

function wants_json(): bool
{
    return isset($_SERVER['HTTP_X_REQUESTED_WITH'])
        && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'fetch';
}

/**
 * @param bool $ok
 */
function respond(bool $ok, string $locale, int $status = 200): void
{
    http_response_code($status);
    if (wants_json()) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok]);
        exit;
    }
    // Without JavaScript, bounce back to the page the visitor came from and
    // let the already-translated markup show the result. This is why no
    // English copy is hardcoded in this file.
    //
    // The fragment is load-bearing, not cosmetic: it makes the target element
    // match :target, which is what reveals the confirmation when there is no
    // JavaScript to do it. Otherwise the visitor sees the form again, assumes
    // it failed, and submits repeatedly.
    $fragment = $ok ? '#success-message' : '#form-error';
    header('Location: ' . locale_path($locale) . ($ok ? '?sent=1' : '?error=1') . $fragment, true, 303);
    exit;
}

function client_ip(): string
{
    return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}

// ---------------------------------------------------------------------------
// GUARDS
// ---------------------------------------------------------------------------
$locale = field('locale', 20);
if (!in_array($locale, ['en', 'ja', 'zh-Hans', 'zh-Hant'], true)) {
    $locale = 'en';
}

// 1. POST only.
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, $locale, 405);
}

// 2. Same-origin. Modern browsers always send Origin on a cross-origin POST,
//    so a mismatch is a genuine signal. A missing header is allowed through:
//    some privacy tools strip it, and blocking those would reject real people.
//
//    The comparison is against the host actually serving this request, not
//    only the configured one. "Same origin" genuinely means "same as whatever
//    domain this is running on" — anchoring it solely to site_host would
//    silently break the form on a staging domain or a renamed site.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost  = (string) parse_url($origin, PHP_URL_HOST);
    $requestHost = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    // HTTP_HOST can carry a port; Origin's host never does.
    if (str_contains($requestHost, ':')) {
        $requestHost = explode(':', $requestHost)[0];
    }
    $allowed = array_filter([$requestHost, strtolower((string) $config['site_host'])]);
    if ($originHost !== '' && !in_array(strtolower($originHost), $allowed, true)) {
        respond(false, $locale, 403);
    }
}

// 3. Honeypot. The field is hidden from humans; only a bot fills it in.
//    Answer 200 so the bot believes it succeeded and does not retry or adapt.
if (field('website', 200) !== '') {
    respond(true, $locale);
}

// 4. Submitted impossibly fast. The timestamp is set by JavaScript on load;
//    when it is absent (no-JS visitor) the check is simply skipped rather
//    than turned into a reason to reject someone.
$ts = (int) field('ts', 20);
if ($ts > 0 && (time() - (int) round($ts / 1000)) < (int) $config['min_seconds']) {
    respond(true, $locale);
}

// 5. Per-IP rate limit. Fails OPEN: if the directory is not writable we would
//    rather deliver an enquiry than lose one to a filesystem problem.
$rateFile = rtrim((string) $config['rate_dir'], '/') . '/mk_inq_' . sha1(client_ip()) . '.txt';
$hits = [];
if (is_readable($rateFile)) {
    $decoded = json_decode((string) file_get_contents($rateFile), true);
    if (is_array($decoded)) {
        $hits = $decoded;
    }
}
$cutoff = time() - (int) $config['rate_window'];
$hits = array_values(array_filter($hits, static fn($t): bool => (int) $t > $cutoff));
if (count($hits) >= (int) $config['rate_max']) {
    respond(false, $locale, 429);
}
$hits[] = time();
@file_put_contents($rateFile, json_encode($hits), LOCK_EX);

// ---------------------------------------------------------------------------
// VALIDATE
// ---------------------------------------------------------------------------
$name    = field('name', 200);
$email   = field('email', 320);
$message = field('message', 5000);

if ($name === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, $locale, 422);
}

// ---------------------------------------------------------------------------
// BUILD & SEND
// ---------------------------------------------------------------------------
$languageLabel = [
    'en'      => 'English',
    'ja'      => 'Japanese (日本語)',
    'zh-Hans' => 'Simplified Chinese (简体中文)',
    'zh-Hant' => 'Traditional Chinese (繁體中文)',
][$locale];

$safeName  = display_name_safe(header_safe($name));
$safeEmail = header_safe($email);

// The subject is an unstructured field, so it only needs CR/LF stripped —
// but reuse the same cleaned name so the two always agree.
$subject = encode_header('New enquiry — ' . $safeName);

// Plain text, never HTML: nothing a visitor types can then render as markup
// in whoever opens the mail.
$body = implode("\n", [
    'New enquiry from mikasa-karuizawa.com',
    str_repeat('-', 52),
    '',
    'Name:     ' . $name,
    'Email:    ' . $email,
    'Language: ' . $languageLabel . '   <- reply in this language',
    '',
    'Message:',
    '',
    $message,
    '',
    str_repeat('-', 52),
    'Received: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    'Page:     ' . locale_path($locale),
    'IP:       ' . client_ip(),
]);

$headers = implode("\r\n", [
    'From: ' . encode_header((string) $config['from_name']) . ' <' . header_safe((string) $config['from']) . '>',
    // Reply-To carries the visitor, so hitting Reply in any mail client just
    // works — while From stays on our own domain to keep SPF/DMARC aligned.
    'Reply-To: ' . encode_header($safeName) . ' <' . $safeEmail . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'MIME-Version: 1.0',
    'X-Mailer: mikasa-karuizawa.com',
]);

$to = implode(', ', array_map('header_safe', (array) $config['recipients']));

// The -f envelope sender is what SPF is actually checked against.
$sent = @mail($to, $subject, $body, $headers, '-f' . header_safe((string) $config['from']));

respond((bool) $sent, $locale, $sent ? 200 : 500);
