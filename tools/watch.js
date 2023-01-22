const { build } = require("esbuild");
const chokidar = require("chokidar");
const debounce = require('./_debounce.js');
const config = require('./build-config');
const path = require("path");
const fs = require("fs");
// const fse = require('fs-extra');
const liveServer = require("live-server");


(async () => {
	// `chokidar` watcher source changes.
	chokidar.watch("src/**/*.{ts,js,tsx}", {
		interval: 0, // No delay
	}).on("all", debounce(async (e, fnPath) => {
		const timerStart = Date.now();
		try {
			fs.mkdirSync(path.dirname(config.dev.outfile), { recursive: true });
		} catch (e) {}
		// fs.copyFileSync("./index.html", path.join(path.dirname(config.dev.outfile), "index.html"));
		// fse.copySync("./assets", path.join(path.dirname(config.dev.outfile), "assets"), { overwrite: true });
		try {
			await build(config.dev);
		} catch (e) {
		}
		const timerEnd = Date.now();
		console.log(`🔨 Built in ${timerEnd - timerStart}ms.`)
	}, 500))

	// `liveServer` local server for hot reload.
	liveServer.start({
		// Opens the local server on start.
		open: true,
		// Uses `PORT=...` or 8080 as a fallback.
		port: process.env.PORT || 3001,
		// Uses `public` as the local server folder.
		root: ".dev",
	})
})()
