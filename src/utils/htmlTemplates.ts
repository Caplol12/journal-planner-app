/**
 * HTML Templates Presets and Sync Utility
 */

export interface HtmlTemplatePreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  icon: string;
  html: string;
}

export const HTML_TEMPLATE_PRESETS: HtmlTemplatePreset[] = [
  {
    id: 'preset_daily_habits',
    name: 'پلنر روزانه طلایی و ردیاب عادات',
    badge: 'برنامه روزانه',
    desc: 'ساختار روزانه جامع شامل ۳ اولویت طلایی، ردیاب آب و عادات، زمان‌بندی ۳ گانه و یادداشت سریع.',
    icon: '🗓️',
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif; }
    body { background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; line-height: 1.5; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); max-width: 760px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 20px; color: #0f172a; display: flex; align-items: center; gap: 8px; }
    .header .badge { background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; border: 1px solid #bfdbfe; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; }
    .box-title { font-weight: 800; font-size: 13px; margin-bottom: 12px; color: #334155; display: flex; align-items: center; gap: 6px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    input[type="checkbox"] { width: 18px; height: 18px; accent-color: #2563eb; cursor: pointer; border-radius: 4px; }
    input[type="text"], textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 10px; padding: 8px 12px; font-size: 13px; outline: none; background: white; transition: border-color 0.2s; }
    input[type="text"]:focus, textarea:focus { border-color: #3b82f6; }
    textarea { min-height: 90px; resize: vertical; }
    .tracker-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
    .pill-item { background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 10px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🗓️ برنامه روزانه و اولویت‌بندی</h1>
      <span class="badge">قالب استاندارد</span>
    </div>

    <div class="grid">
      <div class="box">
        <div class="box-title">🎯 ۳ اولویت طلایی امروز</div>
        <ul>
          <li><input type="checkbox"> <input type="text" placeholder="اولویت شماره یک (مهم‌ترین کار)..."></li>
          <li><input type="checkbox"> <input type="text" placeholder="اولویت شماره دو..."></li>
          <li><input type="checkbox"> <input type="text" placeholder="اولویت شماره سه..."></li>
        </ul>
      </div>

      <div class="box">
        <div class="box-title">💧 ردیاب عادات و تندرستی</div>
        <div class="tracker-pills">
          <label class="pill-item"><input type="checkbox"> ۸ لیوان آب</label>
          <label class="pill-item"><input type="checkbox"> ۳۰ دقیقه ورزش</label>
          <label class="pill-item"><input type="checkbox"> ۲۰ دقیقه مطالعه</label>
          <label class="pill-item"><input type="checkbox"> مدیتیشن و خواب کافی</label>
        </div>
      </div>
    </div>

    <div class="grid" style="margin-top: 16px;">
      <div class="box">
        <div class="box-title">⏰ بلوک‌های زمانی روز</div>
        <ul>
          <li><strong>صبح:</strong> <input type="text" placeholder="تمرکز عمیق، تسک‌های تحلیلی"></li>
          <li><strong>ظهر:</strong> <input type="text" placeholder="جلسات، ایمیل‌ها و هماهنگی"></li>
          <li><strong>عصر:</strong> <input type="text" placeholder="ورزش، کارهای شخصی و جمع‌بندی"></li>
        </ul>
      </div>

      <div class="box">
        <div class="box-title">📝 یادداشت‌های سریع و تخلیه ذهن</div>
        <textarea placeholder="ایده‌ها، شماره‌ها یا افکار خود را اینجا بنویسید..."></textarea>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'preset_deep_work',
    name: 'پلنر کارهای عمیق و اسپرینت تمرکز',
    badge: 'کار عمیق & تمرکز',
    desc: 'مخصوص تمرکز فوق‌العاده؛ با تک‌هدف اصلی، ۳ بازه ۹۰ دقیقه‌ای کار عمیق و پارکینگ حواس‌پرتی.',
    icon: '⚡',
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 24px; padding: 24px; max-width: 740px; margin: 0 auto; box-shadow: 0 20px 30px -10px rgba(0,0,0,0.5); }
    h1 { margin: 0 0 16px 0; font-size: 22px; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .goal-box { background: #0284c7; color: white; padding: 16px; border-radius: 16px; margin-bottom: 20px; font-weight: bold; }
    .goal-box input { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; width: 100%; border-radius: 8px; padding: 10px; margin-top: 8px; font-size: 14px; outline: none; }
    .goal-box input::placeholder { color: rgba(255,255,255,0.7); }
    .sprints { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    @media (max-width: 600px) { .sprints { grid-template-columns: 1fr; } }
    .sprint { background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 14px; }
    .sprint-title { font-size: 12px; font-weight: bold; color: #94a3b8; margin-bottom: 8px; display: flex; justify-content: space-between; }
    .sprint input[type="text"] { width: 100%; background: #1e293b; border: 1px solid #475569; color: #f8fafc; border-radius: 8px; padding: 6px 8px; font-size: 12px; margin-bottom: 6px; outline: none; }
    .parking-lot { background: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 16px; }
    .parking-lot h3 { margin: 0 0 8px 0; font-size: 13px; color: #fbbf24; }
    textarea { width: 100%; background: #1e293b; border: 1px solid #475569; color: #f8fafc; border-radius: 10px; padding: 10px; min-height: 80px; resize: vertical; outline: none; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚡ اسپرینت تمرکز عمیق (Deep Work)</h1>
    
    <div class="goal-box">
      <div>🎯 هدف بزرگ امروز (تک‌ماموریت حیاتی):</div>
      <input type="text" placeholder="اگر امروز فقط همین یک کار انجام شود، روز موفقی بوده است...">
    </div>

    <div class="sprints">
      <div class="sprint">
        <div class="sprint-title"><span>اسپرینت ۱ (۹۰ دقیقه)</span> <input type="checkbox"></div>
        <input type="text" placeholder="تسک متمرکز ۱">
        <input type="text" placeholder="خروجی مورد انتظار">
      </div>
      <div class="sprint">
        <div class="sprint-title"><span>اسپرینت ۲ (۹۰ دقیقه)</span> <input type="checkbox"></div>
        <input type="text" placeholder="تسک متمرکز ۲">
        <input type="text" placeholder="خروجی مورد انتظار">
      </div>
      <div class="sprint">
        <div class="sprint-title"><span>اسپرینت ۳ (۹۰ دقیقه)</span> <input type="checkbox"></div>
        <input type="text" placeholder="تسک متمرکز ۳">
        <input type="text" placeholder="خروجی مورد انتظار">
      </div>
    </div>

    <div class="parking-lot">
      <h3>🛑 پارکینگ حواس‌پرتی (افکار مزاحمی که حین کار عمیق به ذهن می‌آیند)</h3>
      <textarea placeholder="افکار، پیام‌ها یا کارهای ناگهانی را اینجا پارک کنید تا بعد از اسپرینت انجام دهید..."></textarea>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'preset_cornell_notes',
    name: 'متد یادداشت‌برداری کورنل (Cornell Notes)',
    badge: 'یادداشت & مطالعه',
    desc: 'الگوی استاندارد دانشگاهی کورنل با ستون کلیدواژه‌ها/سوالات، ستون یادداشت‌ها و کادر خلاصه.',
    icon: '📖',
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #fdfbf7; color: #292524; padding: 24px; margin: 0; }
    .card { background: white; border: 2px solid #d6d3d1; border-radius: 20px; padding: 24px; max-width: 760px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
    .meta-bar { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; border-bottom: 2px solid #78716c; padding-bottom: 12px; margin-bottom: 16px; }
    .meta-item label { display: block; font-size: 11px; font-weight: bold; color: #78716c; margin-bottom: 4px; }
    .meta-item input { width: 100%; border: 1px solid #d6d3d1; border-radius: 8px; padding: 6px 10px; font-size: 13px; }
    .cornell-body { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; min-height: 380px; margin-bottom: 16px; }
    .cues-column { background: #f5f5f4; border-radius: 12px; padding: 12px; display: flex; flex-col; gap: 8px; border: 1px solid #e7e5e4; }
    .notes-column { background: #fafaf9; border-radius: 12px; padding: 12px; display: flex; flex-col; gap: 8px; border: 1px solid #e7e5e4; }
    .col-title { font-weight: 800; font-size: 12px; color: #44403c; border-bottom: 1px dashed #d6d3d1; padding-bottom: 6px; margin-bottom: 8px; }
    textarea { width: 100%; border: 1px solid #e7e5e4; border-radius: 8px; padding: 8px; font-size: 13px; line-height: 1.6; resize: vertical; }
    .summary-box { background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 12px; padding: 12px; }
    .summary-box .col-title { color: #86198f; border-bottom-color: #f0abfc; }
  </style>
</head>
<body>
  <div class="card">
    <div class="meta-bar">
      <div class="meta-item">
        <label>موضوع / سرفصل درس:</label>
        <input type="text" placeholder="مثلاً: معماری پایگاه‌داده و نرمال‌سازی">
      </div>
      <div class="meta-item">
        <label>کد یا برچسب:</label>
        <input type="text" placeholder="جلسه ۴">
      </div>
    </div>

    <div class="cornell-body">
      <div class="cues-column">
        <div class="col-title">❓ کلیدواژه‌ها و سوالات اصلی</div>
        <textarea style="height: 320px;" placeholder="• مفاهیم کلیدی\n• سوالات احتمالی آزمون\n• سرنخ‌ها و نکات مهم..."></textarea>
      </div>

      <div class="notes-column">
        <div class="col-title">✍️ یادداشت‌های تفصیلی</div>
        <textarea style="height: 320px;" placeholder="• نکات و فرمول‌ها\n• تعاریف و توضیحات استاد\n• مثال‌های کاربردی\n• دیاگرام‌های متنی..."></textarea>
      </div>
    </div>

    <div class="summary-box">
      <div class="col-title">💡 خلاصه و نتیجه‌گیری نهایی (۲ تا ۳ خط)</div>
      <textarea style="height: 70px;" placeholder="جمع‌بندی مهم‌ترین نکات و لب کلام این جلسه را در چند جمله کوتاه بنویسید..."></textarea>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'preset_eisenhower_interactive',
    name: 'ماتریس اولویت‌بندی آیزنهاور',
    badge: 'مدیریت زمان',
    desc: 'ماتریس ۴ بخشی با قابلیت ثبت تسک و تفکیک فوری/مهم.',
    icon: '📊',
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #f1f5f9; color: #0f172a; padding: 24px; margin: 0; }
    .card { background: white; border-radius: 24px; padding: 24px; max-width: 760px; margin: 0 auto; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    h1 { margin: 0 0 16px 0; font-size: 20px; color: #1e293b; text-align: center; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
    .quadrant { border-radius: 16px; padding: 16px; border: 2px solid transparent; min-height: 200px; display: flex; flex-direction: column; }
    .q1 { background: #fef2f2; border-color: #fecaca; }
    .q2 { background: #f0fdf4; border-color: #bbf7d0; }
    .q3 { background: #fffbeb; border-color: #fde68a; }
    .q4 { background: #f8fafc; border-color: #e2e8f0; }
    .q-title { font-weight: 900; font-size: 13px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
    .q1 .q-title { color: #dc2626; }
    .q2 .q-title { color: #16a34a; }
    .q3 .q-title { color: #d97706; }
    .q4 .q-title { color: #64748b; }
    .task-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .task-item { display: flex; align-items: center; gap: 8px; }
    input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    input[type="text"] { width: 100%; border: 1px solid rgba(0,0,0,0.15); border-radius: 8px; padding: 6px 10px; font-size: 12px; background: white; outline: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📊 ماتریس تصمیم‌گیری آیزنهاور</h1>
    <div class="grid">
      <div class="quadrant q1">
        <div class="q-title">
          <span>🚨 فوری و مهم</span>
          <span style="font-size: 10px; background: #fee2e2; padding: 2px 8px; border-radius: 6px;">همین الان انجام بده</span>
        </div>
        <div class="task-list">
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="تسک فوری و حیاتی..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="رفع بحران یا مهلت امروز..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="..."></div>
        </div>
      </div>

      <div class="quadrant q2">
        <div class="q-title">
          <span>🎯 مهم ولی غیرفوری</span>
          <span style="font-size: 10px; background: #dcfce7; padding: 2px 8px; border-radius: 6px;">برنامه‌ریزی کن</span>
        </div>
        <div class="task-list">
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="ورزش و سلامتی..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="یادگیری مهارت جدید..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="برنامه‌ریزی بلندمدت..."></div>
        </div>
      </div>

      <div class="quadrant q3">
        <div class="q-title">
          <span>⏳ فوری ولی غیرمهم</span>
          <span style="font-size: 10px; background: #fef3c7; padding: 2px 8px; border-radius: 6px;">واگذار کن / سریع رد شو</span>
        </div>
        <div class="task-list">
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="پاسخ به تماس‌ها یا ایمیل‌های روتین..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="درخواست‌های جانبی دیگران..."></div>
        </div>
      </div>

      <div class="quadrant q4">
        <div class="q-title">
          <span>🗑️ نه فوری و نه مهم</span>
          <span style="font-size: 10px; background: #f1f5f9; padding: 2px 8px; border-radius: 6px;">حذف کن</span>
        </div>
        <div class="task-list">
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="اتلاف وقت در شبکه‌های اجتماعی..."></div>
          <div class="task-item"><input type="checkbox"><input type="text" placeholder="فعالیت‌های بی‌ارزش..."></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'preset_meeting_notes',
    name: 'پلنر جلسات و صورتجلسه اقدامات (Meeting Notes)',
    badge: 'کاری & تیمی',
    desc: 'ثبت منظم عنوان جلسه، حاضرین، تصمیمات کلیدی و جدول مسئولیت اقدامات.',
    icon: '👥',
    html: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; max-width: 760px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    h1 { margin: 0 0 16px 0; font-size: 20px; color: #0f172a; border-bottom: 2px solid #0284c7; padding-bottom: 10px; }
    .meta-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 16px; }
    input[type="text"], textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 13px; outline: none; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 16px; }
    .box-title { font-weight: bold; font-size: 13px; color: #0369a1; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #e0f2fe; color: #0369a1; text-align: right; padding: 8px; border: 1px solid #bae6fd; }
    td { padding: 8px; border: 1px solid #e2e8f0; }
    td input { border: none !important; padding: 4px !important; }
  </style>
</head>
<body>
  <div class="card">
    <h1>👥 صورتجلسه و تصمیمات تیمی</h1>
    <div class="meta-grid">
      <div>
        <label style="font-size: 11px; font-weight: bold;">عنوان جلسه و هدف:</label>
        <input type="text" placeholder="مثلاً: هماهنگی اسپرینت فروردین">
      </div>
      <div>
        <label style="font-size: 11px; font-weight: bold;">حاضرین در جلسه:</label>
        <input type="text" placeholder="علی، مریم، رضا...">
      </div>
    </div>

    <div class="box">
      <div class="box-title">📌 نکات و مباحث اصلی مطرح‌شده:</div>
      <textarea style="min-height: 100px;" placeholder="• موضوعات بررسی‌شده...\n• چالش‌ها و نظرات اعضا..."></textarea>
    </div>

    <div class="box">
      <div class="box-title">✅ جدول اقدامات و وظایف (Action Items):</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">شرح کار / تسک</th>
            <th style="width: 25%;">مسئول انجام</th>
            <th style="width: 25%;">مهلت تحویل</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><input type="text" placeholder="ارسال پروپوزال نهایی"></td>
            <td><input type="text" placeholder="مریم"></td>
            <td><input type="text" placeholder="پنج‌شنبه"></td>
          </tr>
          <tr>
            <td><input type="text" placeholder="به‌روزرسانی سرور"></td>
            <td><input type="text" placeholder="رضا"></td>
            <td><input type="text" placeholder="شنبه"></td>
          </tr>
          <tr>
            <td><input type="text" placeholder="..."></td>
            <td><input type="text" placeholder="..."></td>
            <td><input type="text" placeholder="..."></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`,
  },
];

/**
 * Injects a two-way synchronization script and scrollbar removal styles into custom HTML:
 * 1. Completely removes internal iframe scrollbars (*, html, body)
 * 2. Automatically measures full document height and posts CUSTOM_HTML_RESIZE
 * 3. Captures form inputs/checkboxes in real-time and posts CUSTOM_HTML_SYNC
 */
export function injectHtmlSyncScript(rawHtml: string): string {
  if (!rawHtml) return '';

  // Clean any previous injected script or style to prevent duplicates
  let html = rawHtml
    .replace(/<style id="__planner_no_scrollbar_style__">[\s\S]*?<\/style>/gi, '')
    .replace(/<script id="__planner_sync_script__">[\s\S]*?<\/script>/gi, '');

  // 1. Ensure RTL direction and Persian language if not set
  if (!html.includes('dir=')) {
    html = html.replace(/<html/i, '<html dir="rtl" lang="fa"');
  }

  // 2. Ensure Persian web fonts are available if missing
  const fontLinks = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Lalezar&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.4.0/dist/font-face.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/shabnam-font@v5.0.1/dist/font-face.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/samim-font@v4.0.5/dist/font-face.css">
`;
  if (!html.includes('rastikerdar') && !html.includes('Vazirmatn')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${fontLinks}\n</head>`);
    } else if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${fontLinks}`);
    }
  }

  const injectedCode = `
<style id="__planner_no_scrollbar_style__">
  :root {
    --sheet-font-family: 'Vazirmatn', sans-serif;
    --sheet-font-size: 14px;
    --sheet-font-weight: 400;
    --sheet-font-style: normal;
    --sheet-text-decoration: none;
    --sheet-text-align: right;
    --sheet-text-color: #1e293b;
  }

  /* Force remove any internal scrollbars and allow natural expansion for Drawing Canvas Overlay */
  html, body {
    overflow-x: hidden !important;
    overflow-y: visible !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
    height: auto !important;
    min-height: 100% !important;
    max-height: none !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  ::-webkit-scrollbar {
    display: none !important;
    width: 0px !important;
    height: 0px !important;
  }

  /* Universal typography bridge: connects ANY incoming HTML inputs & text to font toolbar */
  body {
    font-family: var(--sheet-font-family, 'Vazirmatn', sans-serif);
    color: var(--sheet-text-color, #1e293b);
  }
  input, textarea, select, button {
    font-family: var(--sheet-font-family, 'Vazirmatn', sans-serif);
  }
  input:not([type="checkbox"]):not([type="radio"]), textarea {
    color: var(--sheet-text-color, inherit);
    font-size: var(--sheet-font-size, inherit);
    font-weight: var(--sheet-font-weight, inherit);
    font-style: var(--sheet-font-style, inherit);
    text-decoration: var(--sheet-text-decoration, inherit);
  }
</style>
<script id="__planner_sync_script__">
(function() {
  function getFullHeight() {
    try {
      var body = document.body;
      var doc = document.documentElement;
      var h = 0;
      if (body) {
        h = Math.max(h, body.scrollHeight || 0, body.offsetHeight || 0, body.clientHeight || 0);
        for (var i = 0; i < body.children.length; i++) {
          var el = body.children[i];
          if (el.id !== '__planner_sync_script__' && el.id !== '__planner_no_scrollbar_style__' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
            var bottom = (el.offsetTop || 0) + (el.offsetHeight || 0);
            var rect = el.getBoundingClientRect();
            h = Math.max(h, bottom, Math.ceil(rect.bottom));
          }
        }
      }
      if (doc) {
        h = Math.max(h, doc.scrollHeight || 0, doc.offsetHeight || 0, doc.clientHeight || 0);
      }
      return Math.max(h, 450);
    } catch (e) {
      return 850;
    }
  }

  function sendHeight() {
    try {
      var h = getFullHeight();
      if (h > 0 && window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'CUSTOM_HTML_RESIZE',
          height: h
        }, '*');
      }
    } catch (e) {}
  }

  function syncState() {
    try {
      document.querySelectorAll('input').forEach(function(el) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          if (el.checked) {
            el.setAttribute('checked', 'checked');
          } else {
            el.removeAttribute('checked');
          }
        } else {
          el.setAttribute('value', el.value || '');
        }
      });
      document.querySelectorAll('textarea').forEach(function(el) {
        el.textContent = el.value || '';
      });
      document.querySelectorAll('select').forEach(function(el) {
        Array.from(el.options).forEach(function(opt) {
          if (opt.selected) {
            opt.setAttribute('selected', 'selected');
          } else {
            opt.removeAttribute('selected');
          }
        });
      });

      sendHeight();

      if (window.parent && window.parent !== window) {
        var clone = document.documentElement.cloneNode(true);
        var s = clone.querySelector('#__planner_sync_script__');
        if (s) s.remove();
        var st = clone.querySelector('#__planner_no_scrollbar_style__');
        if (st) st.remove();
        window.parent.postMessage({
          type: 'CUSTOM_HTML_SYNC',
          html: '<!DOCTYPE html>\\n' + clone.outerHTML
        }, '*');
      }
    } catch (e) {}
  }

  // Listeners for height changes
  window.addEventListener('load', function() {
    sendHeight();
    setTimeout(sendHeight, 100);
    setTimeout(sendHeight, 350);
    setTimeout(sendHeight, 800);
    setTimeout(sendHeight, 1500);
  });
  window.addEventListener('resize', sendHeight);
  document.addEventListener('DOMContentLoaded', sendHeight);

  if (window.ResizeObserver) {
    try {
      var ro = new ResizeObserver(function() {
        sendHeight();
      });
      if (document.documentElement) ro.observe(document.documentElement);
      if (document.body) ro.observe(document.body);
    } catch (err) {}
  }

  // Immediate height triggers
  sendHeight();
  setTimeout(sendHeight, 50);
  setTimeout(sendHeight, 200);

  window.__planner_sync_state__ = syncState;

  // Real-time typography and text selection inspection for Word-style formatting
  function notifyActiveFormat(target) {
    try {
      if (!target || target === document.body || target === document.documentElement) return;
      var style = window.getComputedStyle(target);
      var fs = parseInt(target.style.fontSize || style.fontSize, 10);
      var color = target.style.color || style.color;
      var fw = target.style.fontWeight || style.fontWeight;
      var isItalic = (target.style.fontStyle || style.fontStyle) === 'italic';
      var textDec = target.style.textDecoration || style.textDecoration;
      var isUnderline = textDec ? textDec.indexOf('underline') !== -1 : false;
      var fontFam = target.style.fontFamily || style.fontFamily;
      var textAlign = target.style.textAlign || style.textAlign;

      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'CUSTOM_HTML_FORMAT_INSPECT',
          fontSize: fs || 14,
          textColor: color,
          fontFamily: fontFam,
          isBold: fw === 'bold' || fw === '700' || fw === '800' || fw === '900' || parseInt(fw, 10) >= 600,
          isItalic: isItalic,
          isUnderline: isUnderline,
          textAlign: textAlign
        }, '*');
      }
    } catch (e) {}
  }

  document.addEventListener('focusin', function(e) { notifyActiveFormat(e.target); }, true);
  document.addEventListener('mouseup', function(e) {
    var sel = window.getSelection();
    if (sel && sel.anchorNode) {
      var n = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement;
      notifyActiveFormat(n || e.target);
    } else {
      notifyActiveFormat(e.target);
    }
  }, true);

  // Debounced input listeners for smooth typing without event flooding
  var syncDebounceTimer = null;
  function debouncedSyncState() {
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(syncState, 250);
  }

  document.addEventListener('input', debouncedSyncState, true);
  document.addEventListener('change', syncState, true);
  window.addEventListener('blur', syncState, true);

  // Secure cross-frame styling listener
  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'APPLY_STYLE_FORMAT' && e.data.updates) {
      var updates = e.data.updates;
      if (document.documentElement) {
        var root = document.documentElement;
        if (updates.fontFamily) root.style.setProperty('--sheet-font-family', "'" + updates.fontFamily + "', sans-serif");
        if (updates.fontSize) root.style.setProperty('--sheet-font-size', updates.fontSize + 'px');
        if (updates.isBold !== undefined) root.style.setProperty('--sheet-font-weight', updates.isBold ? '700' : '400');
        if (updates.isItalic !== undefined) root.style.setProperty('--sheet-font-style', updates.isItalic ? 'italic' : 'normal');
        if (updates.isUnderline !== undefined) root.style.setProperty('--sheet-text-decoration', updates.isUnderline ? 'underline' : 'none');
        if (updates.textAlign) root.style.setProperty('--sheet-text-align', updates.textAlign);
        if (updates.textColor) root.style.setProperty('--sheet-text-color', updates.textColor);
      }

      var sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.toString().trim().length > 0 && sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        var span = document.createElement('span');
        if (updates.fontSize) span.style.fontSize = updates.fontSize + 'px';
        if (updates.textColor) span.style.color = updates.textColor;
        if (updates.fontFamily) span.style.fontFamily = "'" + updates.fontFamily + "', sans-serif";
        if (updates.isBold !== undefined) span.style.fontWeight = updates.isBold ? '700' : '400';
        if (updates.isItalic !== undefined) span.style.fontStyle = updates.isItalic ? 'italic' : 'normal';
        if (updates.isUnderline !== undefined) span.style.textDecoration = updates.isUnderline ? 'underline' : 'none';

        try {
          var extracted = range.extractContents();
          span.appendChild(extracted);
          range.insertNode(span);
          sel.removeAllRanges();
          var newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.addRange(newRange);
        } catch (err) {}
      } else {
        var active = document.activeElement;
        if (active && active !== document.body && active !== document.documentElement) {
          if (updates.fontSize) active.style.fontSize = updates.fontSize + 'px';
          if (updates.textColor) active.style.color = updates.textColor;
          if (updates.fontFamily) active.style.fontFamily = "'" + updates.fontFamily + "', sans-serif";
          if (updates.isBold !== undefined) active.style.fontWeight = updates.isBold ? '700' : '400';
          if (updates.isItalic !== undefined) active.style.fontStyle = updates.isItalic ? 'italic' : 'normal';
          if (updates.isUnderline !== undefined) active.style.textDecoration = updates.isUnderline ? 'underline' : 'none';
          if (updates.textAlign) active.style.textAlign = updates.textAlign;
        }
      }
      syncState();
    }
  });

  // -----------------------------------------------------------------
  // Universal Smart Line Navigation Engine for ANY Imported HTML
  // (Enter / ArrowDown / ArrowUp / Backspace on empty line)
  // -----------------------------------------------------------------
  function initKeyboardNavigation() {
    function getAllNavigableInputs() {
      return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]'));
    }

    // Enter on top headings (h1, h2, h3) jumps to the first input line
    var headings = document.querySelectorAll('h1, h2, h3');
    headings.forEach(function(h) {
      if (!h.hasAttribute('tabindex')) {
        h.setAttribute('tabindex', '0');
      }
      h.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var inputs = getAllNavigableInputs();
          if (inputs.length > 0) {
            inputs[0].focus();
          }
        }
      });
    });

    document.addEventListener('keydown', function(e) {
      var target = e.target;
      if (!target) return;
      var isInput = target.tagName === 'INPUT';
      var isTextarea = target.tagName === 'TEXTAREA';
      var isContentEditable = target.isContentEditable;

      if (!isInput && !isTextarea && !isContentEditable) return;

      var inputs = getAllNavigableInputs();
      var idx = inputs.indexOf(target);
      if (idx === -1) return;

      // 1. Enter or ArrowDown: In single-line inputs, go to next line
      if ((e.key === 'Enter' || e.key === 'ArrowDown') && isInput) {
        e.preventDefault();
        if (idx + 1 < inputs.length) {
          inputs[idx + 1].focus();
        }
        return;
      }

      // 2. ArrowUp: In single-line inputs, return to previous line
      if (e.key === 'ArrowUp' && isInput) {
        e.preventDefault();
        if (idx > 0) {
          var prev = inputs[idx - 1];
          prev.focus();
          try {
            var len = prev.value ? prev.value.length : 0;
            prev.setSelectionRange(len, len);
          } catch(err) {}
        } else if (headings.length > 0) {
          headings[0].focus();
        }
        return;
      }

      // 3. Backspace on empty line: return to previous line
      if (e.key === 'Backspace') {
        var isEmpty = (isInput || isTextarea) ? (target.value === '') : (target.textContent.trim() === '');
        if (isEmpty) {
          e.preventDefault();
          if (idx > 0) {
            var prev = inputs[idx - 1];
            prev.focus();
            try {
              var len = prev.value ? prev.value.length : 0;
              prev.setSelectionRange(len, len);
            } catch(err) {}
          } else if (headings.length > 0) {
            headings[0].focus();
          }
        }
      }
    });
  }

  // Auto-inherit CSS typography variables from parent journal container
  try {
    if (window.parent && window.parent.document) {
      var parentContainer = window.parent.document.querySelector('.planner-page-content');
      if (parentContainer) {
        var computed = window.parent.getComputedStyle(parentContainer);
        var ff = computed.getPropertyValue('--sheet-font-family');
        if (ff) document.documentElement.style.setProperty('--sheet-font-family', ff);
        var fs = computed.getPropertyValue('--sheet-font-size');
        if (fs) document.documentElement.style.setProperty('--sheet-font-size', fs);
        var fw = computed.getPropertyValue('--sheet-font-weight');
        if (fw) document.documentElement.style.setProperty('--sheet-font-weight', fw);
        var fst = computed.getPropertyValue('--sheet-font-style');
        if (fst) document.documentElement.style.setProperty('--sheet-font-style', fst);
        var td = computed.getPropertyValue('--sheet-text-decoration');
        if (td) document.documentElement.style.setProperty('--sheet-text-decoration', td);
        var ta = computed.getPropertyValue('--sheet-text-align');
        if (ta) document.documentElement.style.setProperty('--sheet-text-align', ta);
        var tc = computed.getPropertyValue('--sheet-text-color');
        if (tc) document.documentElement.style.setProperty('--sheet-text-color', tc);
      }
    }
  } catch (err) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboardNavigation);
  } else {
    initKeyboardNavigation();
  }
})();
</script>
`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${injectedCode}</body>`);
  }
  return html + injectedCode;
}
