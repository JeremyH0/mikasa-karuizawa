<?php
/**
 * SAMPLE — copy this to the server as `inquiry-config.php`, ONE LEVEL ABOVE
 * the web root, so it can never be served over HTTP.
 *
 * On Xserver that means:
 *     /home/<account>/mikasa-karuizawa.com/inquiry-config.php     ← here
 *     /home/<account>/mikasa-karuizawa.com/public_html/           ← the site
 *
 * Because scripts/deploy.sh's rsync is additive (no --delete by default), a
 * file placed here by hand survives every future deploy untouched.
 *
 * This sample stays in the repo as documentation. The real file is NOT in the
 * repo and must never be committed.
 *
 * ⚠ recipients / from / site_host below are placeholders — the real enquiry
 * mailbox has not been decided yet. Nothing sends correctly until this file
 * exists on the server with real values.
 */

return [
    // Everyone listed gets a copy of each enquiry.
    //
    // To add a recipient later you can either add it here, or — easier — add
    // a forwarder to the mailbox in the Xserver control panel (メール転送),
    // which needs no file access and no developer.
    'recipients' => [
        'info@mikasa-karuizawa.com',
    ],

    // The sending identity. Keep this on the domain: putting the visitor's
    // address here would fail SPF/DMARC and land the mail in spam.
    'from'      => 'info@mikasa-karuizawa.com',
    'from_name' => 'Old Karuizawa — Mikasa',

    // Used for the same-origin check. No protocol, no trailing slash.
    'site_host' => 'mikasa-karuizawa.com',

    // Where the per-IP rate-limit counters are written. Must be writable by
    // PHP and OUTSIDE the web root. The system temp directory is a safe
    // default if you would rather not create one.
    'rate_dir'    => sys_get_temp_dir(),
    'rate_max'    => 5,     // max submissions per IP per window
    'rate_window' => 3600,  // window length in seconds
    'min_seconds' => 3,     // ignore anything submitted faster than this
];
