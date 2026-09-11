import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
});

// Search Google for a keyword and extract ranking results for a target domain.
export async function rankTracker(keyword, targetDomain) {
    let browser;
    try {
        // 1. Initialize Browserbase Session & Connect Playwright
        const session = await bb.sessions.create({ browserSettings: { blockAds: true } });
        browser = await chromium.connectOverCDP(session.connectUrl);
        const page = browser.contexts()[0].pages()[0];

        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
        });
        page.setDefaultNavigationTimeout(45000);

        // 2. Initial Google Visit & Consent Handling
        await page.goto("https://www.google.com", { waitUntil: "domcontentloaded" });
        try {
            const btn = await page.$('button[id="L2AGLb"], form[action*="consent"] button');
            if (btn) {
                await btn.click();
                await page.waitForTimeout(1500);
            }
        } catch {}

        let found = null;
        let allResults = [];

        const cleanTarget = targetDomain.replace("www.", "").toLowerCase();

        // 3. Search Loop: iterate up to 5 pages of Google results
        for (let gPage = 0; gPage < 5; gPage++) {
            await page.goto(
                `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${gPage * 10}&num=10&hl=en&gl=us`,
                { waitUntil: "domcontentloaded" }
            );

            // 4. Extract results from the page
            let pageResults = [];
            for (let retry = 0; retry < 3; retry++) {
                try {
                    await page.waitForSelector("h3", { timeout: 10000 });
                    await page.waitForTimeout(1500);

                    pageResults = await page.evaluate(() => {
                        const out = [];
                        const seen = new Set();

                        document.querySelectorAll("h3").forEach((h3) => {
                            const title = h3.innerText.trim();
                            if (!title || title.length < 5) return;
                            if (title.toLowerCase().includes("ai mode")) return;

                            // Find the anchor wrapping the heading
                            let a = h3.closest("a");
                            if (!a) {
                                let p = h3.parentElement;
                                for (let j = 0; j < 6 && p; j++, p = p.parentElement) {
                                    if (p.tagName === "A") { a = p; break; }
                                    const sub = p.querySelector("a[href]");
                                    if (sub && sub.contains(h3)) { a = sub; break; }
                                }
                            }
                            if (!a || !a.href.startsWith("http")) return;

                            // Walk up to find the result container
                            let container = h3.parentElement;
                            for (let j = 0; j < 8 && container; j++, container = container.parentElement) {
                                if (container.tagName === "BODY") {
                                    container = h3.parentElement;
                                    break;
                                }
                                const text = container.innerText || "";
                                if (text.includes(title) && text.length > title.length + 80) break;
                            }

                            // Extract display URL (Google uses <cite> or inline URL text)
                            let displayUrl = "";
                            const cite = container?.querySelector("cite");
                            if (cite) {
                                displayUrl = cite.innerText.trim();
                            } else {
                                const text = container?.innerText || "";
                                const m = text.match(/(?:https?:\/\/)?([a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+)(?:[ ›\/]|$)/i);
                                if (m) displayUrl = m[1];
                            }

                            // Normalize domain
                            let domain = "";
                            if (displayUrl) {
                                domain = displayUrl
                                    .replace(/^https?:\/\//, "")
                                    .split(/[ ›\/\n]/)[0]
                                    .toLowerCase()
                                    .replace(/^www\./, "");
                            }
                            if (!domain || !domain.includes(".")) return;
                            if (domain.includes("google.")) return;

                            // Deduplicate by domain + title
                            const key = domain + "|" + title;
                            if (seen.has(key)) return;
                            seen.add(key);

                            // Extract snippet
                            let snippet = "";
                            if (container) {
                                const lines = (container.innerText || "")
                                    .split("\n")
                                    .map((l) => l.trim())
                                    .filter(Boolean);
                                const h3Idx = lines.findIndex((l) => l.startsWith(title.substring(0, 20)));
                                if (h3Idx >= 0) {
                                    snippet =
                                        lines
                                            .slice(h3Idx + 1)
                                            .find((l) => l.length > 50 && !l.startsWith("http")) || "";
                                }
                            }

                            out.push({
                                url: a.href,
                                domain,
                                title,
                                snippet: snippet.substring(0, 300),
                            });
                        });

                        return out;
                    });

                    if (pageResults.length > 0) break;
                    await page.reload({ waitUntil: "domcontentloaded" });
                } catch (err) {
                    if (retry === 2) break;
                    await page.reload({ waitUntil: "domcontentloaded" });
                }
            }

            if (!pageResults.length) break;

            // 5. Merge into global results & check for target match
            for (const r of pageResults) {
                r.position = allResults.length + 1;
                allResults.push(r);
                if (
                    !found &&
                    (r.domain.toLowerCase().includes(cleanTarget) ||
                        cleanTarget.includes(r.domain.toLowerCase()))
                ) {
                    found = { ...r, page: gPage + 1 };
                }
            }

            if (found) break;
            await page.waitForTimeout(2000 + Math.random() * 2000);
        }

        // 6. Finalize
        await browser.close();

        const competitors = allResults
            .filter(
                (r) =>
                    !r.domain.toLowerCase().includes(cleanTarget) &&
                    !cleanTarget.includes(r.domain.toLowerCase())
            )
            .slice(0, 10);

        return {
            success: true,
            data: {
                keyword,
                targetDomain,
                position: found?.position || null,
                page: found?.page || null,
                title: found?.title || "",
                snippet: found?.snippet || "",
                competitors,
                totalResultsScanned: allResults.length,
            },
        };
    } catch (error) {
        console.error("Rank check error:", error.message);
        if (browser) await browser.close().catch(() => {});
        return { success: false, error: error.message };
    }
}