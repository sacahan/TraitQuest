import { test, expect } from '@playwright/test';

test.describe('Quest Completion UI', () => {
  test.beforeEach(async ({ page }) => {
    // Mock 登入與使用者狀態
    await page.route('**/v1/auth/me', async route => {
      await route.fulfill({
        json: {
          id: 'mock-user-id',
          email: 'test@example.com',
          name: 'Hero Player',
          picture: 'https://example.com/avatar.png'
        }
      });
    });

    // Mock 任務狀態：MBTI 已完成
    await page.route('**/v1/quests/status', async route => {
      await route.fulfill({
        json: {
          mbti: { status: 'COMPLETED', unlocked: true },
          enneagram: { status: 'LOCKED', unlocked: false },
          // 其他任務...
        }
      });
    });

    // Mock MBTI 報告
    await page.route('**/v1/quests/report/mbti', async route => {
      await route.fulfill({
        json: {
          class_id: 'CLS_INTJ',
          class: { name: 'Mastermind', description: 'Strategist' },
          race_id: 'RACE_5',
          level_info: {
            level: 5,
            exp: 1000,
            expToNextLevel: 2000,
            isLeveledUp: false
          }
        }
      });
    });

    // 設定 LocalStorage 模擬登入 token
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
    });
  });

  test('should show Rematch and Review buttons after completion', async ({ page }) => {
    // 前往分析頁面（通常結算後會導向這裡）
    await page.goto('/analysis?region=mbti');

    // 等待載入
    await page.waitForLoadState('networkidle');

    // 尋找「再戰」與「回顧」按鈕
    // 根據使用者描述，這兩個按鈕可能在手機版被切掉或沒顯示
    const rematchBtn = page.getByRole('button', { name: /再戰|rematch/i });
    const reviewBtn = page.getByRole('button', { name: /回顧|chronicle/i });

    // 斷言它們是可見的
    await expect(rematchBtn).toBeVisible();
    await expect(reviewBtn).toBeVisible();
  });
});
