import { build } from "esbuild";
import { readFile, writeFile } from "node:fs/promises";

const result = await build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    format: "iife",
    write: false
});

const html = await readFile("src/index.html", "utf8");
const css = await readFile("src/style.css", "utf8");
const js = result.outputFiles[0].text;

await writeFile(
    "dist/index.html",
    html
        .replace("<link rel=\"stylesheet\" href=\"style.css\">", `<style>${css}</style>`)
        .replace("<script src=\"dist/main.js\"></script>", `<script>${js}</script>`)
);
