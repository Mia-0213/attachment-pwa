import fs from "fs";
import path from "path";

// 建立 1x1 紫色 PNG 的 Base64 字串作為 PWA 圖示預設圖形
const purplePngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const buffer = Buffer.from(purplePngBase64, "base64");

const iconsDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), buffer);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), buffer);

console.log("PWA 圖示檔生成成功！");
