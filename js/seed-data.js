// js/seed-data.js
// 123 historical records — Optra 2010–2026 — ~214,734 EGP total
// KM stored in thousands: 61 = 61,000 km

const SEED_DATA = [
  // ─── 2010 ───────────────────────────────────────────────────────────
  { id:"seed_001", date:"2010-09-25", item:"مساعدين",                    price:2000, km:61,  category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_002", date:"2010-10-12", item:"زيت + فلتر",                 price:150,  km:63,  category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_003", date:"2010-11-20", item:"فرامل أمامية",               price:450,  km:65,  category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_004", date:"2010-12-08", item:"بطارية",                     price:350,  km:67,  category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_005", date:"2010-12-29", item:"صيانة عامة",                 price:200,  km:68,  category:"General Service",comment:"", source:"imported" },

  // ─── 2011 ───────────────────────────────────────────────────────────
  { id:"seed_006", date:"2011-01-15", item:"زيت + فلتر",                 price:150,  km:70,  category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_007", date:"2011-03-10", item:"تيل عجل ×2",                 price:1200, km:72,  category:"Tires",          comment:"", source:"imported" },
  { id:"seed_008", date:"2011-05-22", item:"بوجيهات",                    price:250,  km:75,  category:"Engine",         comment:"", source:"imported" },
  { id:"seed_009", date:"2011-07-08", item:"زيت + فلتر",                 price:170,  km:77,  category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_010", date:"2011-08-15", item:"تنظيف ريدياتير",             price:200,  km:79,  category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_011", date:"2011-09-20", item:"كوبلن أمامي",                price:800,  km:82,  category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_012", date:"2011-11-05", item:"فرامل خلفية",                price:500,  km:85,  category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_013", date:"2011-12-18", item:"زيت + فلتر",                 price:180,  km:87,  category:"Oil Change",     comment:"", source:"imported" },

  // ─── 2012 ───────────────────────────────────────────────────────────
  { id:"seed_014", date:"2012-01-25", item:"سير توقيت",                  price:1200, km:89,  category:"Engine",         comment:"", source:"imported" },
  { id:"seed_015", date:"2012-03-14", item:"زيت + فلتر",                 price:190,  km:91,  category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_016", date:"2012-05-02", item:"تكيف - شحن فريون",           price:300,  km:93,  category:"AC",             comment:"", source:"imported" },
  { id:"seed_017", date:"2012-06-20", item:"زيت + فلتر",                 price:200,  km:95,  category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_018", date:"2012-08-10", item:"طرمبة مياه",                 price:800,  km:98,  category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_019", date:"2012-09-25", item:"صيانة 95 ألف",               price:350,  km:99,  category:"General Service",comment:"", source:"imported" },
  { id:"seed_020", date:"2012-11-12", item:"زيت + فلتر",                 price:200,  km:101, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_021", date:"2012-12-28", item:"دريكسيون - باور",            price:1200, km:103, category:"Gearbox",        comment:"", source:"imported" },

  // ─── 2013 ───────────────────────────────────────────────────────────
  { id:"seed_022", date:"2013-02-10", item:"زيت + فلتر",                 price:200,  km:105, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_023", date:"2013-03-25", item:"مساعدين أمامي",              price:1500, km:108, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_024", date:"2013-05-15", item:"بطارية جديدة",               price:450,  km:110, category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_025", date:"2013-07-08", item:"زيت + فلتر",                 price:210,  km:112, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_026", date:"2013-08-20", item:"فرامل خلفية",                price:600,  km:115, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_027", date:"2013-09-30", item:"زجاج أمامي - استبدال",       price:1200, km:117, category:"Body & Glass",   comment:"", source:"imported" },
  { id:"seed_028", date:"2013-11-15", item:"زيت + فلتر",                 price:220,  km:119, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_029", date:"2013-12-20", item:"فلتر هواء + صيانة",          price:400,  km:121, category:"General Service",comment:"", source:"imported" },

  // ─── 2014 ───────────────────────────────────────────────────────────
  { id:"seed_030", date:"2014-01-28", item:"زيت + فلتر",                 price:230,  km:123, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_031", date:"2014-03-12", item:"تيل عجل ×4 + موازنة",        price:2500, km:125, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_032", date:"2014-05-08", item:"كمبريسور تكييف",             price:1800, km:129, category:"AC",             comment:"", source:"imported" },
  { id:"seed_033", date:"2014-06-25", item:"زيت + فلتر",                 price:240,  km:131, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_034", date:"2014-08-14", item:"بارات + طنابير",             price:1200, km:134, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_035", date:"2014-09-30", item:"حساس أكسجين",                price:800,  km:137, category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_036", date:"2014-11-08", item:"زيت + فلتر",                 price:250,  km:140, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_037", date:"2014-12-20", item:"تنظيف حقن بنزين",            price:400,  km:142, category:"Engine",         comment:"", source:"imported" },

  // ─── 2015 ───────────────────────────────────────────────────────────
  { id:"seed_038", date:"2015-01-15", item:"زيت + فلتر",                 price:270,  km:144, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_039", date:"2015-03-05", item:"فرامل أمامية + خلفية",       price:1200, km:146, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_040", date:"2015-04-20", item:"ريدياتير - استبدال",          price:1500, km:149, category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_041", date:"2015-06-12", item:"زيت + فلتر",                 price:280,  km:151, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_042", date:"2015-07-28", item:"بوجيهات + كابلات",           price:700,  km:154, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_043", date:"2015-09-10", item:"باب خلفي - سمكرة",           price:1200, km:157, category:"Body & Glass",   comment:"", source:"imported" },
  { id:"seed_044", date:"2015-11-02", item:"زيت + فلتر",                 price:290,  km:160, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_045", date:"2015-12-15", item:"صيانة 155 ألف",              price:800,  km:162, category:"General Service",comment:"", source:"imported" },

  // ─── 2016 ───────────────────────────────────────────────────────────
  { id:"seed_046", date:"2016-01-25", item:"زيت + فلتر",                 price:300,  km:164, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_047", date:"2016-03-18", item:"مساعدين خلفي",               price:1500, km:167, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_048", date:"2016-05-10", item:"تكيف - شحن + صيانة",         price:700,  km:170, category:"AC",             comment:"", source:"imported" },
  { id:"seed_049", date:"2016-07-08", item:"زيت + فلتر",                 price:320,  km:172, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_050", date:"2016-08-22", item:"فتيس - تصليح",               price:2500, km:176, category:"Gearbox",        comment:"", source:"imported" },
  { id:"seed_051", date:"2016-10-15", item:"بطارية جديدة",               price:700,  km:180, category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_052", date:"2016-12-05", item:"زيت + فلتر",                 price:350,  km:183, category:"Oil Change",     comment:"", source:"imported" },

  // ─── 2017 ───────────────────────────────────────────────────────────
  { id:"seed_053", date:"2017-01-20", item:"تيل عجل ×4 + زوايا",         price:3000, km:185, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_054", date:"2017-03-08", item:"زيت + فلتر",                 price:380,  km:187, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_055", date:"2017-05-15", item:"فلتر بنزين + بوجيهات",       price:900,  km:190, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_056", date:"2017-07-02", item:"زيت + فلتر",                 price:400,  km:193, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_057", date:"2017-08-18", item:"سمكرة + دوكو جزئي",          price:2000, km:196, category:"Body & Glass",   comment:"", source:"imported" },
  { id:"seed_058", date:"2017-10-05", item:"طرمبة مياه - استبدال",        price:1200, km:200, category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_059", date:"2017-11-22", item:"زيت + فلتر",                 price:420,  km:202, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_060", date:"2017-12-30", item:"صيانة 200 ألف",              price:1000, km:204, category:"General Service",comment:"", source:"imported" },

  // ─── 2018 ───────────────────────────────────────────────────────────
  { id:"seed_061", date:"2018-02-08", item:"زيت + فلتر",                 price:450,  km:206, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_062", date:"2018-03-25", item:"كوبلن أمامي + خلفي",         price:1800, km:209, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_063", date:"2018-05-14", item:"فرامل + أقمشة",              price:1200, km:212, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_064", date:"2018-07-02", item:"زيت + فلتر",                 price:480,  km:215, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_065", date:"2018-08-20", item:"حساس كرنك - استبدال",        price:1000, km:218, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_066", date:"2018-10-08", item:"تكيف - كمبريسور",            price:3000, km:221, category:"AC",             comment:"", source:"imported" },
  { id:"seed_067", date:"2018-11-25", item:"زيت + فلتر",                 price:500,  km:224, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_068", date:"2018-12-28", item:"كهرباء - كنترول",            price:1500, km:227, category:"Electrical",     comment:"", source:"imported" },

  // ─── 2019 ───────────────────────────────────────────────────────────
  { id:"seed_069", date:"2019-01-15", item:"زيت + فلتر",                 price:530,  km:229, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_070", date:"2019-03-05", item:"تيل عجل ×4 + موازنة + زوايا",price:4500, km:232, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_071", date:"2019-04-22", item:"زيت + فلتر",                 price:550,  km:235, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_072", date:"2019-06-10", item:"ريدياتير + قربة مياه",        price:2500, km:238, category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_073", date:"2019-07-28", item:"صيانة 235 ألف",              price:1200, km:240, category:"General Service",comment:"", source:"imported" },
  { id:"seed_074", date:"2019-09-12", item:"زيت + فلتر",                 price:570,  km:243, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_075", date:"2019-10-30", item:"سير توقيت + رولمانات",        price:3500, km:246, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_076", date:"2019-12-15", item:"زيت + فلتر",                 price:590,  km:249, category:"Oil Change",     comment:"", source:"imported" },

  // ─── 2020 ───────────────────────────────────────────────────────────
  { id:"seed_077", date:"2020-02-05", item:"بطارية جديدة",               price:1200, km:251, category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_078", date:"2020-04-20", item:"زيت + فلتر",                 price:620,  km:253, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_079", date:"2020-07-15", item:"فرامل شاملة",                price:1800, km:257, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_080", date:"2020-09-08", item:"مساعدين أمامي",              price:2800, km:260, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_081", date:"2020-10-25", item:"زيت + فلتر",                 price:650,  km:264, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_082", date:"2020-12-10", item:"صيانة 260 ألف",              price:1500, km:266, category:"General Service",comment:"", source:"imported" },

  // ─── 2021 ───────────────────────────────────────────────────────────
  { id:"seed_083", date:"2021-01-20", item:"زيت + فلتر",                 price:700,  km:268, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_084", date:"2021-03-08", item:"تيل عجل ×4 + موازنة + زوايا",price:6500, km:271, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_085", date:"2021-05-15", item:"تكيف - كمبريسور + شحن",      price:4000, km:274, category:"AC",             comment:"", source:"imported" },
  { id:"seed_086", date:"2021-07-02", item:"زيت + فلتر",                 price:750,  km:277, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_087", date:"2021-08-18", item:"فتيس - تصليح شامل",          price:5000, km:280, category:"Gearbox",        comment:"", source:"imported" },
  { id:"seed_088", date:"2021-10-05", item:"زيت + فلتر",                 price:800,  km:283, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_089", date:"2021-11-22", item:"دوكو - صبغة جزئية",          price:3500, km:286, category:"Body & Glass",   comment:"", source:"imported" },
  { id:"seed_090", date:"2021-12-28", item:"صيانة 285 ألف",              price:2000, km:288, category:"General Service",comment:"", source:"imported" },

  // ─── 2022 ───────────────────────────────────────────────────────────
  { id:"seed_091", date:"2022-01-15", item:"زيت + فلتر",                 price:850,  km:290, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_092", date:"2022-03-05", item:"بوجيهات + كويل إشعال",       price:3000, km:293, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_093", date:"2022-04-22", item:"زيت + فلتر",                 price:900,  km:296, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_094", date:"2022-06-10", item:"ريدياتير - استبدال",          price:3500, km:299, category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_095", date:"2022-08-01", item:"فرامل شاملة - 4 عجلات",      price:3000, km:303, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_096", date:"2022-09-18", item:"زيت + فلتر",                 price:950,  km:307, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_097", date:"2022-11-05", item:"بطارية جديدة",               price:2000, km:311, category:"Electrical",     comment:"", source:"imported" },
  { id:"seed_098", date:"2022-12-20", item:"مساعدين خلفي",               price:4000, km:315, category:"Suspension",     comment:"", source:"imported" },

  // ─── 2023 ───────────────────────────────────────────────────────────
  { id:"seed_099", date:"2023-01-12", item:"زيت + فلتر",                 price:1500, km:317, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_100", date:"2023-03-01", item:"تيل عجل ×4 + زوايا + موازنة",price:9500, km:320, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_101", date:"2023-04-18", item:"زيت + فلتر",                 price:1500, km:323, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_102", date:"2023-06-05", item:"سمكرة + دوكو",               price:4000, km:326, category:"Body & Glass",   comment:"", source:"imported" },
  { id:"seed_103", date:"2023-07-22", item:"تكيف - كمبريسور",            price:6000, km:329, category:"AC",             comment:"", source:"imported" },
  { id:"seed_104", date:"2023-09-08", item:"زيت + فلتر",                 price:1600, km:332, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_105", date:"2023-10-25", item:"صيانة 330 ألف شاملة",        price:3000, km:335, category:"General Service",comment:"", source:"imported" },
  { id:"seed_106", date:"2023-12-10", item:"كهرباء - حساس + تصليح",      price:2500, km:339, category:"Electrical",     comment:"", source:"imported" },

  // ─── 2024 ───────────────────────────────────────────────────────────
  { id:"seed_107", date:"2024-01-08", item:"زيت + فلتر",                 price:2000, km:341, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_108", date:"2024-03-05", item:"فرامل شاملة",                price:4000, km:344, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_109", date:"2024-04-22", item:"زيت + فلتر",                 price:2000, km:347, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_110", date:"2024-06-10", item:"بوجيهات + فلتر بنزين",       price:3500, km:350, category:"Engine",         comment:"", source:"imported" },
  { id:"seed_111", date:"2024-08-01", item:"ريدياتير + طرمبة مياه",       price:6500, km:354, category:"Cooling",        comment:"", source:"imported" },
  { id:"seed_112", date:"2024-09-18", item:"زيت + فلتر",                 price:2200, km:358, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_113", date:"2024-11-05", item:"تيل عجل ×2 + زوايا",         price:5500, km:362, category:"Tires",          comment:"", source:"imported" },

  // ─── 2025 ───────────────────────────────────────────────────────────
  { id:"seed_114", date:"2025-01-08", item:"زيت + فلتر",                 price:2500, km:366, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_115", date:"2025-02-20", item:"مساعدين كاملة (4)",           price:7000, km:368, category:"Suspension",     comment:"", source:"imported" },
  { id:"seed_116", date:"2025-04-10", item:"تكيف - صيانة + فريون",        price:3000, km:371, category:"AC",             comment:"", source:"imported" },
  { id:"seed_117", date:"2025-06-05", item:"زيت + فلتر",                 price:2500, km:374, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_118", date:"2025-08-20", item:"بطارية + داينمو",             price:5000, km:377, category:"Electrical",     comment:"", source:"imported" },

  // ─── 2026 ───────────────────────────────────────────────────────────
  { id:"seed_119", date:"2026-01-10", item:"زيت + فلتر",                 price:3000, km:395, category:"Oil Change",     comment:"", source:"imported" },
  { id:"seed_120", date:"2026-01-28", item:"تيل عجل ×2",                 price:7500, km:397, category:"Tires",          comment:"", source:"imported" },
  { id:"seed_121", date:"2026-02-15", item:"فرامل أمامية",               price:4500, km:403, category:"Brakes",         comment:"", source:"imported" },
  { id:"seed_122", date:"2026-03-10", item:"صيانة + فلتر هواء",          price:3500, km:410, category:"General Service",comment:"", source:"imported" },
  { id:"seed_123", date:"2026-04-05", item:"زيت + فلتر",                 price:3000, km:419, category:"Oil Change",     comment:"", source:"imported" }
];

export default SEED_DATA;
