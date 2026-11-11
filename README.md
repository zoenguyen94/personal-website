# Duong Nguyen — Portfolio Website

A static, single-page portfolio (HTML, CSS, JavaScript). No build step and no server code: upload the files to any static web host.

```
index.html          the page
css/styles.css      layout, Iowa State color palettes, breakpoints
js/main.js          light/dark toggle, palette picker, mobile menu, CV download
assets/cv.pdf       the CV behind every "Download CV" link
assets/favicon.svg  browser-tab icon
```

## Put it online

Upload everything in this folder except `README.md` and `assets/cv.docx` (neither is used by the page). Any of these work:

- **Netlify Drop** (fastest, free): go to https://app.netlify.com/drop and drag this folder onto the page. You get a public URL right away and can rename it in Site settings.
- **GitHub Pages** (free): create a repository, upload these files to it, then open Settings → Pages, choose "Deploy from a branch", pick `main` and `/ (root)`, and save. The site appears at `https://<username>.github.io/<repository>/`.
- **University or department web space**: copy the files into the web folder you were given, keeping the same folder structure.

## Common updates

- **Add your photo:** save it as `assets/photo.jpg`, then in `index.html` replace the `<div class="oval-photo" …>…</div>` block (marked with a comment) with
  `<img class="oval-photo" src="assets/photo.jpg" alt="Portrait of Duong Nguyen">`.
  A portrait-orientation photo works best.
- **Update the CV:** replace `assets/cv.pdf` with the new PDF (keep the file name).
- **Add a publication or presentation:** copy one `<li class="entry">…</li>` block in the matching section and edit the text. Update the counts in the hero stats if needed.
- **Change the default color theme:** visitors pick from Cardinal, Gold, Olive, and Stone in the header. To make another palette the default, add `data-palette="gold"` (or `olive`, `stone`) to the `<html>` tag.

## Responsive breakpoints

| Screen | Width | Layout |
|---|---|---|
| Mobile | below 768px | single column, menu button |
| iPad | 768–1199px | two columns, menu button |
| Desktop | 1200–1599px | three-column hero, full navigation |
| TV | 1600px and up | larger type and spacing |
