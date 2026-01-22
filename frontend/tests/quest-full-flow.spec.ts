import { test, expect } from "@playwright/test";

test.describe("Quest Full Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock 登入
    await page.addInitScript(() => {
      localStorage.setItem("token", "test-token");
    });

    // Mock 所有 API
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({
        json: {
          userId: "test-user",
          level: 1,
          exp: 0,
        },
      });
    });
  });

  test("complete MBTI quest flow", async ({ page }) => {
    // Mock 任務狀態
    await page.route("**/v1/quests/status", async (route) => {
      await route.fulfill({
        json: {
          mbti: { status: "AVAILABLE", unlocked: true },
        },
      });
    });

    // Mock WebSocket 連線
    await page.route("**/v1/quest/ws", async (route) => {
      await route.fulfill({
        status: 101,
        headers: {
          Upgrade: "websocket",
          Connection: "Upgrade",
        },
      });
    });

    // 1. 進入問卷頁面
    await page.goto("/questionnaire?quest=mbti");

    // 2. 驗證敘事顯示
    await expect(page.locator(".narrative-display")).toBeVisible({
      timeout: 5000,
    });

    // 3. 等待問題出現
    await expect(page.locator(".question-card")).toBeVisible({ timeout: 5000 });

    // 4. 選擇答案
    const optionButtons = await page.locator(".option-button").all();
    if (optionButtons.length > 0) {
      await optionButtons[0].click();
    }

    // 5. 驗證下一題出現
    await expect(page.locator(".question-card")).toBeVisible({ timeout: 5000 });
  });

  test("401 triggers logout", async ({ page }) => {
    // Mock 401 錯誤
    await page.route("**/v1/auth/me", async (route) => {
      await route.fulfill({ status: 401 });
    });

    await page.goto("/dashboard");

    // 驗證重新導向至首頁
    await page.waitForURL("/", { timeout: 5000 });
    await expect(page).toHaveURL("/");
  });

  test("complete full quest and show results", async ({ page }) => {
    // Mock 完整流程 API
    await page.route("**/v1/quests/status", async (route) => {
      await route.fulfill({
        json: {
          mbti: { status: "COMPLETED", unlocked: true },
          bigfive: { status: "AVAILABLE", unlocked: true },
        },
      });
    });

    await page.route("**/v1/quests/report/mbti", async (route) => {
      await route.fulfill({
        json: {
          class_id: "CLS_INTJ",
          class: { name: "戰略法師", description: "獨立、戰略、高冷、冷靜" },
          level_info: {
            level: 5,
            exp: 1000,
            expToNextLevel: 2000,
            isLeveledUp: false,
          },
        },
      });
    });

    // 進入分析頁面
    await page.goto("/analysis?region=mbti");

    // 等待載入
    await page.waitForLoadState("networkidle");

    // 驗證結果頁面顯示
    await expect(page.locator(".result-container")).toBeVisible({
      timeout: 5000,
    });
  });

  test("map shows correct region status", async ({ page }) => {
    // Mock 地圖區域 API
    await page.route("**/v1/map/regions", async (route) => {
      await route.fulfill({
        json: {
          regions: [
            {
              id: "mbti",
              name: "MBTI 聖殿",
              status: "AVAILABLE",
              unlock_hint: null,
            },
            {
              id: "bigfive",
              name: "Big Five 能量場",
              status: "LOCKED",
              unlock_hint: "需先完成【MBTI 聖殿】試煉",
            },
            {
              id: "enneagram",
              name: "Enneagram 冥想塔",
              status: "LOCKED",
              unlock_hint: "需先完成【Big Five 能量場】試煉",
            },
          ],
        },
      });
    });

    await page.goto("/map");

    await expect(page.locator(".map-region")).toHaveCount(3);
    await expect(page.locator(".map-region").first()).toContainText(
      "MBTI 聖殿",
    );
  });
});
