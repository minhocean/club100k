"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/strava/status/route";
exports.ids = ["app/api/strava/status/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstrava%2Fstatus%2Froute&page=%2Fapi%2Fstrava%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstrava%2Fstatus%2Froute.js&appDir=C%3A%5CStartHere%5Cgeminisport%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CStartHere%5Cgeminisport&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstrava%2Fstatus%2Froute&page=%2Fapi%2Fstrava%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstrava%2Fstatus%2Froute.js&appDir=C%3A%5CStartHere%5Cgeminisport%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CStartHere%5Cgeminisport&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var C_StartHere_geminisport_app_api_strava_status_route_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/api/strava/status/route.js */ \"(rsc)/./app/api/strava/status/route.js\");\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/strava/status/route\",\n        pathname: \"/api/strava/status\",\n        filename: \"route\",\n        bundlePath: \"app/api/strava/status/route\"\n    },\n    resolvedPagePath: \"C:\\\\StartHere\\\\geminisport\\\\app\\\\api\\\\strava\\\\status\\\\route.js\",\n    nextConfigOutput,\n    userland: C_StartHere_geminisport_app_api_strava_status_route_js__WEBPACK_IMPORTED_MODULE_2__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/strava/status/route\";\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZzdHJhdmElMkZzdGF0dXMlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRnN0cmF2YSUyRnN0YXR1cyUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRnN0cmF2YSUyRnN0YXR1cyUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDU3RhcnRIZXJlJTVDZ2VtaW5pc3BvcnQlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNTdGFydEhlcmUlNUNnZW1pbmlzcG9ydCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDNEI7QUFDM0Y7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGdIQUFtQjtBQUMzQztBQUNBLGNBQWMseUVBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSx1R0FBdUc7QUFDL0c7QUFDaUo7O0FBRWpKIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VtaW5pc3BvcnQvP2RjOTciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcU3RhcnRIZXJlXFxcXGdlbWluaXNwb3J0XFxcXGFwcFxcXFxhcGlcXFxcc3RyYXZhXFxcXHN0YXR1c1xcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvc3RyYXZhL3N0YXR1cy9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL3N0cmF2YS9zdGF0dXNcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL3N0cmF2YS9zdGF0dXMvcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxTdGFydEhlcmVcXFxcZ2VtaW5pc3BvcnRcXFxcYXBwXFxcXGFwaVxcXFxzdHJhdmFcXFxcc3RhdHVzXFxcXHJvdXRlLmpzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIGhlYWRlckhvb2tzLCBzdGF0aWNHZW5lcmF0aW9uQmFpbG91dCB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL3N0cmF2YS9zdGF0dXMvcm91dGVcIjtcbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstrava%2Fstatus%2Froute&page=%2Fapi%2Fstrava%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstrava%2Fstatus%2Froute.js&appDir=C%3A%5CStartHere%5Cgeminisport%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CStartHere%5Cgeminisport&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/strava/status/route.js":
/*!****************************************!*\
  !*** ./app/api/strava/status/route.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET),\n/* harmony export */   runtime: () => (/* binding */ runtime)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/web/exports/next-response */ \"(rsc)/./node_modules/next/dist/server/web/exports/next-response.js\");\n/* harmony import */ var _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../../lib/supabaseAdmin */ \"(rsc)/./lib/supabaseAdmin.js\");\n/* harmony import */ var _lib_jwtFallback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../../lib/jwtFallback */ \"(rsc)/./lib/jwtFallback.js\");\n\n\n\nconst runtime = \"nodejs\";\nasync function GET(request) {\n    console.log(\"[STRAVA_STATUS] ===== STATUS CHECK STARTED =====\");\n    const url = new URL(request.url);\n    const accessToken = url.searchParams.get(\"sb\");\n    console.log(\"[STRAVA_STATUS] Full URL:\", request.url);\n    console.log(\"[STRAVA_STATUS] Access token present:\", !!accessToken);\n    console.log(\"[STRAVA_STATUS] Access token preview:\", accessToken ? accessToken.substring(0, 20) + \"...\" : \"null\");\n    if (!accessToken) {\n        console.log(\"[STRAVA_STATUS] No access token provided\");\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            connected: false,\n            debug: \"no_token\"\n        }, {\n            status: 200\n        });\n    }\n    console.log(\"[STRAVA_STATUS] Checking status for token:\", accessToken.substring(0, 10) + \"...\");\n    console.log(\"[STRAVA_STATUS] Attempting to get user from Supabase auth...\");\n    const { data: userData, error: userError } = await _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.supabaseAdmin.auth.getUser(accessToken);\n    console.log(\"[STRAVA_STATUS] User data result:\", {\n        hasData: !!userData,\n        hasError: !!userError\n    });\n    console.log(\"[STRAVA_STATUS] User error:\", userError);\n    let uid = userData?.user?.id;\n    if (!uid) {\n        console.log(\"[STRAVA_STATUS] No user from auth, trying JWT fallback\");\n        const payload = (0,_lib_jwtFallback__WEBPACK_IMPORTED_MODULE_2__.decodeJwtPayload)(accessToken);\n        console.log(\"[STRAVA_STATUS] JWT payload:\", payload);\n        uid = payload?.sub || payload?.user_id || null;\n        console.log(\"[STRAVA_STATUS] Extracted UID from JWT:\", uid);\n    }\n    if (!uid) {\n        console.log(\"[STRAVA_STATUS] No user ID found after all attempts\");\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            connected: false,\n            debug: \"no_user_id\"\n        }, {\n            status: 200\n        });\n    }\n    console.log(\"[STRAVA_STATUS] User ID found:\", uid);\n    console.log(\"[STRAVA_STATUS] Querying strava_connections table...\");\n    const { data, error } = await _lib_supabaseAdmin__WEBPACK_IMPORTED_MODULE_1__.supabaseAdmin.from(\"strava_connections\").select(\"athlete_id, athlete_name, expires_at\").eq(\"user_id\", uid).maybeSingle();\n    console.log(\"[STRAVA_STATUS] Database query result:\", {\n        hasData: !!data,\n        hasError: !!error\n    });\n    console.log(\"[STRAVA_STATUS] Database error:\", error);\n    if (error) {\n        console.error(\"[STRAVA_STATUS] Database error:\", error);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            connected: false,\n            error: error.message,\n            debug: \"db_error\"\n        }, {\n            status: 200\n        });\n    }\n    if (!data) {\n        console.log(\"[STRAVA_STATUS] No connection found for user:\", uid);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            connected: false,\n            debug: \"no_connection\"\n        }, {\n            status: 200\n        });\n    }\n    console.log(\"[STRAVA_STATUS] Connection found:\", data);\n    // Check if token is expired\n    const now = Math.floor(Date.now() / 1000);\n    const isExpired = data.expires_at && data.expires_at < now;\n    console.log(\"[STRAVA_STATUS] Token expiry check:\", {\n        expires_at: data.expires_at,\n        now: now,\n        isExpired: isExpired\n    });\n    if (isExpired) {\n        console.log(\"[STRAVA_STATUS] Token expired, expires_at:\", data.expires_at, \"now:\", now);\n        return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n            connected: false,\n            expired: true,\n            athleteId: data.athlete_id,\n            athleteName: data.athlete_name,\n            debug: \"token_expired\"\n        }, {\n            status: 200\n        });\n    }\n    console.log(\"[STRAVA_STATUS] Connection is valid and active\");\n    return next_dist_server_web_exports_next_response__WEBPACK_IMPORTED_MODULE_0__[\"default\"].json({\n        connected: true,\n        athleteId: data.athlete_id,\n        athleteName: data.athlete_name,\n        expiresAt: data.expires_at,\n        debug: \"connected\"\n    }, {\n        status: 200\n    });\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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NEJBQTRCO0lBQzVCLE1BQU1tQixNQUFNQyxLQUFLQyxLQUFLLENBQUNDLEtBQUtILEdBQUcsS0FBSztJQUNwQyxNQUFNSSxZQUFZdkIsS0FBS3dCLFVBQVUsSUFBSXhCLEtBQUt3QixVQUFVLEdBQUdMO0lBRXZEL0IsUUFBUUMsR0FBRyxDQUFDLHVDQUF1QztRQUNqRG1DLFlBQVl4QixLQUFLd0IsVUFBVTtRQUMzQkwsS0FBS0E7UUFDTEksV0FBV0E7SUFDYjtJQUVBLElBQUlBLFdBQVc7UUFDYm5DLFFBQVFDLEdBQUcsQ0FBQyw4Q0FBOENXLEtBQUt3QixVQUFVLEVBQUUsUUFBUUw7UUFDbkYsT0FBT3JDLGtGQUFZQSxDQUFDYyxJQUFJLENBQUM7WUFDdkJDLFdBQVc7WUFDWDRCLFNBQVM7WUFDVEMsV0FBVzFCLEtBQUsyQixVQUFVO1lBQzFCQyxhQUFhNUIsS0FBSzZCLFlBQVk7WUFDOUIvQixPQUFPO1FBQ1QsR0FBRztZQUFFQyxRQUFRO1FBQUk7SUFDbkI7SUFFQVgsUUFBUUMsR0FBRyxDQUFDO0lBQ1osT0FBT1Asa0ZBQVlBLENBQUNjLElBQUksQ0FBQztRQUN2QkMsV0FBVztRQUNYNkIsV0FBVzFCLEtBQUsyQixVQUFVO1FBQzFCQyxhQUFhNUIsS0FBSzZCLFlBQVk7UUFDOUJDLFdBQVc5QixLQUFLd0IsVUFBVTtRQUMxQjFCLE9BQU87SUFDVCxHQUFHO1FBQUVDLFFBQVE7SUFBSTtBQUNuQiIsInNvdXJjZXMiOlsid2VicGFjazovL2dlbWluaXNwb3J0Ly4vYXBwL2FwaS9zdHJhdmEvc3RhdHVzL3JvdXRlLmpzPzk3ZDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInXG5pbXBvcnQgeyBzdXBhYmFzZUFkbWluIH0gZnJvbSAnLi4vLi4vLi4vLi4vbGliL3N1cGFiYXNlQWRtaW4nXG5pbXBvcnQgeyBkZWNvZGVKd3RQYXlsb2FkIH0gZnJvbSAnLi4vLi4vLi4vLi4vbGliL2p3dEZhbGxiYWNrJ1xuXG5leHBvcnQgY29uc3QgcnVudGltZSA9ICdub2RlanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBHRVQocmVxdWVzdCkge1xuICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdID09PT09IFNUQVRVUyBDSEVDSyBTVEFSVEVEID09PT09JylcbiAgY29uc3QgdXJsID0gbmV3IFVSTChyZXF1ZXN0LnVybClcbiAgY29uc3QgYWNjZXNzVG9rZW4gPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnc2InKVxuICBcbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBGdWxsIFVSTDonLCByZXF1ZXN0LnVybClcbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBBY2Nlc3MgdG9rZW4gcHJlc2VudDonLCAhIWFjY2Vzc1Rva2VuKVxuICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIEFjY2VzcyB0b2tlbiBwcmV2aWV3OicsIGFjY2Vzc1Rva2VuID8gYWNjZXNzVG9rZW4uc3Vic3RyaW5nKDAsIDIwKSArICcuLi4nIDogJ251bGwnKVxuICBcbiAgaWYgKCFhY2Nlc3NUb2tlbikge1xuICAgIGNvbnNvbGUubG9nKCdbU1RSQVZBX1NUQVRVU10gTm8gYWNjZXNzIHRva2VuIHByb3ZpZGVkJylcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBjb25uZWN0ZWQ6IGZhbHNlLCBkZWJ1ZzogJ25vX3Rva2VuJyB9LCB7IHN0YXR1czogMjAwIH0pXG4gIH1cblxuICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIENoZWNraW5nIHN0YXR1cyBmb3IgdG9rZW46JywgYWNjZXNzVG9rZW4uc3Vic3RyaW5nKDAsIDEwKSArICcuLi4nKVxuXG4gIGNvbnNvbGUubG9nKCdbU1RSQVZBX1NUQVRVU10gQXR0ZW1wdGluZyB0byBnZXQgdXNlciBmcm9tIFN1cGFiYXNlIGF1dGguLi4nKVxuICBjb25zdCB7IGRhdGE6IHVzZXJEYXRhLCBlcnJvcjogdXNlckVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZUFkbWluLmF1dGguZ2V0VXNlcihhY2Nlc3NUb2tlbilcbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBVc2VyIGRhdGEgcmVzdWx0OicsIHsgaGFzRGF0YTogISF1c2VyRGF0YSwgaGFzRXJyb3I6ICEhdXNlckVycm9yIH0pXG4gIGNvbnNvbGUubG9nKCdbU1RSQVZBX1NUQVRVU10gVXNlciBlcnJvcjonLCB1c2VyRXJyb3IpXG4gIFxuICBsZXQgdWlkID0gdXNlckRhdGE/LnVzZXI/LmlkXG4gIGlmICghdWlkKSB7XG4gICAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBObyB1c2VyIGZyb20gYXV0aCwgdHJ5aW5nIEpXVCBmYWxsYmFjaycpXG4gICAgY29uc3QgcGF5bG9hZCA9IGRlY29kZUp3dFBheWxvYWQoYWNjZXNzVG9rZW4pXG4gICAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBKV1QgcGF5bG9hZDonLCBwYXlsb2FkKVxuICAgIHVpZCA9IHBheWxvYWQ/LnN1YiB8fCBwYXlsb2FkPy51c2VyX2lkIHx8IG51bGxcbiAgICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIEV4dHJhY3RlZCBVSUQgZnJvbSBKV1Q6JywgdWlkKVxuICB9XG4gIGlmICghdWlkKSB7XG4gICAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBObyB1c2VyIElEIGZvdW5kIGFmdGVyIGFsbCBhdHRlbXB0cycpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgY29ubmVjdGVkOiBmYWxzZSwgZGVidWc6ICdub191c2VyX2lkJyB9LCB7IHN0YXR1czogMjAwIH0pXG4gIH1cblxuICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIFVzZXIgSUQgZm91bmQ6JywgdWlkKVxuXG4gIGNvbnNvbGUubG9nKCdbU1RSQVZBX1NUQVRVU10gUXVlcnlpbmcgc3RyYXZhX2Nvbm5lY3Rpb25zIHRhYmxlLi4uJylcbiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pblxuICAgIC5mcm9tKCdzdHJhdmFfY29ubmVjdGlvbnMnKVxuICAgIC5zZWxlY3QoJ2F0aGxldGVfaWQsIGF0aGxldGVfbmFtZSwgZXhwaXJlc19hdCcpXG4gICAgLmVxKCd1c2VyX2lkJywgdWlkKVxuICAgIC5tYXliZVNpbmdsZSgpXG5cbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBEYXRhYmFzZSBxdWVyeSByZXN1bHQ6JywgeyBoYXNEYXRhOiAhIWRhdGEsIGhhc0Vycm9yOiAhIWVycm9yIH0pXG4gIGNvbnNvbGUubG9nKCdbU1RSQVZBX1NUQVRVU10gRGF0YWJhc2UgZXJyb3I6JywgZXJyb3IpXG5cbiAgaWYgKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignW1NUUkFWQV9TVEFUVVNdIERhdGFiYXNlIGVycm9yOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGNvbm5lY3RlZDogZmFsc2UsIGVycm9yOiBlcnJvci5tZXNzYWdlLCBkZWJ1ZzogJ2RiX2Vycm9yJyB9LCB7IHN0YXR1czogMjAwIH0pXG4gIH1cblxuICBpZiAoIWRhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIE5vIGNvbm5lY3Rpb24gZm91bmQgZm9yIHVzZXI6JywgdWlkKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IGNvbm5lY3RlZDogZmFsc2UsIGRlYnVnOiAnbm9fY29ubmVjdGlvbicgfSwgeyBzdGF0dXM6IDIwMCB9KVxuICB9XG5cbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBDb25uZWN0aW9uIGZvdW5kOicsIGRhdGEpXG5cbiAgLy8gQ2hlY2sgaWYgdG9rZW4gaXMgZXhwaXJlZFxuICBjb25zdCBub3cgPSBNYXRoLmZsb29yKERhdGUubm93KCkgLyAxMDAwKVxuICBjb25zdCBpc0V4cGlyZWQgPSBkYXRhLmV4cGlyZXNfYXQgJiYgZGF0YS5leHBpcmVzX2F0IDwgbm93XG4gIFxuICBjb25zb2xlLmxvZygnW1NUUkFWQV9TVEFUVVNdIFRva2VuIGV4cGlyeSBjaGVjazonLCB7XG4gICAgZXhwaXJlc19hdDogZGF0YS5leHBpcmVzX2F0LFxuICAgIG5vdzogbm93LFxuICAgIGlzRXhwaXJlZDogaXNFeHBpcmVkXG4gIH0pXG4gIFxuICBpZiAoaXNFeHBpcmVkKSB7XG4gICAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBUb2tlbiBleHBpcmVkLCBleHBpcmVzX2F0OicsIGRhdGEuZXhwaXJlc19hdCwgJ25vdzonLCBub3cpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgXG4gICAgICBjb25uZWN0ZWQ6IGZhbHNlLCBcbiAgICAgIGV4cGlyZWQ6IHRydWUsXG4gICAgICBhdGhsZXRlSWQ6IGRhdGEuYXRobGV0ZV9pZCwgXG4gICAgICBhdGhsZXRlTmFtZTogZGF0YS5hdGhsZXRlX25hbWUsXG4gICAgICBkZWJ1ZzogJ3Rva2VuX2V4cGlyZWQnXG4gICAgfSwgeyBzdGF0dXM6IDIwMCB9KVxuICB9XG5cbiAgY29uc29sZS5sb2coJ1tTVFJBVkFfU1RBVFVTXSBDb25uZWN0aW9uIGlzIHZhbGlkIGFuZCBhY3RpdmUnKVxuICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBcbiAgICBjb25uZWN0ZWQ6IHRydWUsIFxuICAgIGF0aGxldGVJZDogZGF0YS5hdGhsZXRlX2lkLCBcbiAgICBhdGhsZXRlTmFtZTogZGF0YS5hdGhsZXRlX25hbWUsXG4gICAgZXhwaXJlc0F0OiBkYXRhLmV4cGlyZXNfYXQsXG4gICAgZGVidWc6ICdjb25uZWN0ZWQnXG4gIH0sIHsgc3RhdHVzOiAyMDAgfSlcbn1cblxuXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwic3VwYWJhc2VBZG1pbiIsImRlY29kZUp3dFBheWxvYWQiLCJydW50aW1lIiwiR0VUIiwicmVxdWVzdCIsImNvbnNvbGUiLCJsb2ciLCJ1cmwiLCJVUkwiLCJhY2Nlc3NUb2tlbiIsInNlYXJjaFBhcmFtcyIsImdldCIsInN1YnN0cmluZyIsImpzb24iLCJjb25uZWN0ZWQiLCJkZWJ1ZyIsInN0YXR1cyIsImRhdGEiLCJ1c2VyRGF0YSIsImVycm9yIiwidXNlckVycm9yIiwiYXV0aCIsImdldFVzZXIiLCJoYXNEYXRhIiwiaGFzRXJyb3IiLCJ1aWQiLCJ1c2VyIiwiaWQiLCJwYXlsb2FkIiwic3ViIiwidXNlcl9pZCIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm1heWJlU2luZ2xlIiwibWVzc2FnZSIsIm5vdyIsIk1hdGgiLCJmbG9vciIsIkRhdGUiLCJpc0V4cGlyZWQiLCJleHBpcmVzX2F0IiwiZXhwaXJlZCIsImF0aGxldGVJZCIsImF0aGxldGVfaWQiLCJhdGhsZXRlTmFtZSIsImF0aGxldGVfbmFtZSIsImV4cGlyZXNBdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/strava/status/route.js\n");

/***/ }),

/***/ "(rsc)/./lib/jwtFallback.js":
/*!****************************!*\
  !*** ./lib/jwtFallback.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   decodeJwtPayload: () => (/* binding */ decodeJwtPayload)\n/* harmony export */ });\nfunction decodeJwtPayload(accessToken) {\n    try {\n        if (!accessToken || typeof accessToken !== \"string\") return null;\n        const parts = accessToken.split(\".\");\n        if (parts.length < 2) return null;\n        const payload = parts[1];\n        const normalized = payload.replace(/-/g, \"+\").replace(/_/g, \"/\");\n        const padded = normalized + \"=\".repeat((4 - normalized.length % 4) % 4);\n        const json = Buffer.from(padded, \"base64\").toString(\"utf8\");\n        const obj = JSON.parse(json);\n        return obj || null;\n    } catch  {\n        return null;\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvand0RmFsbGJhY2suanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFPLFNBQVNBLGlCQUFpQkMsV0FBVztJQUMxQyxJQUFJO1FBQ0YsSUFBSSxDQUFDQSxlQUFlLE9BQU9BLGdCQUFnQixVQUFVLE9BQU87UUFDNUQsTUFBTUMsUUFBUUQsWUFBWUUsS0FBSyxDQUFDO1FBQ2hDLElBQUlELE1BQU1FLE1BQU0sR0FBRyxHQUFHLE9BQU87UUFDN0IsTUFBTUMsVUFBVUgsS0FBSyxDQUFDLEVBQUU7UUFDeEIsTUFBTUksYUFBYUQsUUFBUUUsT0FBTyxDQUFDLE1BQU0sS0FBS0EsT0FBTyxDQUFDLE1BQU07UUFDNUQsTUFBTUMsU0FBU0YsYUFBYSxJQUFJRyxNQUFNLENBQUMsQ0FBQyxJQUFLSCxXQUFXRixNQUFNLEdBQUcsQ0FBQyxJQUFLO1FBQ3ZFLE1BQU1NLE9BQU9DLE9BQU9DLElBQUksQ0FBQ0osUUFBUSxVQUFVSyxRQUFRLENBQUM7UUFDcEQsTUFBTUMsTUFBTUMsS0FBS0MsS0FBSyxDQUFDTjtRQUN2QixPQUFPSSxPQUFPO0lBQ2hCLEVBQUUsT0FBTTtRQUNOLE9BQU87SUFDVDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VtaW5pc3BvcnQvLi9saWIvand0RmFsbGJhY2suanM/ZTY5MyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZGVjb2RlSnd0UGF5bG9hZChhY2Nlc3NUb2tlbikge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAoIWFjY2Vzc1Rva2VuIHx8IHR5cGVvZiBhY2Nlc3NUb2tlbiAhPT0gJ3N0cmluZycpIHJldHVybiBudWxsXHJcbiAgICBjb25zdCBwYXJ0cyA9IGFjY2Vzc1Rva2VuLnNwbGl0KCcuJylcclxuICAgIGlmIChwYXJ0cy5sZW5ndGggPCAyKSByZXR1cm4gbnVsbFxyXG4gICAgY29uc3QgcGF5bG9hZCA9IHBhcnRzWzFdXHJcbiAgICBjb25zdCBub3JtYWxpemVkID0gcGF5bG9hZC5yZXBsYWNlKC8tL2csICcrJykucmVwbGFjZSgvXy9nLCAnLycpXHJcbiAgICBjb25zdCBwYWRkZWQgPSBub3JtYWxpemVkICsgJz0nLnJlcGVhdCgoNCAtIChub3JtYWxpemVkLmxlbmd0aCAlIDQpKSAlIDQpXHJcbiAgICBjb25zdCBqc29uID0gQnVmZmVyLmZyb20ocGFkZGVkLCAnYmFzZTY0JykudG9TdHJpbmcoJ3V0ZjgnKVxyXG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKVxyXG4gICAgcmV0dXJuIG9iaiB8fCBudWxsXHJcbiAgfSBjYXRjaCB7XHJcbiAgICByZXR1cm4gbnVsbFxyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiZGVjb2RlSnd0UGF5bG9hZCIsImFjY2Vzc1Rva2VuIiwicGFydHMiLCJzcGxpdCIsImxlbmd0aCIsInBheWxvYWQiLCJub3JtYWxpemVkIiwicmVwbGFjZSIsInBhZGRlZCIsInJlcGVhdCIsImpzb24iLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJvYmoiLCJKU09OIiwicGFyc2UiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/jwtFallback.js\n");

/***/ }),

/***/ "(rsc)/./lib/supabaseAdmin.js":
/*!******************************!*\
  !*** ./lib/supabaseAdmin.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   supabaseAdmin: () => (/* binding */ supabaseAdmin)\n/* harmony export */ });\n/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dotenv */ \"(rsc)/./node_modules/dotenv/lib/main.js\");\n/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dotenv__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n\ndotenv__WEBPACK_IMPORTED_MODULE_0___default().config({\n    path: \".env.local\",\n    debug: true\n});\nconst supabaseUrl = \"https://gahnvdutnhyqzoggxyif.supabase.co\";\nconst serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(supabaseUrl, serviceKey);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvc3VwYWJhc2VBZG1pbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQTJCO0FBQ3lCO0FBRXBEQSxvREFBYSxDQUFDO0lBQUVHLE1BQU07SUFBY0MsT0FBTztBQUFLO0FBRWhELE1BQU1DLGNBQWNDLDBDQUFvQztBQUN4RCxNQUFNRyxhQUFhSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUVqRCxNQUFNQyxnQkFBZ0JWLG1FQUFZQSxDQUFDSSxhQUFhSSxZQUFXIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VtaW5pc3BvcnQvLi9saWIvc3VwYWJhc2VBZG1pbi5qcz82NmYxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkb3RlbnYgZnJvbSAnZG90ZW52J1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXHJcblxyXG5kb3RlbnYuY29uZmlnKHsgcGF0aDogJy5lbnYubG9jYWwnLCBkZWJ1ZzogdHJ1ZSB9KVxyXG5cclxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkxcclxuY29uc3Qgc2VydmljZUtleSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVlcclxuXHJcbmV4cG9ydCBjb25zdCBzdXBhYmFzZUFkbWluID0gY3JlYXRlQ2xpZW50KHN1cGFiYXNlVXJsLCBzZXJ2aWNlS2V5KVxyXG5cclxuXHJcbiJdLCJuYW1lcyI6WyJkb3RlbnYiLCJjcmVhdGVDbGllbnQiLCJjb25maWciLCJwYXRoIiwiZGVidWciLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzZXJ2aWNlS2V5IiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsInN1cGFiYXNlQWRtaW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/supabaseAdmin.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions","vendor-chunks/dotenv"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fstrava%2Fstatus%2Froute&page=%2Fapi%2Fstrava%2Fstatus%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fstrava%2Fstatus%2Froute.js&appDir=C%3A%5CStartHere%5Cgeminisport%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CStartHere%5Cgeminisport&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();