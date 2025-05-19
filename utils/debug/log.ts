export function printInitDebug(pageName: string) {
  const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

  if (isDebug) {
    console.log(`
    --------------------
    ＲＯＢＯＴＩＰＡ ＬＭＳ
    --------------------
    `);
  }
}

export function printDebug(pageName: string) {
  const isDebug = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

  if (isDebug) {
    console.log(`
    Debug Mode: ${pageName}
    `);
  }
}
