# How to Push This Code to GitHub

## Option 1: Using Replit GitHub Integration

1. Click on the "Version Control" icon in the left sidebar of Replit (looks like a branch icon)
2. Click "Connect to GitHub"
3. Authenticate with your GitHub account
4. Select the repository: `rishiiicreates/DASHMATRICES`
5. Click "Pull/Push Changes" and select "Push"

## Option 2: Manual Push from Your Local Machine

If the Replit GitHub integration isn't working, follow these steps:

1. Download all files from this Repl (click the three dots ⋮ next to "Files" and select "Download as zip")
2. Extract the zip file on your local machine
3. Open a terminal in the extracted folder
4. Run the following commands:

```bash
# Initialize a new Git repository
git init

# Add all files to Git
git add .

# Commit the changes
git commit -m "Initial commit: Social Media Dashboard"

# Add your GitHub repository as remote
git remote add origin https://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@github.com/rishiiicreates/DASHMATRICES.git

# Push to GitHub (if your main branch is called "master", use that instead of "main")
git push -u origin main
```

## Important Security Note

After pushing, please generate a new GitHub token to replace the one used in these instructions.