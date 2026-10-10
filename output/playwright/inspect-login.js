async (page) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Use dark theme' }).click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: 'output/playwright/login-dark-1440.png' });
  await page.mouse.move(1100, 400);
  await page.mouse.down();
  await page.mouse.move(900, 450, { steps: 15 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Use light theme' }).click();
  await page.waitForTimeout(350);
  for (const [width, height] of [[1440,900], [1920,1080], [1366,768], [768,1024], [390,844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    await page.screenshot({ path: 'output/playwright/login-light-' + width + '.png', fullPage: true });
    console.log({ width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), canvas: await page.locator('canvas').count() });
  }
  await page.getByLabel('Work Email').fill('invalid');
  await page.getByRole('button', {name: 'Continue'}).click();
  console.log({ invalidEmailRejected: await page.getByLabel('Work Email').evaluate(el => !el.validity.valid) });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.screenshot({ path: 'output/playwright/login-reduced-motion.png' });
}
