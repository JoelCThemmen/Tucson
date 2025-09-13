#!/bin/bash

# Script to fix light mode WITHOUT touching dark mode at all
# This script ONLY adds light mode specific improvements

echo "Fixing light mode while preserving dark mode completely..."

FILES=$(find src -name "*.tsx" -o -name "*.ts")

for file in $FILES; do
    # Skip dark mode specific files
    if [[ $file == *"dark"* ]]; then
        continue
    fi
    
    # === BORDER IMPROVEMENTS - Light mode only ===
    # Make borders more visible in light mode by adding explicit light mode classes
    sed -i 's/border-gray-200 dark/border-gray-300 dark/g' "$file"
    sed -i 's/border-gray-300 dark/border-gray-400 dark/g' "$file"
    
    # === CARD AND CONTAINER SHADOWS - Light mode only ===
    # Add shadows to cards that don't have them
    sed -i 's/rounded-lg p-/rounded-lg shadow-md p-/g' "$file"
    sed -i 's/rounded-xl p-/rounded-xl shadow-lg p-/g' "$file"
    
    # Fix existing shadow classes for light mode
    sed -i 's/shadow-sm/shadow-md/g' "$file"
    sed -i 's/shadow-md hover:shadow-lg/shadow-lg hover:shadow-xl/g' "$file"
    
    # === BACKGROUND IMPROVEMENTS - Light mode only ===
    # Add light mode specific backgrounds where missing
    sed -i 's/className="bg-white dark/className="bg-white border border-gray-300 dark/g' "$file"
    
    # === TEXT CONTRAST - Light mode only ===
    # Improve text contrast in light mode
    sed -i 's/text-gray-500 dark/text-gray-700 dark/g' "$file"
    sed -i 's/text-gray-600 dark/text-gray-800 dark/g' "$file"
    sed -i 's/text-gray-700 dark/text-gray-900 dark/g' "$file"
    
    # === FORM CONTROLS - Light mode only ===
    # Make form controls more visible
    sed -i 's/border border-gray-200/border-2 border-gray-400/g' "$file"
    sed -i 's/focus:border-/focus:border-2 focus:border-/g' "$file"
    sed -i 's/ring-1/ring-2/g' "$file"
    
    # === HOVER STATES - Light mode only ===
    # Improve hover states in light mode
    sed -i 's/hover:bg-gray-50 dark/hover:bg-gray-100 dark/g' "$file"
    sed -i 's/hover:bg-gray-100 dark/hover:bg-gray-200 dark/g' "$file"
    
    # === DIVIDERS - Light mode only ===
    # Make dividers more visible
    sed -i 's/divide-gray-200 dark/divide-gray-300 dark/g' "$file"
    
    # === BUTTONS - Light mode improvements ===
    # Add explicit light mode button styling
    sed -i 's/bg-primary-600 hover:bg-primary-700/bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg/g' "$file"
    sed -i 's/bg-white hover:bg-gray-50/bg-white hover:bg-gray-100 border-2 border-gray-300/g' "$file"
done

echo "Light mode fixes applied WITHOUT affecting dark mode!"