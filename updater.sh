#!/bin/sh

# cd /home/pi/pi-lights

if git diff-index --quiet HEAD --; then
  git fetch origin/master
  if [ x"$(git rev-parse master)" = x"$(git rev-parse origin/master)" ]
  then
    echo "no updates"
    exit 0
  fi

  echo "found updates in origin/master, preparing update"
  git checkout master
  git pull
  npm i

  echo "killing running app"
  fuser -k 8080/tcp

  echo "starting app"
  npm start
else
  git status
  echo "git is not clean, skipping update"
  exit 1
fi