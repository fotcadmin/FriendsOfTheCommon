#!/usr/bin/env bash
# ==============================================================================
# Installer for "Web Media Optimiser.app" (Friends of the Commons)
# Sets up a native macOS Drag-and-Drop Droplet on Lucy's Desktop or Applications
# ==============================================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
APP_NAME="Web Media Optimiser.app"
TARGET_DIR="${1:-$HOME/Desktop}"
TARGET_APP="$TARGET_DIR/$APP_NAME"

echo "---------------------------------------------------------"
echo "🌱 Friends of the Commons — Web Media Optimiser Installer"
echo "---------------------------------------------------------"

# 1. Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi
echo "✅ Found Python 3: $(python3 --version)"

# 2. Check/Install Pillow (PIL)
echo "🔍 Checking image processing library (Pillow)..."
if ! python3 -c "import PIL" &> /dev/null; then
    echo "📦 Installing Pillow for WebP conversion..."
    python3 -m pip install --quiet pillow || pip3 install --quiet pillow || {
        echo "⚠️ Could not auto-install pillow via pip. Trying with --break-system-packages..."
        python3 -m pip install --quiet --break-system-packages pillow
    }
fi
echo "✅ Pillow is ready (WebP support active)"

# 3. Check video tools (ffmpeg or avconvert)
if command -v ffmpeg &> /dev/null; then
    echo "✅ Found ffmpeg for high-efficiency video compression"
elif command -v avconvert &> /dev/null; then
    echo "✅ Found macOS built-in avconvert for video compression"
else
    echo "⚠️ Neither ffmpeg nor avconvert found. Videos may not be compressed."
fi

# 4. Compile AppleScript Droplet into native .app
echo "🔨 Compiling native macOS application..."
rm -rf "$TARGET_APP"
osacompile -o "$TARGET_APP" "$DIR/app_droplet.applescript"

# 5. Bundle optimise.py inside the App
echo "📦 Bundling optimisation engine inside the application..."
mkdir -p "$TARGET_APP/Contents/Resources"
cp "$DIR/optimise.py" "$TARGET_APP/Contents/Resources/optimise.py"
chmod +x "$TARGET_APP/Contents/Resources/optimise.py"

# 6. Ensure droplet receives drops
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes array" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0 dict" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeName string 'Media Files'" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:CFBundleTypeRole string 'Viewer'" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSHandlerRank string 'Alternate'" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSItemContentTypes array" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleDocumentTypes:0:LSItemContentTypes:0 string 'public.item'" "$TARGET_APP/Contents/Info.plist" 2>/dev/null || true

echo "---------------------------------------------------------"
echo "🎉 SUCCESS! Web Media Optimiser is ready at:"
echo "   $TARGET_APP"
echo ""
echo "How Lucy uses it:"
echo "1. Simply drag any photos or videos onto the '$APP_NAME' icon."
echo "2. The app converts images to WebP and videos to web-optimised MP4."
echo "3. The optimised files appear in a folder on the Desktop ('Optimised for Web')."
echo "4. Lucy uploads those optimised files straight into Decap CMS!"
echo "---------------------------------------------------------"
