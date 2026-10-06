import os
import re

def convert_to_peso(match):
    num_str = match.group(1).replace(',', '')
    has_k = match.group(3) == 'k'
    
    val = float(num_str)
    if has_k:
        val *= 1000
        
    peso_val = val * 56  # Exchange rate 1 USD = 56 PHP
    
    # Determine formatting based on the original format and magnitude
    if has_k:
        if peso_val >= 1000000:
            return f"₱{peso_val/1000000:.1f}M".replace('.0M', 'M')
        elif peso_val >= 1000:
            return f"₱{peso_val/1000:.1f}k".replace('.0k', 'k')
        else:
            return f"₱{peso_val:,.0f}"
    else:
        # Check if original had decimals
        if '.' in num_str:
            return f"₱{peso_val:,.2f}"
        else:
            # Maybe use k if peso_val >= 10000? Let's stick to commas if no k in original
            # Actually, original $900 -> ₱50.4k or ₱50,400. Let's do ₱50,400.
            if peso_val >= 10000:
                return f"₱{peso_val/1000:.1f}k".replace('.0k', 'k')
            return f"₱{peso_val:,.0f}"

files = [
    'c:/Users/Chase/Documents/my-supabase-project/src/admin/dashboard.html',
    'c:/Users/Chase/Documents/my-supabase-project/src/admin/reports.html'
]

pattern = re.compile(r'\$([0-9,]+(\.[0-9]+)?)(k)?')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = pattern.sub(convert_to_peso, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Conversion complete.")
