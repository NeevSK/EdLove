#!/usr/bin/env bash
grep -rnw '/mnt/c/x/node_modules/.pnpm' -e 'webpackIgnore' 2>/dev/null | head -n 20
