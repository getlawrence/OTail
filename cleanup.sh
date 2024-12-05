#!/bin/bash

# Fail on any error
set -e

# Step 1: Create a new branch for merge commits only
echo "Creating a new branch for merge commits only..."
git checkout -b merges-only-new1

# Step 2: Reset the branch to the root commit
ROOT_COMMIT=$(git rev-list --max-parents=0 HEAD)
git reset --hard "$ROOT_COMMIT"

# Step 3: Cherry-pick only merge commits into the new branch
echo "Cherry-picking only merge commits..."
MERGE_COMMITS=$(git log --merges --format="%H")
for commit in $MERGE_COMMITS; do
    git cherry-pick "$commit" --allow-empty --keep-redundant-commits
done

# Step 4: Create a new branch for pushing
CLEAN_BRANCH="clean-main-new"
echo "Creating a new branch '$CLEAN_BRANCH' for cleaned history..."
git branch -f "$CLEAN_BRANCH"

# Step 5: Push the cleaned branch to the remote
echo "Pushing the cleaned branch to the remote repository..."
git push origin "$CLEAN_BRANCH" --force

echo "Done! A new branch '$CLEAN_BRANCH' has been pushed to the remote repository."
echo "You can now create a pull request to merge '$CLEAN_BRANCH' into 'main' via GitHub."
