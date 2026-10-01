#!/usr/bin/env python3
"""
tools/fetch_images.py
Downloads Wikimedia Commons photos for Gujarat Heritage Explorer sites,
deletes stub files, and keeps data/sites.json and js/sitesData.js in sync.
"""

import os
import json
import urllib.request
import glob

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIKI_JSON_PATH = os.path.join(REPO_DIR, "scratch", "wiki_images.json")
SITES_JSON_PATH = os.path.join(REPO_DIR, "data", "sites.json")
SITES_DATA_JS_PATH = os.path.join(REPO_DIR, "js", "sitesData.js")
IMAGES_DIR = os.path.join(REPO_DIR, "images")

def remove_stub_files():
    """Deletes 60-byte stub files in images/."""
    for root, dirs, files in os.walk(IMAGES_DIR):
        for f in files:
            fp = os.path.join(root, f)
            try:
                if os.path.getsize(fp) <= 100:
                    os.remove(fp)
                    print(f"Removed stub file: {fp}")
            except Exception as e:
                print(f"Error removing {fp}: {e}")

def get_ext_from_url(url):
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        return ext
    return ".jpg"

def main():
    remove_stub_files()

    with open(WIKI_JSON_PATH, "r", encoding="utf-8") as f:
        wiki_data = json.load(f)

    # Ensure khodiyar-mata-rajpara entry is present
    wiki_data["khodiyar-mata-rajpara"] = [
        {
            "url": "https://upload.wikimedia.org/wikipedia/commons/d/df/Rajaparakhodiyarmandir1.JPG",
            "title": "File:Rajaparakhodiyarmandir1.JPG",
            "credit": "Dharmadhyaksha / Wikimedia Commons",
            "license": "CC BY-SA 3.0"
        }
    ]

    with open(WIKI_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(wiki_data, f, indent=2, ensure_ascii=False)

    with open(SITES_JSON_PATH, "r", encoding="utf-8") as f:
        sites = json.load(f)

    headers = {"User-Agent": "DigitalHeritageExplorer/1.0 (contact@example.com)"}

    for site in sites:
        site_id = site.get("id")
        if site_id in wiki_data and len(wiki_data[site_id]) > 0:
            site_imgs = wiki_data[site_id]
            new_images = []
            site_img_dir = os.path.join(IMAGES_DIR, site_id)
            os.makedirs(site_img_dir, exist_ok=True)

            for idx, item in enumerate(site_imgs):
                remote_url = item["url"]
                ext = get_ext_from_url(remote_url)
                local_fname = f"{idx + 1}{ext}"
                local_path = os.path.join(site_img_dir, local_fname)
                rel_path = f"images/{site_id}/{local_fname}".replace("\\", "/")

                downloaded = False
                if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
                    downloaded = True
                else:
                    try:
                        req = urllib.request.Request(remote_url, headers=headers)
                        with urllib.request.urlopen(req, timeout=10) as resp:
                            content = resp.read()
                            if len(content) > 500:
                                with open(local_path, "wb") as out:
                                    out.write(content)
                                downloaded = True
                    except Exception as e:
                        print(f"Could not download {remote_url} for {site_id}: {e}")

                final_src = rel_path if downloaded else remote_url

                new_images.append({
                    "src": final_src,
                    "alt": site.get("name", "Heritage Site"),
                    "credit": item.get("credit", "Wikimedia Commons"),
                    "license": item.get("license", "CC BY-SA")
                })

            if new_images:
                site["cover"] = new_images[0]["src"]
                site["images"] = new_images

    # Save data/sites.json
    with open(SITES_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(sites, f, indent=2, ensure_ascii=False)
    print(f"Updated {SITES_JSON_PATH}")

    # Save js/sitesData.js
    js_content = "window.EMBEDDED_SITES_DATA = " + json.dumps(sites, indent=2, ensure_ascii=False) + ";\n"
    with open(SITES_DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"Updated {SITES_DATA_JS_PATH}")

if __name__ == "__main__":
    main()
