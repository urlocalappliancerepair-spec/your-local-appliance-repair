# Your Local Appliance Repair — files-only website

## Upload
1. Unzip Your-Local-Appliance-Repair-Files-Only.zip.
2. Open the website-files folder. Everything inside is an individual file; there are no subfolders.
3. Select all files inside (Command+A on Mac or Ctrl+A on Windows).
4. On GitHub Upload files, click Choose your files and select all these files, or drag the selected files into the upload area.
5. Wait for all files, type Add website files as the commit message, and commit the changes.

Upload the files inside, not the ZIP or website-files folder. Keep every filename exactly as provided. The repository root should contain index.html, style.css, app.js, the images, and the other HTML files.

## How it works
All 22 pages are directly editable HTML files. Images, CSS, JavaScript, and pages now live together. Page links and asset references have been rewritten for this structure. The popup still opens after two seconds once per tab session, skips the privacy page, and preselects the appliance on service pages. No build or coding commands are needed to host these files.

For later hosting: publish the repository root (.), with no build command. Do not select dist for this files-only version. Uploading to GitHub alone does not connect your domain or start hosting. This version is intended for hosting at a domain root; a GitHub Pages project subpath needs a separate routing review.

## Before public launch
This is a copy of the private-preview site, not a completed SEO launch configuration. It retains noindex,nofollow on pages and the crawler block in robots.txt. Remove those intentionally when launching, add domain-specific canonical URLs and sitemap, and configure analytics IDs (currently empty in config.js). Test FormSubmit notifications again on the final domain; another activation may be needed. Service inquiry destination: urlocalappliancerepair@gmail.com. Never add private API keys to browser files.

The setup notice remains removed as requested. Successful provider acceptance does not independently prove inbox delivery. No live submission was sent while preparing this export.

This is a standalone export; edits to the ChatGPT preview do not automatically sync to GitHub. It replaces the earlier folder-based export. If the earlier dist folder was already committed, it is not needed for this version; use the files at the repository root for hosting.

Exported October 25, 2026. Original approved source: 19462b5986151f6f864edc025ce7a77c191e6409. Platform credentials and hosting-specific settings are excluded.
