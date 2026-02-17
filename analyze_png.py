import struct
import os

def analyze_png(filepath):
    print(f"Analyzing {os.path.basename(filepath)}...")
    try:
        with open(filepath, 'rb') as f:
            signature = f.read(8)
            if signature != b'\x89PNG\r\n\x1a\n':
                print("❌ Invalid PNG signature")
                return

            print("✅ Valid PNG signature")
            
            chunk_idx = 0
            while True:
                length_bytes = f.read(4)
                if not length_bytes: break
                
                length = struct.unpack('>I', length_bytes)[0]
                chunk_type = f.read(4).decode('ascii')
                
                print(f"Chunk {chunk_idx}: {chunk_type} (length: {length})")
                
                # Skip data
                f.seek(length, 1)
                
                # Read CRC
                crc = f.read(4)
                if len(crc) < 4:
                    print("❌ Unexpected End of File during CRC")
                    return

                if chunk_type == 'IEND':
                    print("✅ Found IEND chunk")
                    if f.read(1):
                        print("⚠️ Warning: Trailing data after IEND")
                    break
                
                chunk_idx += 1
                
    except Exception as e:
        print(f"❌ Error analysis failed: {e}")

# Analyze the backup (original bad file)
print("--- Checking Original (Bad) File ---")
analyze_png(r"c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\assets\images\lotus_bud.png.bak")

# Analyze the replacement (known good file)
print("\n--- Checking Replacement (Good) File ---")
analyze_png(r"c:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\assets\images\lotus_bud.png")
