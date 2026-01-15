import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should show hamburger menu on mobile', async ({ page }) => {
        // 驗證漢堡選單存在與可見性
        // 假設漢堡選單的 aria-label 為 "Open menu" 或有特定的 data-testid="mobile-menu-btn"
        // 這裡先嘗試用常見選擇器，若不存在會在測試失敗後修正 UI
        const menuBtn = page.getByRole('button', { name: /menu/i }).or(page.locator('[data-testid="mobile-menu-btn"]'));

        // 如果現在 UI 還沒有這個按鈕，這個斷言應該會失敗（符合 TDD/Bug 重現預期）
        await expect(menuBtn).toBeVisible({ timeout: 5000 });
    });

    test('should open sidebar when menu is clicked', async ({ page }) => {
        const menuBtn = page.getByRole('button', { name: /menu/i }).or(page.locator('[data-testid="mobile-menu-btn"]'));
        await menuBtn.click();

        // 驗證導航連結是否出現
        const navLink = page.getByRole('link', { name: '心靈大陸' }).first();
        await expect(navLink).toBeVisible();
    });
});
