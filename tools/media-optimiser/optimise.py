#!/usr/bin/env python3
"""
Web Media Optimiser for Friends of the Commons
----------------------------------------------
Converts and optimises dropped images and videos for the website & Decap CMS.
- Images (JPG, PNG, HEIC, TIFF, WebP) -> Optimised WebP (max 1920px, auto-rotated, stripped EXIF, ~80% quality)
- Videos (MOV, MP4, M4V, MKV) -> Web-ready MP4 (H.264/AAC, 1080p, faststart) and/or AV1
- Clean web-safe filenames (slugified: lowercase, hyphens instead of spaces)
- Reports total bytes saved
"""

import os
import sys
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

# Supported extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.heic', '.heif', '.tiff', '.tif', '.webp', '.bmp'}
VIDEO_EXTENSIONS = {'.mov', '.mp4', '.m4v', '.avi', '.mkv', '.webm'}

def clean_filename(stem: str) -> str:
    """Convert filename to clean, SEO-friendly, web-safe slug."""
    s = stem.lower()
    # Remove apostrophes and quotes
    s = re.sub(r"['\"]", "", s)
    # Replace non-alphanumeric characters with hyphens
    s = re.sub(r"[^a-z0-9]+", "-", s)
    # Strip leading/trailing hyphens
    s = s.strip("-")
    return s if s else "media"

def format_size(bytes_num: int) -> str:
    """Format bytes into readable string (KB / MB)."""
    if bytes_num < 1024 * 1024:
        return f"{bytes_num / 1024:.1f} KB"
    return f"{bytes_num / (1024 * 1024):.1f} MB"

def get_unique_output_path(output_dir: Path, base_name: str, ext: str) -> Path:
    """Avoid overwriting existing files in the output directory."""
    candidate = output_dir / f"{base_name}{ext}"
    counter = 1
    while candidate.exists():
        candidate = output_dir / f"{base_name}-{counter}{ext}"
        counter += 1
    return candidate

def optimise_image(src_path: Path, output_dir: Path, max_dimension: int = 1920, quality: int = 82) -> tuple[int, int, Path]:
    """
    Optimise an image to modern WebP format.
    Handles HEIC via macOS sips if needed, auto-orients, resizes, strips EXIF.
    Returns (orig_size, new_size, output_file).
    """
    from PIL import Image, ImageOps

    orig_size = src_path.stat().st_size
    slug = clean_filename(src_path.stem)
    out_path = get_unique_output_path(output_dir, slug, ".webp")

    # If HEIC/HEIF and PIL might not support it directly, use sips to produce an intermediate PNG
    temp_png = None
    read_path = src_path
    if src_path.suffix.lower() in {'.heic', '.heif'}:
        temp_fd, temp_png_path = tempfile.mkstemp(suffix=".png")
        os.close(temp_fd)
        temp_png = Path(temp_png_path)
        try:
            subprocess.run(["sips", "-s", "format", "png", str(src_path), "--out", str(temp_png)],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            read_path = temp_png
        except Exception:
            # Fall back to trying PIL directly
            read_path = src_path

    try:
        with Image.open(read_path) as img:
            # Auto-orient based on EXIF
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            # Convert CMYK or P palette modes to RGB/RGBA for web
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            # Resize if either dimension exceeds max_dimension
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            # Save as WebP
            img.save(out_path, "WEBP", quality=quality, method=6)

    finally:
        if temp_png and temp_png.exists():
            try:
                temp_png.unlink()
            except Exception:
                pass

    new_size = out_path.stat().st_size
    return orig_size, new_size, out_path

def optimise_video(src_path: Path, output_dir: Path, max_height: int = 1080) -> tuple[int, int, Path]:
    """
    Compress video for fast web playback.
    Prefers ffmpeg (H.264 + AAC + faststart), falls back to macOS avconvert.
    Returns (orig_size, new_size, output_file).
    """
    orig_size = src_path.stat().st_size
    slug = clean_filename(src_path.stem)
    out_path = get_unique_output_path(output_dir, slug, ".mp4")

    ffmpeg_bin = shutil.which("ffmpeg")

    if ffmpeg_bin:
        # Scale to max 1920x1080 (landscape) or 1080x1920 (portrait), maintaining aspect ratio, even dimensions
        vf_filter = "scale='if(gt(a,1),min(1920,iw),-2)':'if(gt(a,1),-2,min(1080,ih))'"
        cmd = [
            ffmpeg_bin, "-y",
            "-i", str(src_path),
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "24",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "128k",
            "-movflags", "+faststart",
            str(out_path)
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode != 0:
            raise RuntimeError(f"ffmpeg conversion failed for {src_path.name}")
    else:
        # Fallback to macOS built-in avconvert
        avconvert_bin = shutil.which("avconvert")
        if not avconvert_bin:
            raise RuntimeError("Neither ffmpeg nor avconvert found on system")
        cmd = [
            avconvert_bin,
            "-p", "PresetAppleM4V1080pHD",
            "-s", str(src_path),
            "-o", str(out_path)
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode != 0:
            raise RuntimeError(f"avconvert failed for {src_path.name}")

    new_size = out_path.stat().st_size
    return orig_size, new_size, out_path

def collect_files(inputs: list[str]) -> list[Path]:
    """Collect all valid media files from dropped files or directories."""
    files: list[Path] = []
    valid_exts = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
    for item in inputs:
        p = Path(item).resolve()
        if p.is_file() and p.suffix.lower() in valid_exts:
            files.append(p)
        elif p.is_dir():
            for sub in p.rglob("*"):
                if sub.is_file() and sub.suffix.lower() in valid_exts:
                    files.append(sub)
    return files

def main():
    if len(sys.argv) < 2:
        print("Usage: optimise.py <file1> <file2> ...")
        sys.exit(1)

    raw_inputs = sys.argv[1:]
    # Parse optional --output-dir / -o
    output_dir_arg = os.environ.get("OPTIMISER_OUTPUT_DIR") or os.environ.get("OPTIMIZER_OUTPUT_DIR")
    clean_inputs = []
    i = 0
    while i < len(raw_inputs):
        arg = raw_inputs[i]
        if arg in ("-o", "--output-dir") and i + 1 < len(raw_inputs):
            output_dir_arg = raw_inputs[i + 1]
            i += 2
        else:
            clean_inputs.append(arg)
            i += 1

    files = collect_files(clean_inputs)

    if not files:
        print("NO_FILES_FOUND")
        sys.exit(0)

    # Output directory defaults to ~/Desktop/Optimised for Web
    if output_dir_arg:
        output_dir = Path(output_dir_arg).resolve()
    else:
        desktop = Path.home() / "Desktop"
        output_dir = desktop / "Optimised for Web"
    output_dir.mkdir(parents=True, exist_ok=True)

    total_orig = 0
    total_new = 0
    count = 0
    errors = []

    for f in files:
        ext = f.suffix.lower()
        try:
            if ext in IMAGE_EXTENSIONS:
                orig_s, new_s, out_f = optimise_image(f, output_dir)
            elif ext in VIDEO_EXTENSIONS:
                orig_s, new_s, out_f = optimise_video(f, output_dir)
            else:
                continue

            total_orig += orig_s
            total_new += new_s
            count += 1
        except Exception as e:
            errors.append(f"{f.name}: {str(e)}")

    if count == 0:
        print("ERROR: No files could be processed.")
        if errors:
            print("\n".join(errors))
        sys.exit(1)

    savings = max(0, total_orig - total_new)
    pct = (savings / total_orig * 100) if total_orig > 0 else 0

    # Summary output formatted for AppleScript dialog / notification
    msg = f"Optimised {count} file{'s' if count != 1 else ''}!\\n"
    msg += f"Original: {format_size(total_orig)} → Web: {format_size(total_new)}\\n"
    msg += f"Saved: {pct:.0f}% space ({format_size(savings)} reduction)"

    # Print summary to stdout
    print(f"SUCCESS|{count}|{format_size(total_orig)}|{format_size(total_new)}|{pct:.0f}%|{str(output_dir)}")

if __name__ == "__main__":
    main()
