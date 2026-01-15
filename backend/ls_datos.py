import os
print("Contents of '../Datos':")
if os.path.exists("../Datos"):
    for f in os.listdir("../Datos"):
        print(f" - {f}")
else:
    print("../Datos does not exist")
