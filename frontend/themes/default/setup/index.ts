/**
 * 默认主题 — 模板变量入口
 *
 * 主题开发者在此聚合所有自定义模板变量。
 * 框架自动调用 getTemplateData()，返回值注入到所有模板。
 */
const heroData = require("./hero.ts").getTemplateData
const siteData = require("./site.ts").getTemplateData

exports.getTemplateData = (): Record<string, unknown> => ({
  ...heroData(),
  ...siteData(),
})
