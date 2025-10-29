#!/bin/bash

echo "🔍 Opening Visual Evidence of FOUC Testing..."
echo ""
echo "📊 Test Results Summary:"
echo "========================"
echo ""

# Check if results exist
if [ -f "test-results/refresh-results-chromium.json" ]; then
    echo "✅ Refresh Results:"
    cat test-results/refresh-results-chromium.json | jq -r '.[] | "  Refresh \(.refresh): DOM=\(.domLoadTime)ms, Color=\(.afterDOM.body), InlineCSS=\(.afterDOM.hasInlineStyles)"'
    echo ""
fi

if [ -f "test-results/refresh-timeline-chromium.json" ]; then
    echo "✅ Timeline Data: test-results/refresh-timeline-chromium.json"
    echo ""
fi

if [ -f "test-results/css-load-events-chromium.json" ]; then
    echo "✅ CSS Loading Events: test-results/css-load-events-chromium.json"
    echo ""
fi

# Count screenshots
SCREENSHOT_COUNT=$(ls -1 test-results/refresh-screenshots/*.png 2>/dev/null | wc -l)
echo "✅ Screenshots Captured: $SCREENSHOT_COUNT images"
echo "   Location: test-results/refresh-screenshots/"
echo ""

# Show file sizes
if [ $SCREENSHOT_COUNT -gt 0 ]; then
    echo "📸 Screenshot Details:"
    ls -lh test-results/refresh-screenshots/*.png | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
fi

echo "🎥 Video recordings available in:"
echo "   test-results/specs-visual-refresh-recording/"
echo ""

echo "================================================"
echo ""
echo "Would you like to open the screenshots? (y/n)"
read -r response

if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    echo ""
    echo "Opening screenshots..."
    
    # Open comparison screenshots first (most important)
    if [ -f "test-results/comparison/chromium-before.png" ]; then
        echo "📸 Opening BEFORE refresh..."
        open test-results/comparison/chromium-before.png
        sleep 1
    fi
    
    if [ -f "test-results/comparison/chromium-after.png" ]; then
        echo "📸 Opening AFTER refresh..."
        open test-results/comparison/chromium-after.png
        sleep 1
    fi
    
    # Open a few "during" screenshots
    if [ -f "test-results/refresh-screenshots/chromium-home-during-0.png" ]; then
        echo "📸 Opening DURING refresh (early)..."
        open test-results/refresh-screenshots/chromium-home-during-0.png
        sleep 1
    fi
    
    if [ -f "test-results/refresh-screenshots/chromium-home-during-5.png" ]; then
        echo "📸 Opening DURING refresh (mid)..."
        open test-results/refresh-screenshots/chromium-home-during-5.png
        sleep 1
    fi
    
    if [ -f "test-results/refresh-screenshots/chromium-home-during-9.png" ]; then
        echo "📸 Opening DURING refresh (late)..."
        open test-results/refresh-screenshots/chromium-home-during-9.png
    fi
    
    echo ""
    echo "✅ Screenshots opened! Compare them visually."
    echo ""
    echo "🔍 What to look for:"
    echo "   ✅ All screenshots should have the warm beige background (#faf8f5)"
    echo "   ❌ No white/blank screenshots"
    echo "   ✅ Content should be visible and styled in all images"
    echo ""
else
    echo ""
    echo "💡 To view screenshots manually:"
    echo "   cd test-results/refresh-screenshots/"
    echo "   open *.png"
    echo ""
fi

echo "================================================"
echo ""
echo "📊 To view detailed data:"
echo "   cat test-results/refresh-results-chromium.json | jq"
echo "   cat test-results/refresh-timeline-chromium.json | jq"
echo "   cat test-results/css-load-events-chromium.json | jq"
echo ""
echo "🎬 To see full test run:"
echo "   npx playwright test tests/specs/visual/refresh-recording.spec.ts --reporter=list"
echo ""

