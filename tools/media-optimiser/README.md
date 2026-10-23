# Web Media Optimiser for Friends of the Commons

A simple, drag-and-drop Mac application designed for non-technical editors (like Lucy) to optimise images and videos before uploading them to the website via Decap CMS.

---

## Why Is This Needed?

1. **Decap CMS does not compress or convert media on upload:**
   When an image or video is uploaded in Decap CMS, it is committed **directly and verbatim** into the website's Git repository (`assets/images/`).
2. **iPhone Photos (HEIC) won't show on the web:**
   Apple devices capture photos in `.heic` format by default. Web browsers on Windows, Android, and older systems cannot display `.heic` files.
3. **Repository and Performance Bloat:**
   A modern smartphone photo is 5–15 MB (48 megapixels), and a short video clip can easily be 50–200 MB. Uploading these raw files bloats the Git repository forever, risks hitting GitHub's 100 MB file limit, and severely slows down mobile page load speeds for website visitors.

---

## What the Optimiser Does Automatically

Whenever files or folders are dropped onto **Web Media Optimiser.app**:

| Media Type | What It Does | Final Result |
| :--- | :--- | :--- |
| **Photos & Graphics** (`.jpg`, `.jpeg`, `.png`, `.heic`, `.tiff`, `.webp`) | • Converts to modern **WebP**<br>• Resizes max dimension to 1920px (retina-ready)<br>• Auto-rotates based on camera orientation<br>• Strips GPS/EXIF metadata (privacy + smaller size)<br>• Quality 82% sweet-spot | **80%–95% smaller file size** (e.g. 8 MB photo becomes ~150–250 KB with crisp visuals) |
| **Videos** (`.mov`, `.mp4`, `.m4v`, `.mkv`) | • Resizes from 4K down to clean 1080p<br>• Compresses with H.264 + AAC<br>• Adds `+faststart` (streams instantly without buffering)<br>• Clean web-safe MP4 | **85%–95% smaller file size** (e.g. 100 MB phone video becomes ~5–8 MB) |
| **Filenames** | • Auto-cleans filenames to web-safe slugs (e.g. `Lucy's Dog on Common 2026.heic` → `lucys-dog-on-common-2026.webp`) | No broken URL links or ugly `%20` spaces |

All converted files are automatically saved to:
`~/Desktop/Optimised for Web/`

The app plays a chime, displays a notification with the percentage of space saved, and opens the folder in Finder ready for upload!

---

## How to Set It Up on Lucy's MacBook Pro

### Option A: 1-Click Installer (Fastest if you have access to her Mac)
Open Terminal on Lucy's Mac and run:
```bash
cd /path/to/FriendsOfTheCommon/tools/media-optimiser
./install.sh
```
This will compile **`Web Media Optimiser.app`** directly onto her **Desktop**.

### Option B: Pre-Compiled App Bundle
You can build the app on your Mac and send her the `.app`:
1. Run `./install.sh /tmp`
2. Compress the app: `zip -r ~/Desktop/Web-Media-Optimiser.zip "/tmp/Web Media Optimiser.app"`
3. AirDrop or email `Web-Media-Optimiser.zip` to Lucy.
4. She double-clicks the zip to extract it, then drags **Web Media Optimiser** to her **Applications** folder or **Desktop**.
*(Tip: She can also drag the app icon into her macOS **Dock** for instant access!)*

---

## How Lucy Uses It (Everyday Workflow)

1. **Select Photos/Videos**: Take photos or AirDrop them from an iPhone to the Mac.
2. **Drag & Drop**: Drag the files directly onto the **Web Media Optimiser** icon on her Desktop or Dock. *(Or double-click the app to open a file picker).*
3. **Wait 2–5 seconds**: A notification appears: *"Saved 92% (15 MB → 1.2 MB)"*.
4. **Upload**: The `Optimised for Web` folder pops up automatically. She picks the `.webp` / `.mp4` files and uploads them into Decap CMS!
