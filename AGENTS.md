<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Portal content pages use dedicated protected routes with loader-backed shared query data; reuse existing school components and tokens to preserve branding.
- Private upload metadata is stored as bucket paths, with short-lived signed links generated on demand; storage and database ownership rules must remain consistent.
- Role changes run only through authenticated administrator-validated server functions; administrator role assignment is never exposed to public signup.
- Marks, file ownership, and class resource visibility are enforced in database triggers and policies in addition to form validation.
- Settings use existing app_settings, curriculum and audit tables through shared loader-backed queries; this preserves the countdown and avoids parallel configuration stores.
