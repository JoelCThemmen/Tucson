#!/bin/bash

# Script to fix light mode contrast issues across all pages

echo "Fixing light mode contrast issues..."

# Common replacements for better light mode contrast
FILES=$(find src -name "*.tsx" -o -name "*.ts")

for file in $FILES; do
    # Skip dark mode specific files
    if [[ $file == *"dark"* ]]; then
        continue
    fi
    
    # Text colors - make darker for better contrast
    sed -i 's/text-neutral-400/text-gray-600/g' "$file"
    sed -i 's/text-neutral-500/text-gray-600/g' "$file"
    sed -i 's/text-neutral-600/text-gray-700/g' "$file"
    sed -i 's/text-neutral-700/text-gray-800/g' "$file"
    sed -i 's/text-neutral-800/text-gray-900/g' "$file"
    sed -i 's/text-neutral-900/text-gray-900/g' "$file"
    
    # Background colors - add more contrast
    sed -i 's/bg-neutral-50 dark/bg-gray-100 dark/g' "$file"
    sed -i 's/bg-neutral-100 dark/bg-gray-200 dark/g' "$file"
    sed -i 's/bg-neutral-200 dark/bg-gray-300 dark/g' "$file"
    
    # Borders - make more visible
    sed -i 's/border-neutral-200 dark/border-gray-300 dark/g' "$file"
    sed -i 's/border-neutral-300 dark/border-gray-400 dark/g' "$file"
    sed -i 's/border-neutral-400 dark/border-gray-500 dark/g' "$file"
    
    # Info/Warning/Success colors - make more vivid in light mode
    sed -i 's/bg-info-50 /bg-blue-100 dark:bg-info-900\/20 /g' "$file"
    sed -i 's/text-info-600/text-blue-700/g' "$file"
    sed -i 's/text-info-700/text-blue-800/g' "$file"
    sed -i 's/text-info-800/text-blue-900/g' "$file"
    sed -i 's/text-info-900/text-blue-900/g' "$file"
    sed -i 's/border-info-200/border-blue-400/g' "$file"
    
    sed -i 's/bg-warning-50 /bg-amber-100 dark:bg-warning-900\/20 /g' "$file"
    sed -i 's/text-warning-600/text-amber-700/g' "$file"
    sed -i 's/text-warning-700/text-amber-800/g' "$file"
    sed -i 's/text-warning-800/text-amber-900/g' "$file"
    sed -i 's/text-warning-900/text-amber-900/g' "$file"
    sed -i 's/border-warning-200/border-amber-400/g' "$file"
    sed -i 's/border-warning-300/border-amber-400/g' "$file"
    
    sed -i 's/bg-success-50 /bg-green-100 dark:bg-success-900\/20 /g' "$file"
    sed -i 's/text-success-600/text-green-700/g' "$file"
    sed -i 's/text-success-700/text-green-800/g' "$file"
    sed -i 's/text-success-800/text-green-900/g' "$file"
    sed -i 's/text-success-900/text-green-900/g' "$file"
    sed -i 's/border-success-200/border-green-400/g' "$file"
    
    # Fix hover states
    sed -i 's/hover:bg-neutral-50 dark/hover:bg-gray-100 dark/g' "$file"
    sed -i 's/hover:bg-neutral-100 dark/hover:bg-gray-200 dark/g' "$file"
    
    # Add shadows to cards for better definition
    sed -i 's/shadow-soft/shadow-sm/g' "$file"
    
    # Fix gradient backgrounds
    sed -i 's/from-neutral-50 to-white dark/from-gray-50 to-gray-50 dark/g' "$file"
    sed -i 's/bg-gradient-to-b from-neutral-50/bg-gray-50/g' "$file"
done

echo "Light mode fixes applied!"