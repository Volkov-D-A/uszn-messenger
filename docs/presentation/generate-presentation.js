"use strict";

const path = require("node:path");
const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Проект системы коммуникации УСЗН";
pptx.company = "УСЗН";
pptx.subject = "Предложение о внедрении внутренней системы коммуникации";
pptx.title = "Система коммуникации УСЗН";
pptx.lang = "ru-RU";
pptx.theme = { headFontFace: "Arial", bodyFontFace: "Arial", lang: "ru-RU" };

const C = {
  ink: "101828",
  navy: "14213D",
  slate: "344054",
  muted: "667085",
  faint: "98A2B3",
  line: "D9E0EA",
  paper: "FFFFFF",
  canvas: "F5F7FB",
  blue: "5178FF",
  blueDark: "3157D5",
  blueSoft: "E9EEFF",
  cyan: "30B8A5",
  cyanSoft: "DDF7F2",
  amber: "EAA43A",
  amberSoft: "FFF3D8",
  coral: "E96464",
  coralSoft: "FFE7E7",
  green: "37A66B",
  greenSoft: "E4F5EB",
  violet: "8567C8",
  violetSoft: "EEE8FA",
  dark: "151B2B",
  dark2: "1E2638",
  dark3: "273148",
  darkText: "E8ECF5",
  darkMuted: "9EA9BE",
};

const OUT = path.join(__dirname, "sistema-kommunikacii-uszn.pptx");
const ILLUSTRATION = path.join(__dirname, "assets", "communication-overload.png");

pptx.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.canvas },
  objects: [
    { rect: { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: C.blue }, line: { color: C.blue } } },
    { text: { text: "СИСТЕМА КОММУНИКАЦИИ УСЗН  •  ДЛЯ ОБСУЖДЕНИЯ", options: { x: 0.62, y: 7.12, w: 6.2, h: 0.16, fontFace: "Arial", fontSize: 7.5, color: "8691A6", margin: 0, charSpacing: 0.7 } } },
  ],
  slideNumber: { x: 12.25, y: 7.08, w: 0.45, h: 0.2, fontFace: "Arial", fontSize: 8, color: "8691A6", align: "right", margin: 0 },
});

function addText(slide, value, x, y, w, h, size = 16, color = C.ink, options = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: "Arial",
    fontSize: size,
    color,
    bold: options.bold || false,
    italic: options.italic || false,
    margin: options.margin === undefined ? 0 : options.margin,
    valign: options.valign || "mid",
    align: options.align || "left",
    fit: "shrink",
    charSpacing: options.charSpacing,
  });
}

function shape(slide, type, x, y, w, h, fill, border = fill, options = {}) {
  slide.addShape(type, {
    x, y, w, h,
    fill: { color: fill, transparency: options.transparency || 0 },
    line: {
      color: border,
      transparency: options.lineTransparency === undefined ? 100 : options.lineTransparency,
      width: options.lineWidth || 0.8,
    },
  });
}

function line(slide, x, y, w, h, color = C.line, width = 1, dash = "solid") {
  slide.addShape(pptx.ShapeType.line, { x, y, w, h, line: { color, width, dash } });
}

function pill(slide, label, x, y, w, color = C.blueDark, fill = C.blueSoft) {
  shape(slide, pptx.ShapeType.roundRect, x, y, w, 0.34, fill);
  addText(slide, label, x + 0.08, y + 0.03, w - 0.16, 0.25, 8.2, color, { bold: true, align: "center" });
}

function title(slide, eyebrow, heading, subheading) {
  addText(slide, eyebrow.toUpperCase(), 0.64, 0.28, 5.2, 0.25, 9, C.blue, { bold: true, charSpacing: 1.3 });
  addText(slide, heading, 0.64, 0.61, 12.0, 0.67, 26, C.ink, { bold: true });
  if (subheading) addText(slide, subheading, 0.64, 1.27, 11.9, 0.42, 12.2, C.muted);
}

function iconCircle(slide, label, x, y, color, soft, size = 0.52) {
  shape(slide, pptx.ShapeType.ellipse, x, y, size, size, soft);
  addText(slide, label, x, y + 0.01, size, size - 0.02, 12, color, { bold: true, align: "center" });
}

function avatar(slide, initials, x, y, color, size = 0.34) {
  shape(slide, pptx.ShapeType.ellipse, x, y, size, size, color);
  addText(slide, initials, x, y + 0.01, size, size - 0.02, 6.7, C.paper, { bold: true, align: "center" });
}

function checkItem(slide, text, x, y, w, accent = C.green) {
  shape(slide, pptx.ShapeType.ellipse, x, y + 0.02, 0.28, 0.28, accent);
  addText(slide, "✓", x, y + 0.015, 0.28, 0.25, 8.5, C.paper, { bold: true, align: "center" });
  addText(slide, text, x + 0.42, y, w - 0.42, 0.33, 10.7, C.slate, { bold: true });
}

function addInterfaceMockup(slide, x, y, w, h) {
  const top = 0.45;
  const left = 2.27;
  const right = 2.28;
  const center = w - left - right;

  shape(slide, pptx.ShapeType.roundRect, x, y, w, h, C.dark, "0D1220", { lineTransparency: 0 });
  shape(slide, pptx.ShapeType.rect, x, y, w, top, "101625");
  shape(slide, pptx.ShapeType.ellipse, x + 0.16, y + 0.12, 0.2, 0.2, C.blue);
  addText(slide, "У", x + 0.16, y + 0.125, 0.2, 0.17, 6.3, C.paper, { bold: true, align: "center" });
  addText(slide, "Система коммуникации УСЗН", x + 0.45, y + 0.09, 2.5, 0.25, 10.2, C.darkText, { bold: true });
  pill(slide, "демонстрационный экран", x + w - 2.14, y + 0.085, 1.83, C.cyan, "163B3B");

  const cy = y + top;
  const ch = h - top;
  shape(slide, pptx.ShapeType.rect, x, cy, left, ch, C.dark2);
  shape(slide, pptx.ShapeType.rect, x + left, cy, center, ch, "F8FAFD");
  shape(slide, pptx.ShapeType.rect, x + left + center, cy, right, ch, "EFF3F8");

  // Left: chats
  shape(slide, pptx.ShapeType.roundRect, x + 0.16, cy + 0.17, left - 0.32, 0.36, C.dark3);
  addText(slide, "Поиск", x + 0.34, cy + 0.22, 1.15, 0.22, 8.2, C.darkMuted);
  shape(slide, pptx.ShapeType.roundRect, x + 0.12, cy + 0.67, left - 0.24, 0.43, "2E3C61");
  addText(slide, "Объявления", x + 0.34, cy + 0.74, 1.3, 0.24, 8.8, C.darkText, { bold: true });
  shape(slide, pptx.ShapeType.ellipse, x + left - 0.45, cy + 0.78, 0.2, 0.2, C.coral);
  addText(slide, "3", x + left - 0.45, cy + 0.78, 0.2, 0.18, 6.4, C.paper, { bold: true, align: "center" });
  addText(slide, "АКТИВНЫЕ ЧАТЫ", x + 0.2, cy + 1.3, 1.5, 0.2, 7, C.darkMuted, { bold: true, charSpacing: 0.8 });
  const chats = [
    ["УС", "Управление соцзащиты", "12", C.blue],
    ["КП", "Кадровые вопросы", "", C.cyan],
    ["АВ", "Анна Волкова", "2", C.violet],
    ["ИТ", "ИТ-поддержка", "", C.amber],
  ];
  chats.forEach((chat, i) => {
    const yy = cy + 1.6 + i * 0.56;
    if (i === 0) shape(slide, pptx.ShapeType.roundRect, x + 0.11, yy - 0.04, left - 0.22, 0.47, C.dark3);
    avatar(slide, chat[0], x + 0.2, yy, chat[3]);
    addText(slide, chat[1], x + 0.64, yy, 1.35, 0.21, 8.2, i === 0 ? C.darkText : "C7CFDB", { bold: i === 0 });
    addText(slide, i === 0 ? "Новый документ" : i === 2 ? "На связи" : "Без новых сообщений", x + 0.64, yy + 0.2, 1.35, 0.16, 6.5, C.darkMuted);
    if (chat[2]) {
      shape(slide, pptx.ShapeType.ellipse, x + left - 0.42, yy + 0.08, 0.18, 0.18, C.blue);
      addText(slide, chat[2], x + left - 0.42, yy + 0.075, 0.18, 0.18, 5.9, C.paper, { bold: true, align: "center" });
    }
  });

  // Center: conversation
  shape(slide, pptx.ShapeType.rect, x + left, cy, center, 0.56, C.paper);
  addText(slide, "#  Управление соцзащиты", x + left + 0.24, cy + 0.08, 2.8, 0.24, 9.8, C.ink, { bold: true });
  addText(slide, "Чат подразделения  •  47 сотрудников", x + left + 0.24, cy + 0.32, 2.9, 0.16, 6.9, C.muted);
  pill(slide, "Закреплено 4", x + left + center - 1.48, cy + 0.12, 1.17);
  line(slide, x + left, cy + 0.56, center, 0, C.line, 0.7);

  avatar(slide, "МК", x + left + 0.25, cy + 0.8, "7584A8");
  addText(slide, "Мария Кузнецова", x + left + 0.71, cy + 0.78, 1.55, 0.2, 8.1, C.ink, { bold: true });
  addText(slide, "10:28", x + left + 2.25, cy + 0.78, 0.45, 0.2, 6.4, C.faint);
  addText(slide, "Коллеги, разместила обновленный график приема.", x + left + 0.71, cy + 1.02, center - 1.02, 0.23, 8, C.slate);
  shape(slide, pptx.ShapeType.roundRect, x + left + 0.71, cy + 1.33, 2.45, 0.49, "EDF1F7");
  shape(slide, pptx.ShapeType.roundRect, x + left + 0.84, cy + 1.44, 0.28, 0.27, C.blueSoft);
  addText(slide, "PDF", x + left + 0.84, cy + 1.45, 0.28, 0.22, 5.7, C.blue, { bold: true, align: "center" });
  addText(slide, "График_приема_август.pdf", x + left + 1.23, cy + 1.4, 1.7, 0.2, 7.5, C.slate, { bold: true });
  addText(slide, "1,8 МБ", x + left + 1.23, cy + 1.61, 0.6, 0.16, 6.2, C.muted);

  avatar(slide, "АП", x + left + 0.25, cy + 2.11, C.blue);
  addText(slide, "Алексей Петров", x + left + 0.71, cy + 2.09, 1.45, 0.2, 8.1, C.ink, { bold: true });
  addText(slide, "10:34", x + left + 2.13, cy + 2.09, 0.45, 0.2, 6.4, C.faint);
  shape(slide, pptx.ShapeType.roundRect, x + left + 0.71, cy + 2.36, center - 1.05, 0.88, C.blueSoft, "C8D4FF", { lineTransparency: 0 });
  pill(slide, "ВАЖНО", x + left + 0.9, cy + 2.53, 0.68, C.blueDark, "D7E0FF");
  addText(slide, "Обновленный график действует с 1 августа.", x + left + 0.9, cy + 2.86, center - 1.55, 0.22, 8, C.ink, { bold: true });

  const inputY = cy + ch - 0.64;
  shape(slide, pptx.ShapeType.rect, x + left, inputY - 0.1, center, 0.74, C.paper);
  shape(slide, pptx.ShapeType.roundRect, x + left + 0.22, inputY + 0.02, center - 0.44, 0.42, "F1F4F8");
  addText(slide, "+", x + left + 0.34, inputY + 0.08, 0.2, 0.24, 12, C.blue, { bold: true, align: "center" });
  addText(slide, "Написать сообщение…", x + left + 0.68, inputY + 0.09, 2.6, 0.21, 7.6, C.faint);
  shape(slide, pptx.ShapeType.ellipse, x + left + center - 0.63, inputY + 0.08, 0.29, 0.29, C.blue);
  addText(slide, "›", x + left + center - 0.63, inputY + 0.07, 0.29, 0.25, 12, C.paper, { bold: true, align: "center" });

  // Right: staff
  addText(slide, "СОТРУДНИКИ — 47", x + left + center + 0.22, cy + 0.18, 1.65, 0.2, 7.2, C.muted, { bold: true, charSpacing: 0.6 });
  shape(slide, pptx.ShapeType.roundRect, x + left + center + 0.18, cy + 0.54, right - 0.36, 0.36, C.paper);
  addText(slide, "Найти сотрудника", x + left + center + 0.34, cy + 0.61, 1.3, 0.2, 7, C.faint);
  const people = [
    ["АП", "Алексей Петров", "Руководитель", C.blue, C.green],
    ["МК", "Мария Кузнецова", "Специалист", "7584A8", C.green],
    ["ДС", "Дмитрий Смирнов", "Юрист", C.cyan, C.amber],
    ["ЕО", "Елена Орлова", "Кадры", C.violet, C.green],
    ["АК", "Антон Ковалев", "ИТ", C.amber, C.faint],
  ];
  people.forEach((person, i) => {
    const yy = cy + 1.15 + i * 0.58;
    avatar(slide, person[0], x + left + center + 0.25, yy, person[3]);
    shape(slide, pptx.ShapeType.ellipse, x + left + center + 0.51, yy + 0.25, 0.09, 0.09, person[4]);
    addText(slide, person[1], x + left + center + 0.72, yy, 1.22, 0.2, 7.6, C.slate, { bold: true });
    addText(slide, person[2], x + left + center + 0.72, yy + 0.21, 1.15, 0.16, 6.4, C.muted);
  });
  shape(slide, pptx.ShapeType.roundRect, x + left + center + 0.2, cy + ch - 1.02, right - 0.4, 0.68, C.greenSoft);
  addText(slide, "●  34 сотрудника на связи", x + left + center + 0.4, cy + ch - 0.9, 1.55, 0.22, 7.4, C.green, { bold: true });
  addText(slide, "Статусы помогают выбрать удобное время", x + left + center + 0.4, cy + ch - 0.63, 1.52, 0.22, 6.4, C.muted);
}

// 1. Title and decision
{
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  shape(slide, pptx.ShapeType.rect, 0, 0, 0.12, 7.5, C.blue);
  shape(slide, pptx.ShapeType.ellipse, 9.4, -0.8, 4.8, 4.8, "27365B", C.dark, { transparency: 10 });
  shape(slide, pptx.ShapeType.ellipse, 10.7, 2.5, 3.2, 3.2, "173E43", C.dark, { transparency: 6 });
  pill(slide, "ПРЕДЛОЖЕНИЕ К РАССМОТРЕНИЮ", 0.76, 0.66, 2.48, C.cyan, "183941");
  addText(slide, "Система коммуникации УСЗН", 0.76, 1.42, 8.6, 0.82, 33, C.paper, { bold: true });
  addText(slide, "Единое пространство для общения сотрудников,\nрабочих групп и подразделений", 0.76, 2.35, 8.1, 1.35, 23, C.darkText, { bold: true, valign: "top" });
  addText(slide, "Цель проекта — внедрить внутреннюю систему, которая объединит переписку, объявления и рабочие материалы.", 0.78, 4.02, 7.2, 0.76, 13.5, C.darkMuted, { valign: "top" });
  const tags = [["Windows и Linux", 0.78, 1.58], ["Данные внутри организации", 2.55, 2.12], ["Для всех подразделений", 4.89, 1.82]];
  tags.forEach(([label, x, w]) => pill(slide, label, x, 5.21, w, C.darkText, C.dark3));
  shape(slide, pptx.ShapeType.roundRect, 9.2, 4.57, 3.15, 1.55, C.blue);
  addText(slide, "РЕШЕНИЕ", 9.5, 4.8, 1.0, 0.22, 8, "DCE4FF", { bold: true, charSpacing: 1.1 });
  addText(slide, "Поддержать создание\nи внедрение системы", 9.5, 5.16, 2.5, 0.67, 17, C.paper, { bold: true, valign: "top" });
  addText(slide, "Концепция проекта", 0.78, 7.05, 2.2, 0.2, 8, C.darkMuted, { charSpacing: 0.6 });
}

// 2. Problem with illustration
{
  const slide = pptx.addSlide("CONTENT");
  title(slide, "Почему это нужно", "Рабочее сообщение иногда проходит настоящий квест", "Сегодня переписка, файлы и объявления могут быть разбросаны по разным каналам.");
  shape(slide, pptx.ShapeType.roundRect, 0.65, 1.93, 4.33, 4.72, C.navy);
  addText(slide, "Пока сотрудник ищет\nнужный чат…", 0.96, 2.27, 3.6, 0.82, 21, C.paper, { bold: true, valign: "top" });
  addText(slide, "…нужный чат иногда\nуже ищет сотрудника.", 0.96, 3.17, 3.5, 0.7, 15.5, C.cyanSoft, { bold: true, valign: "top" });
  line(slide, 0.96, 4.07, 3.55, 0, "41506A", 0.8);
  checkItem(slide, "Трудно восстановить контекст", 0.96, 4.42, 3.55, C.coral);
  checkItem(slide, "Файлы и решения теряются", 0.96, 5.02, 3.55, C.amber);
  checkItem(slide, "Рассылки требуют ручной работы", 0.96, 5.62, 3.55, C.blue);
  addText(slide, "Это не проблема сотрудников — это отсутствие единого рабочего пространства.", 0.96, 6.15, 3.55, 0.31, 9.2, C.darkMuted, { italic: true });
  shape(slide, pptx.ShapeType.roundRect, 5.22, 1.93, 7.45, 4.72, C.paper, C.line, { lineTransparency: 0 });
  slide.addImage({ path: ILLUSTRATION, x: 5.32, y: 2.03, w: 7.25, h: 4.08 });
  pill(slide, "ЛЕГКИЙ ПУТЬ К ПОРЯДКУ", 8.84, 6.06, 2.95, C.blueDark, C.blueSoft);
}

// 3. Visual concept
{
  const slide = pptx.addSlide("CONTENT");
  title(slide, "Как будет выглядеть система", "Все рабочее общение — в одном окне", "Слева чаты, в центре переписка и материалы, справа сотрудники и их текущие статусы.");
  addInterfaceMockup(slide, 0.63, 1.83, 12.05, 4.92);
}

// 4. Capabilities hub
{
  const slide = pptx.addSlide("CONTENT");
  title(slide, "Основные возможности", "Система объединяет повседневные рабочие сценарии", "Вместо набора разрозненных средств — одна понятная точка для общения и информирования.");

  shape(slide, pptx.ShapeType.ellipse, 5.22, 2.27, 2.9, 2.9, C.navy);
  shape(slide, pptx.ShapeType.ellipse, 5.59, 2.64, 2.16, 2.16, "202D4B");
  addText(slide, "Система\nкоммуникации\nУСЗН", 5.73, 3.07, 1.88, 1.1, 17, C.paper, { bold: true, align: "center", valign: "mid" });

  const nodes = [
    [0.73, 1.96, 3.46, 1.12, "Личные и групповые чаты", "Общение один на один, по теме или в подразделении", "Ч", C.blue, C.blueSoft],
    [0.73, 3.46, 3.46, 1.12, "Объявления нужной аудитории", "Всем сотрудникам, группе, подразделению или по тегу", "!", C.cyan, C.cyanSoft],
    [0.73, 4.96, 3.46, 1.12, "Файлы и фотографии", "Материалы остаются рядом с обсуждением", "+", C.violet, C.violetSoft],
    [9.14, 1.96, 3.46, 1.12, "Поиск и закрепления", "Важное можно найти, а ключевое — закрепить", "⌕", C.amber, C.amberSoft],
    [9.14, 3.46, 3.46, 1.12, "Статусы и «Не беспокоить»", "Коллеги видят доступность, автоответ сообщает об отсутствии", "●", C.green, C.greenSoft],
    [9.14, 4.96, 3.46, 1.12, "Упоминания сотрудников", "Быстрый способ привлечь внимание нужного человека", "@", C.coral, C.coralSoft],
  ];
  nodes.forEach((n) => {
    shape(slide, pptx.ShapeType.roundRect, n[0], n[1], n[2], n[3], C.paper, C.line, { lineTransparency: 0 });
    iconCircle(slide, n[6], n[0] + 0.2, n[1] + 0.28, n[7], n[8], 0.55);
    addText(slide, n[4], n[0] + 0.94, n[1] + 0.17, 2.25, 0.32, 11.5, C.ink, { bold: true });
    addText(slide, n[5], n[0] + 0.94, n[1] + 0.55, 2.25, 0.4, 8.6, C.muted, { valign: "top" });
  });
  line(slide, 4.19, 2.52, 1.03, 0.7, "B8C4D8", 1.2);
  line(slide, 4.19, 4.02, 1.03, -0.3, "B8C4D8", 1.2);
  line(slide, 4.19, 5.52, 1.03, -1.15, "B8C4D8", 1.2);
  line(slide, 8.12, 3.22, 1.02, -0.7, "B8C4D8", 1.2);
  line(slide, 8.12, 3.72, 1.02, 0.3, "B8C4D8", 1.2);
  line(slide, 8.12, 4.37, 1.02, 1.15, "B8C4D8", 1.2);

  shape(slide, pptx.ShapeType.roundRect, 4.43, 5.58, 4.47, 0.67, C.blueSoft);
  addText(slide, "В дальнейшем можно добавить запрос подтверждения прочтения важных сообщений.", 4.67, 5.7, 3.98, 0.38, 8.7, C.blueDark, { bold: true, align: "center" });
}

// 5. Benefits / before and after
{
  const slide = pptx.addSlide("CONTENT");
  title(slide, "Что даст переход", "Из множества каналов — в единое рабочее пространство", "Ожидаемый результат: меньше потерь информации, быстрее координация и понятнее доступ к рабочим материалам.");

  shape(slide, pptx.ShapeType.roundRect, 0.67, 1.92, 4.13, 2.16, "F0F2F6");
  pill(slide, "СЕЙЧАС", 0.94, 2.18, 0.82, C.coral, C.coralSoft);
  const scattered = [
    [1.02, 2.8, "Письмо", C.amberSoft, C.amber],
    [2.09, 3.25, "Чат", C.blueSoft, C.blue],
    [3.15, 2.68, "Файл", C.violetSoft, C.violet],
    [3.55, 3.45, "Звонок", C.cyanSoft, C.cyan],
  ];
  scattered.forEach((s) => {
    shape(slide, pptx.ShapeType.roundRect, s[0], s[1], 0.92, 0.48, s[3], s[4], { lineTransparency: 0 });
    addText(slide, s[2], s[0], s[1] + 0.07, 0.92, 0.28, 8.2, s[4], { bold: true, align: "center" });
  });
  addText(slide, "Информация разбросана", 1.03, 3.69, 3.4, 0.25, 10.2, C.muted, { bold: true, align: "center" });

  addText(slide, "→", 5.02, 2.6, 0.72, 0.72, 30, C.blue, { bold: true, align: "center" });

  shape(slide, pptx.ShapeType.roundRect, 5.93, 1.92, 6.73, 2.16, C.navy);
  pill(slide, "ПОСЛЕ ВНЕДРЕНИЯ", 6.24, 2.18, 1.56, C.cyan, "193C43");
  shape(slide, pptx.ShapeType.roundRect, 6.29, 2.75, 2.05, 0.72, C.dark3);
  addText(slide, "Чаты", 6.29, 2.88, 2.05, 0.32, 11, C.darkText, { bold: true, align: "center" });
  shape(slide, pptx.ShapeType.roundRect, 8.55, 2.75, 1.65, 0.72, "20424A");
  addText(slide, "Файлы", 8.55, 2.88, 1.65, 0.32, 11, C.cyanSoft, { bold: true, align: "center" });
  shape(slide, pptx.ShapeType.roundRect, 10.42, 2.75, 1.86, 0.72, "30365A");
  addText(slide, "Объявления", 10.42, 2.88, 1.86, 0.32, 10.5, "E8E1FA", { bold: true, align: "center" });
  addText(slide, "Все связано общей историей и поиском", 6.35, 3.62, 5.75, 0.25, 10.2, C.darkMuted, { bold: true, align: "center" });

  const benefits = [
    ["01", "Быстрее координация", "Нужные коллеги и обсуждения доступны в одном месте.", C.blue, C.blueSoft],
    ["02", "Меньше потерь", "Файлы, сообщения и решения сохраняют общий контекст.", C.cyan, C.cyanSoft],
    ["03", "Адресные объявления", "Информацию можно направлять нужной группе сотрудников.", C.amber, C.amberSoft],
    ["04", "Данные внутри УСЗН", "Доступ определяется служебными ролями и подразделениями.", C.green, C.greenSoft],
  ];
  benefits.forEach((b, i) => {
    const x = 0.67 + i * 3.06;
    shape(slide, pptx.ShapeType.roundRect, x, 4.46, 2.78, 1.64, C.paper, C.line, { lineTransparency: 0 });
    shape(slide, pptx.ShapeType.roundRect, x + 0.2, 4.66, 0.46, 0.46, b[4]);
    addText(slide, b[0], x + 0.2, 4.68, 0.46, 0.39, 8.3, b[3], { bold: true, align: "center" });
    addText(slide, b[1], x + 0.79, 4.64, 1.75, 0.43, 11.5, C.ink, { bold: true });
    addText(slide, b[2], x + 0.2, 5.25, 2.38, 0.58, 8.7, C.muted, { valign: "top" });
  });
  shape(slide, pptx.ShapeType.roundRect, 0.67, 6.39, 12.0, 0.45, C.blueSoft);
  addText(slide, "Показатели эффекта будут определены до запуска и оценены после внедрения системы.", 0.95, 6.46, 11.45, 0.28, 10, C.blueDark, { bold: true, align: "center" });
}

// 6. Decision
{
  const slide = pptx.addSlide();
  slide.background = { color: C.dark };
  shape(slide, pptx.ShapeType.rect, 0, 0, 0.12, 7.5, C.blue);
  pill(slide, "РЕШЕНИЕ РУКОВОДСТВА", 0.76, 0.65, 2.02, C.cyan, "183941");
  addText(slide, "Предлагается поддержать", 0.76, 1.35, 7.3, 0.66, 30, C.paper, { bold: true });
  addText(slide, "создание и внедрение системы коммуникации УСЗН", 0.76, 2.05, 8.3, 1.18, 24, C.darkText, { bold: true, valign: "top" });
  addText(slide, "Результат проекта — действующая система, которой сотрудники пользуются для рабочих сообщений, объявлений и обмена материалами.", 0.78, 3.43, 7.75, 0.92, 13.4, C.darkMuted, { valign: "top" });

  const actions = [
    ["1", "Принять принципиальное решение о внедрении"],
    ["2", "Назначить руководителя-заказчика и ответственных"],
    ["3", "Определить подразделения и сотрудников для участия в проекте"],
  ];
  actions.forEach((a, i) => {
    const y = 4.78 + i * 0.62;
    shape(slide, pptx.ShapeType.ellipse, 0.79, y, 0.36, 0.36, i === 0 ? C.blue : C.dark3);
    addText(slide, a[0], 0.79, y + 0.01, 0.36, 0.3, 8, C.paper, { bold: true, align: "center" });
    addText(slide, a[1], 1.34, y, 6.9, 0.37, 11.3, C.darkText, { bold: i === 0 });
  });

  shape(slide, pptx.ShapeType.roundRect, 9.17, 1.32, 3.2, 4.92, "202A40", "33415F", { lineTransparency: 0 });
  addText(slide, "ЦЕЛЕВОЙ РЕЗУЛЬТАТ", 9.49, 1.72, 2.56, 0.28, 8.7, C.cyan, { bold: true, charSpacing: 1.1 });
  addText(slide, "Одна система\nдля внутренних\nкоммуникаций", 9.49, 2.28, 2.42, 1.45, 21, C.paper, { bold: true, valign: "top" });
  line(slide, 9.49, 4.02, 2.35, 0, "43506A", 0.8);
  checkItem(slide, "Сотрудники подключены", 9.49, 4.36, 2.38, C.green);
  checkItem(slide, "Основные сценарии работают", 9.49, 4.9, 2.38, C.green);
  checkItem(slide, "Рабочее общение перенесено", 9.49, 5.44, 2.38, C.green);
  addText(slide, "Система коммуникации УСЗН", 0.78, 7.04, 3.3, 0.2, 8, C.darkMuted, { charSpacing: 0.5 });
}

(async () => {
  await pptx.writeFile({ fileName: OUT });
  console.log(`Presentation written: ${OUT}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

