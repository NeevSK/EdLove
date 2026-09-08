#!/usr/bin/env bash
grep -rn "webpackIgnore" /mnt/c/x/node_modules/.pnpm/ 2>/dev/null | head -n 30
