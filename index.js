require('dotenv').config();
const { Telegraf, session } = require('telegraf');
const fs = require('fs-extra');
const path = require('path');

// التحقق من التوكن
if (!process.env.BOT_TOKEN) {
    console.error('❌ ERROR: BOT_TOKEN is required!');
    console.log('💡 Set it in Railway Environment Variables');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware للجلسات
bot.use(session());

// Middleware للتحقق من التوكن
bot.use((ctx, next) => {
    console.log(`📥 Update from: ${ctx.from?.id} (@${ctx.from?.username})`);
    next();
});

// استيراد Handlers
const videoHandler = require('./handlers/videoHandler');
const qualityHandler = require('./handlers/qualityHandler');

// تسجيل Handlers
bot.start(videoHandler.startCommand);
bot.help(videoHandler.helpCommand);
bot.on('video', videoHandler.handleVideo);
bot.action(/quality_/, qualityHandler.handleQualitySelection);
bot.action(/custom_/, qualityHandler.handleCustomSettings);

// صفحة الصحة للـ Health Check
bot.telegram.setWebhook(`${process.env.WEBHOOK_DOMAIN}/webhook`);
bot.telegram.getMe().then((botInfo) => {
    console.log(`✅ Bot started: @${botInfo.username}`);
});

// معالجة الأخطاء
bot.catch((err, ctx) => {
    console.error(`❌ Error for ${ctx.updateType}:`, err);
    ctx.reply('❌ حدث خطأ، الرجاء المحاولة لاحقاً');
});

// تشغيل البوت
if (process.env.WEBHOOK_DOMAIN) {
    // Webhook mode للـ Railway
    const PORT = process.env.PORT || 3000;
    bot.launch({
        webhook: {
            domain: process.env.WEBHOOK_DOMAIN,
            port: PORT
        }
    });
    console.log(`🌐 Webhook mode on port ${PORT}`);
} else {
    // Polling mode للتطوير
    bot.launch();
    console.log('🔄 Polling mode');
}

// إغلاق نظيف
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.once(signal, () => {
        console.log(`\n${signal} received, shutting down...`);
        bot.stop(signal);
    });
});