#!/usr/bin/env python3
"""
Next.js Project Line Counter
Counts total lines of code in a Next.js project, excluding dependencies and generated files.
"""

import os
import sys
from pathlib import Path
from collections import defaultdict

def should_ignore_directory(dir_name):
    """Check if directory should be ignored."""
    ignore_dirs = {
        'node_modules',
        '.next',
        '.git',
        'dist',
        'build',
        '.vercel',
        '.env.local',
        'coverage',
        '.nyc_output',
        '__pycache__',
        '.pytest_cache',
        '.DS_Store'
    }
    return dir_name in ignore_dirs

def should_count_file(file_path):
    """Check if file should be counted based on extension."""
    # Next.js relevant file extensions
    code_extensions = {
        '.js', '.jsx', '.ts', '.tsx',  # JavaScript/TypeScript
        '.css', '.scss', '.sass', '.less',  # Styles
        '.json',  # Config files
        '.md', '.mdx',  # Documentation/Content
        '.html',  # HTML files
        '.yml', '.yaml',  # Config files
        '.env'  # Environment files
    }
    
    file_ext = file_path.suffix.lower()
    file_name = file_path.name.lower()
    
    # Include files with relevant extensions
    if file_ext in code_extensions:
        return True
    
    # Include specific config files without extensions
    config_files = {
        'dockerfile', 'makefile', 'procfile',
        'next.config.js', 'tailwind.config.js',
        'postcss.config.js', 'eslint.config.js'
    }
    
    return file_name in config_files

def count_lines_in_file(file_path):
    """Count lines in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            total_lines = len(lines)
            blank_lines = sum(1 for line in lines if line.strip() == '')
            code_lines = total_lines - blank_lines
            return total_lines, code_lines, blank_lines
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0, 0, 0

def analyze_project(project_path):
    """Analyze the Next.js project and count lines."""
    project_path = Path(project_path)
    
    if not project_path.exists():
        print(f"Error: Path '{project_path}' does not exist.")
        return
    
    if not project_path.is_dir():
        print(f"Error: '{project_path}' is not a directory.")
        return
    
    # Check if it's a Next.js project
    package_json = project_path / 'package.json'
    if not package_json.exists():
        print("Warning: No package.json found. This might not be a Next.js project.")
    
    stats = defaultdict(lambda: {'files': 0, 'total_lines': 0, 'code_lines': 0, 'blank_lines': 0})
    total_files = 0
    
    print(f"Analyzing Next.js project: {project_path}")
    print("-" * 60)
    
    # Walk through the project directory
    for root, dirs, files in os.walk(project_path):
        # Remove ignored directories from dirs list to prevent os.walk from entering them
        dirs[:] = [d for d in dirs if not should_ignore_directory(d)]
        
        for file in files:
            file_path = Path(root) / file
            
            if should_count_file(file_path):
                total_lines, code_lines, blank_lines = count_lines_in_file(file_path)
                
                if total_lines > 0:  # Only count non-empty files
                    extension = file_path.suffix.lower() or 'no_extension'
                    stats[extension]['files'] += 1
                    stats[extension]['total_lines'] += total_lines
                    stats[extension]['code_lines'] += code_lines
                    stats[extension]['blank_lines'] += blank_lines
                    total_files += 1
    
    # Display results
    print(f"{'Extension':<12} {'Files':<8} {'Total Lines':<12} {'Code Lines':<12} {'Blank Lines':<12}")
    print("-" * 60)
    
    total_all_lines = 0
    total_code_lines = 0
    total_blank_lines = 0
    
    # Sort by total lines descending
    sorted_stats = sorted(stats.items(), key=lambda x: x[1]['total_lines'], reverse=True)
    
    for ext, data in sorted_stats:
        print(f"{ext:<12} {data['files']:<8} {data['total_lines']:<12} {data['code_lines']:<12} {data['blank_lines']:<12}")
        total_all_lines += data['total_lines']
        total_code_lines += data['code_lines']
        total_blank_lines += data['blank_lines']
    
    print("-" * 60)
    print(f"{'TOTAL':<12} {total_files:<8} {total_all_lines:<12} {total_code_lines:<12} {total_blank_lines:<12}")
    
    # Summary
    print(f"\nSummary:")
    print(f"  Total files analyzed: {total_files}")
    print(f"  Total lines: {total_all_lines:,}")
    print(f"  Code lines: {total_code_lines:,}")
    print(f"  Blank lines: {total_blank_lines:,}")
    print(f"  Average lines per file: {total_all_lines / total_files:.1f}" if total_files > 0 else "  No files found")

def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) != 2:
        print("Usage: python nextjs_line_counter.py <project_path>")
        print("Example: python nextjs_line_counter.py ./my-nextjs-app")
        sys.exit(1)
    
    project_path = sys.argv[1]
    analyze_project(project_path)

if __name__ == "__main__":
    main()