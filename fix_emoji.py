#!/usr/bin/env python3
import os
import glob

# Find all JSX files in admin folder
jsx_files = [
    'src/pages/admin/BedManagement.jsx',
    'src/pages/admin/Member.jsx', 
    'src/pages/admin/Appointment.jsx'
]

# Define replacements for broken emojis
replacements = [
    ('ðŸ"¡', '[DEBUG]'),
    ('âš ï¸', '[WARNING]'),
    ('ðŸ§ª', '[TEST]'),
    ('âœ…', '[OK]'),
    ('âŒ', '[FAIL]'),
    ('â˜…', '[STAR]'),
    ('âˆ'', '[MINUS]'),
    ('âœ"', '[CHECK]'),
    ('âœ•', '[X]'),
]

for filepath in jsx_files:
    if os.path.exists(filepath):
        try:
            # Read file with permissive encoding
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Store original for comparison
            original_content = content
            
            # Apply all replacements
            for old, new in replacements:
                content = content.replace(old, new)
            
            # Write back if changed
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'✓ FIXED: {filepath}')
            else:
                print(f'  OK: {filepath} (no changes needed)')
                
        except Exception as e:
            print(f'✗ ERROR in {filepath}: {e}')
    else:
        print(f'✗ NOT FOUND: {filepath}')

print('\nDone!')
