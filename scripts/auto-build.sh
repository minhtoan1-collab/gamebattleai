#!/bin/bash

FILEPATH="tiếntrìnhhệthống.md"
TIMESTAMP=$(date '+%d/%m/%Y %H:%M:%S')
REPLIT_USER="${REPL_OWNER:-unknown}"
REPLIT_ID="${REPL_ID:-unknown}"
REPLIT_SLUG="${REPL_SLUG:-unknown}"

echo "" >> "$FILEPATH"
echo "---" >> "$FILEPATH"
echo "" >> "$FILEPATH"
echo "## 🔄 Auto-Build Log — $TIMESTAMP" >> "$FILEPATH"
echo "" >> "$FILEPATH"
echo "| Thông Tin       | Giá Trị                   |" >> "$FILEPATH"
echo "|-----------------|---------------------------|" >> "$FILEPATH"
echo "| Thời gian mở    | $TIMESTAMP                |" >> "$FILEPATH"
echo "| Tài khoản       | $REPLIT_USER              |" >> "$FILEPATH"
echo "| Repl ID         | $REPLIT_ID                |" >> "$FILEPATH"
echo "| Repl Slug       | $REPLIT_SLUG              |" >> "$FILEPATH"
echo "| Trạng thái      | ✅ Dự án đã khởi động    |" >> "$FILEPATH"
echo "" >> "$FILEPATH"
echo "*Ghi tự động khi mở dự án — RPG World Auto-Build System*" >> "$FILEPATH"

echo "[auto-build] ✅ Đã ghi log vào $FILEPATH lúc $TIMESTAMP (tài khoản: $REPLIT_USER)"
