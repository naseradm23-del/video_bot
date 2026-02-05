const { Markup } = require('telegraf');
const fs = require('fs-extra');
const downloadVideo = require('../utils/downloadUtils');

module.exports.startCommand = async (ctx) => {
    await ctx.reply(
        `🎬 *مرحباً ${ctx.from.first_name}!*\n\n` +
        'أنا بوت لتحسين جودة الفيديوهات 📈\n\n' +
        '✨ *المميزات:*\n' +
        '• رفع دقة الفيديو\n' +
        '• تحسين البتريت\n' +
        '• تحسين الإطارات\n' +
        '• إعدادات مخصصة\n\n' +
        '📤 *أرسل فيديو الآن لتبدأ*',
        { parse_mode: 'Markdown' }
    );
};

module.exports.helpCommand = (ctx) => {
    ctx.reply(
        '🆘 *كيفية الاستخدام:*\n\n' +
        '1. أرسل فيديو (حتى 500MB)\n' +
        '2. اختر الجودة المطلوبة\n' +
        '3. انتظر المعالجة\n' +
        '4. استلم الفيديو المحسن\n\n' +
        '⚡ *الجودة المتاحة:*\n' +
        '• 720p - جودة عادية\n' +
        '• 1080p - جودة عالية (مستحسنة)\n' +
        '• 2K/4K - لشاشات كبيرة\n' +
        '• تلقائي - أفضل توازن\n\n' +
        '💡 *نصائح:*\n' +
        '• الفيديوهات القصيرة أسرع\n' +
        '• تحقق من مساحة التخزين\n' +
        '• استخدم WiFi للفيديوهات الكبيرة',
        { parse_mode: 'Markdown' }
    );
};

module.exports.handleVideo = async (ctx) => {
    try {
        const video = ctx.message.video;
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 524288000;
        
        if (video.file_size > maxSize) {
            return ctx.reply(
                `❌ *الحجم كبير جداً!*\n\n` +
                `الحد الأقصى: ${Math.round(maxSize / 1024 / 1024)}MB\n` +
                `حجم الفيديو: ${Math.round(video.file_size / 1024 / 1024)}MB`,
                { parse_mode: 'Markdown' }
            );
        }
        
        // حفظ معلومات الفيديو في الجلسة
        ctx.session.videoInfo = {
            fileId: video.file_id,
            fileSize: video.file_size,
            duration: video.duration,
            mimeType: video.mime_type,
            timestamp: Date.now()
        };
        
        // عرض خيارات الجودة
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('📱 720p', 'quality_720'),
                Markup.button.callback('💻 1080p', 'quality_1080')
            ],
            [
                Markup.button.callback('🖥️ 2K', 'quality_1440'),
                Markup.button.callback('🎬 4K', 'quality_2160')
            ],
            [
                Markup.button.callback('⚡ تلقائي', 'quality_auto'),
                Markup.button.callback('🎛️ مخصص', 'custom_settings')
            ]
        ]);
        
        await ctx.reply(
            '✅ *تم استلام الفيديو!*\n\n' +
            `📊 معلومات الفيديو:\n` +
            `• المدة: ${video.duration} ثانية\n` +
            `• الحجم: ${Math.round(video.file_size / 1024 / 1024)}MB\n\n` +
            '🎯 *اختر الجودة المطلوبة:*',
            {
                parse_mode: 'Markdown',
                ...keyboard
            }
        );
        
    } catch (error) {
        console.error('Video handle error:', error);
        ctx.reply('❌ حدث خطأ في استلام الفيديو');
    }
};