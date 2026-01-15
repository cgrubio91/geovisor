import os
def check():
    print("Checking TIFF files in uploads:")
    if not os.path.exists("uploads"):
        print("Uploads folder not found")
        return
    for f in os.listdir("uploads"):
        if f.lower().endswith(('.tif', '.tiff')):
            path = os.path.join("uploads", f)
            size = os.path.getsize(path) / (1024*1024)
            print(f" - {f}: {size:.2f} MB")

check()
