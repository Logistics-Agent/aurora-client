async (page) => {
  const viewports = [
    [1440, 900],
    [1366, 768],
    [768, 1024],
    [390, 844],
  ];

  const measurements = [];

  for (const [width, height] of viewports) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);

    measurements.push({
      viewport: { width, height },
      document: await page.evaluate(() => ({
        innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        overflowingElements: [...document.querySelectorAll('*')]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .slice(0, 10)
          .map((element) => ({
            tag: element.tagName,
            className: typeof element.className === 'string' ? element.className : '',
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
          })),
      })),
    });
  }

  return measurements;
};
