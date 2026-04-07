# Shakil Ahmed — Portfolio

ML & Computer Vision Engineer personal portfolio website.

---

## 📁 Project Structure

```
shakil-portfolio/
├── index.html                  ← Main HTML (the page)
├── assets/
│   ├── css/
│   │   └── style.css           ← All styles & animations
│   ├── js/
│   │   └── main.js             ← Neural network canvas + all interactivity
│   └── images/
│       └── profile.jpeg        ← ⚠️ Add your photo here!
└── README.md
```

---

## 🚀 How to Run

### Option 1 — Open Directly in Browser (Simplest)
Just double-click `index.html` to open it in any browser.

> ⚠️ **Note:** Some browsers block local fonts/scripts when opened as a file. If something looks off, use Option 2.

---

### Option 2 — Live Server (Recommended)

**With VS Code:**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Open the `shakil-portfolio/` folder in VS Code
3. Right-click `index.html` → **"Open with Live Server"**
4. Your browser opens at `http://127.0.0.1:5500`

---

### Option 3 — Python (No install needed)

Open your terminal inside the `shakil-portfolio/` folder and run:

```bash
# Python 3
python -m http.server 8000
```

Then open your browser at: **http://localhost:8000**

---

### Option 4 — Node.js / npx

```bash
npx serve .
```

Then open the URL shown in your terminal (usually **http://localhost:3000**).

---

## 🖼️ Adding Your Profile Photo

Place your photo file at:
```
assets/images/profile.jpeg
```
The image is referenced as `assets/images/profile.jpeg` in `index.html`.
Rename/replace as needed — any JPG or PNG works, just update the `src` in the `<img>` tag.

---

## ✉️ Contact Form

The contact form opens the visitor's email client with a pre-filled message.
Your email address is set in two places — update both if needed:

1. `index.html` — the `href="mailto:..."` on the Email contact row
2. `assets/js/main.js` — the last few lines of the contact form handler:
   ```js
   window.location.href = `mailto:shakilahmedxunayeed@gmail.com?subject=...`;
   ```

---

## 🌐 Deploying Online (Free Options)

| Platform       | How                                                                 |
|----------------|---------------------------------------------------------------------|
| **GitHub Pages** | Push to a GitHub repo → Settings → Pages → Deploy from `main`    |
| **Netlify**    | Drag & drop the `shakil-portfolio/` folder at netlify.com/drop      |
| **Vercel**     | `npx vercel` inside the folder                                      |

---

## 🛠️ Customisation Quick Reference

| What to change        | Where                              |
|-----------------------|------------------------------------|
| Name / bio / role     | `index.html` → Hero section        |
| About text            | `index.html` → About section       |
| Skills                | `index.html` → Skills section      |
| Projects              | `index.html` → Projects section    |
| Experience / Education| `index.html` → Experience section  |
| Colours / fonts       | `assets/css/style.css` → `:root`   |
| Canvas animation      | `assets/js/main.js` → top IIFE     |
