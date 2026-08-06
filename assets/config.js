/* Beacon — Supabase connection (public values; the publishable key is safe in a
   browser as long as Row Level Security is enabled on your tables). */
window.BEACON_SUPABASE = {
  url: 'https://flamqobtmbxvifwuyypm.supabase.co',
  key: 'sb_publishable_LZIYPW5JxEMBi3NXKBZyLw_dlz64joI'
};

/* Optional: a real Supabase account for the admin, so the admin also gets the
   chat. Create this account once (register on the site with this email +
   the admin password, verify the code), then admin login signs into it too.
   Uses Gmail "+tag" so the code still lands in the beacon.exams inbox. */
window.BEACON_ADMIN_EMAIL = 'beacon.exams+admin@gmail.com';
