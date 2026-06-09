#!/bin/bash
rm -f /home/we/Documents/ZENITH/apps/web/.next/dev/lock
cd /home/we/Documents/ZENITH/apps/web
bun run dev > /tmp/next-dev.log 2>&1 &
echo $! > /tmp/next-dev.pid
