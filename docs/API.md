# API and deployment

The existing SVG HTTP routes are preserved:

| Route | Required query | Useful options |
| --- | --- | --- |
| /api | username | theme, show_icons, hide_rank, show, locale, hide, exclude_repo |
| /api/pin | username, repo | theme, show_owner, locale |
| /api/top-langs | username | theme, layout, langs_count, hide, exclude_repo, size_weight, count_weight |
| /api/gist | id | theme, show_owner, locale |
| /api/wakatime | username | theme, layout, langs_count, hide |

Shared visual options depend on the card: title_color, text_color, bg_color, border_color, border_radius, hide_border. Inspect each handler in `api/` for the complete supported parameter set. Language card layouts include normal, compact, donut, donut-vertical and pie. Language percentages do not measure proficiency.

Example (replace YOUR_DEPLOYMENT with a verified instance URL):

```text
https://YOUR_DEPLOYMENT/api?username=Neguchads&theme=neguchads&show_icons=true
https://YOUR_DEPLOYMENT/api/pin?username=Neguchads&repo=navi-githomepage&theme=neguchads
https://YOUR_DEPLOYMENT/api/top-langs?username=Neguchads&theme=neguchads_light&layout=donut
```

For deployment, import this repository into a reviewed Vercel project using the existing vercel.json. Store PAT_1 only in server-side environment configuration; use credentials restricted to public data. Never use a token with private repository access on a public instance. Review status routes and WakaTime outbound domain handling before exposing the API. No public instance is provisioned or endorsed here. The static explorer works without API tokens. Cache and error behavior are defined in the handlers; do not disable safeguards casually.

### WakaTime destination policy

Only the official HTTPS origin `wakatime.com` is supported. The optional legacy `api_domain` parameter is accepted only for that host (optional trailing slash). Custom instances require a separately reviewed server-side adapter; arbitrary caller-selected destinations are rejected. Redirects are disabled, request time is limited to 10 seconds and response size to 2 MiB.
