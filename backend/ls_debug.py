import os
print("Checking uploads folder:")
if os.path.exists("uploads"):
    for f in os.listdir("uploads"):
        print(f" - '{f}'")
else:
    print("uploads folder not found")

print("\nChecking Datos folder:")
if os.path.exists("Datos"):
    for f in os.listdir("Datos"):
        print(f" - '{f}'")
elif os.path.exists("../Datos"):
    for f in os.listdir("../Datos"):
        print(f" - '{f}'")
else:
    print("Datos folder not found")
