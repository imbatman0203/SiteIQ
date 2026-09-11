import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
    try {
        let result;

        // Try up to 3 times. Stop early only if we found the target position.
        const MAX_ATTEMPTS = 3;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            result = await rankTracker(tracking.keyword, tracking.domain);

            // Success = we scraped results AND found the domain
            if (result.success && result.data.position !== null) break;

            // Otherwise, wait and retry
            if (attempt < MAX_ATTEMPTS) {
                const delay = result.success ? 5000 : 8000;
                console.log(`[rank] Attempt ${attempt}/${MAX_ATTEMPTS} for "${tracking.keyword}" — position=${result.data?.position ?? "null"}, retrying in ${delay}ms`);
                await new Promise((r) => setTimeout(r, delay));
            }
        }

        if (result.success) {
            const prev = tracking.currentPosition;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            tracking.currentPosition = result.data.position;
            tracking.currentPage = result.data.page;
            tracking.competitors = result.data.competitors;
            tracking.lastChecked = new Date();
            tracking.status = "completed";

            // Update stats
            tracking.positionChange = prev && result.data.position ? prev - result.data.position : 0;
            if (result.data.position && (!tracking.bestPosition || result.data.position < tracking.bestPosition)) {
                tracking.bestPosition = result.data.position;
            }

            // Update history
            const historyEntry = {
                date: today,
                position: result.data.position,
                page: result.data.page,
                title: result.data.title,
                snippet: result.data.snippet,
            };
            const idx = tracking.rankHistory.findIndex((h) => h.date.toDateString() === today.toDateString());
            if (idx >= 0) tracking.rankHistory[idx] = historyEntry;
            else tracking.rankHistory.push(historyEntry);
        } else {
            tracking.status = "failed";
        }
        await tracking.save();
        return result;
    } catch (err) {
        console.error("Rank update error:", err.message);
        tracking.status = "failed";
        await tracking.save().catch(() => {});
        return { success: false, error: err.message };
    }
}
