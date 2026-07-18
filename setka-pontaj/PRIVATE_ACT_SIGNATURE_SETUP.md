# Protected act signature setup

The frontend no longer contains the beneficiary signature/stamp. It requests the
image from the `act-signature` Supabase Edge Function only after the current user
has signed in. The function verifies the JWT and confirms that
`public.profiles.approved` is `true` before reading the image with the server-only
service-role key.

## Deployment checklist

1. In the Supabase project used by this site, create a **private** Storage bucket
   named `private-act-assets`. Do not make the bucket public and do not add an
   anonymous read policy.
2. Upload `beneficiary-signature-stamp.png` to the root of that private bucket.
3. Set these Edge Function secrets:

   - `APP_ORIGIN=https://geezfully.com`
   - `ACT_SIGNATURE_BUCKET=private-act-assets`
   - `ACT_SIGNATURE_PATH=beneficiary-signature-stamp.png`

   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
   provided by Supabase to deployed Edge Functions. The service-role key must
   never be added to `index.html`, GitHub, or any browser-visible environment.
4. Deploy `supabase/functions/act-signature` with JWT verification enabled.
5. Test the endpoint in all three states:

   - no JWT: must return `401`;
   - signed-in user whose profile is not approved: must return `403`;
   - approved signed-in user from `https://geezfully.com`: must return `200`
     with `Content-Type: image/png`.
6. Confirm that act preview, PDF download, print, archived preview, and archived
   PDF download all include the stamp.
7. Before publishing the frontend, remove the old embedded image from Git
   history if the repository or past deployment was public. Rotating database
   keys cannot remove an image already present in old commits.

## Archive behavior

New `saved_acts.document_html` records contain only an empty signature
placeholder. The image is reloaded from the protected function when an
authorized user previews or downloads an archived act. Legacy archived HTML is
also stripped client-side before display, but any old rows that already contain
the Base64 image should be cleaned after database access is available.
