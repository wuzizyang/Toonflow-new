import fs from "fs";
import path from "path";

const vendorDir = path.join("data", "vendor");
const files = fs.readdirSync(vendorDir).filter((f) => f.endsWith(".ts"));
const result: Record<string, string> = {};
for (const file of files) {
  result[file] = fs.readFileSync(path.join(vendorDir, file), "utf-8");
}
const json = JSON.stringify(result, null, 2);
fs.writeFileSync(path.join(vendorDir, "vendor.json"), json, "utf-8");
// fixDB 在运行时通过 import "./vendor.json" 读取，src/lib 也需要同步更新
const libVendorJson = path.join("src", "lib", "vendor.json");
fs.writeFileSync(libVendorJson, json, "utf-8");
console.log("Done, saved vendor.json (data/vendor + src/lib)");
