# csernyesuli.github.io
# 7. osztály kódja / MINTA

Itt látható a forráskódja:

```html
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zrínyi Ilona Matematikaverseny - 7. Osztály (2019/2020)</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- EmailJS SDK -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
    <!-- MathJax a törtekhez -->
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script type="text/javascript">
        (function() {
            emailjs.init("hsRvek-Jff5scNP1B");
        })();
    </script>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
            -webkit-user-select: none;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%);
            color: #f8fafc;
            min-height: 100vh;
            padding-bottom: 40px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            text-align: center;
            margin-bottom: 25px;
        }

        .back-link {
            color: #fbbf24;
            text-decoration: none;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 10px;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        h1 {
            color: #fbbf24;
            font-size: 28px;
            margin-bottom: 8px;
        }

        .subtitle {
            color: #cbd5e1;
            font-size: 14px;
            margin-bottom: 15px;
        }

        .user-bar {
            display: inline-flex;
            gap: 15px;
            background: rgba(30, 27, 75, 0.8);
            border: 1px solid rgba(251, 191, 36, 0.3);
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: center;
        }

        .stat-correct { color: #4ade80; font-weight: bold; }
        .stat-failed { color: #f87171; font-weight: bold; }

        .pagination-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
            background: rgba(15, 23, 42, 0.6);
            padding: 10px 15px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            flex-wrap: wrap;
            gap: 10px;
        }

        .btn {
            background: #f59e0b;
            color: #0f172a;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }

        .btn:hover { background: #d97706; }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-check {
            background: #22c55e;
            color: #fff;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
        }
        .btn-check:hover { background: #16a34a; }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }

        .btn-secondary:hover { background: rgba(255, 255, 255, 0.2); }

        .page-card {
            background: rgba(30, 27, 75, 0.7);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 16px;
            padding: 25px;
            backdrop-filter: blur(10px);
            min-height: 400px;
        }

        .hidden { display: none !important; }

        .task-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .task-item {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s;
        }

        .task-item:hover {
            border-color: #fbbf24;
            transform: translateY(-2px);
        }

        .task-badge {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: rgba(251, 191, 36, 0.2);
            color: #fbbf24;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 12px;
        }

        .task-status {
            font-size: 12px;
            color: #94a3b8;
        }

        .task-status.correct { color: #4ade80; font-weight: bold; }
        .task-status.failed { color: #f87171; font-weight: bold; }

        .modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 15px;
        }

        .modal-body {
            background: #1e1b4b;
            border: 1px solid #fbbf24;
            border-radius: 16px;
            max-width: 650px;
            width: 100%;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .modal-header {
            padding: 15px 20px;
            background: #0f172a;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
        }

        .modal-nav-group {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .btn-modal-nav {
            background: rgba(30, 27, 75, 0.9);
            color: #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.4);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-modal-nav:hover {
            background: rgba(251, 191, 36, 0.2);
            border-color: #fbbf24;
        }

        .modal-content {
            padding: 20px;
            overflow-y: auto;
            flex: 1;
        }

        .modal-footer {
            padding: 15px 20px;
            background: #0f172a;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
        }

        .task-image-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px dashed rgba(251, 191, 36, 0.4);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            margin-bottom: 15px;
        }

        .task-image-box img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
        }

        .option-item {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            margin-bottom: 10px;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #fff;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
        }

        .option-item:hover {
            border-color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
        }

        .option-item.selected {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.2);
        }

        .option-item.status-correct {
            background: rgba(34, 197, 94, 0.25) !important;
            border-color: #22c55e !important;
            color: #4ade80 !important;
        }

        .option-icon {
            margin-left: auto;
            font-size: 16px;
        }

        .option-img {
            max-width: 120px;
            height: auto;
            border-radius: 4px;
            margin-left: 10px;
        }

        .feedback-box {
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            font-size: 14px;
        }

        .feedback-correct { background: rgba(74, 222, 128, 0.2); border: 1px solid #4ade80; color: #4ade80; }
        .feedback-failed { background: rgba(248, 113, 113, 0.2); border: 1px solid #f87171; color: #f87171; }
    </style>
</head>
<body oncontextmenu="return false;">

    <!-- Névbekérő Modal -->
    <div id="welcome-modal" class="modal-overlay">
        <div class="modal-body" style="padding: 25px; text-align: center; max-width: 500px;">
            <i class="fa-solid fa-graduation-cap" style="font-size: 40px; color: #fbbf24; margin-bottom: 15px;"></i>
            <h2 style="color: #fbbf24; margin-bottom: 10px;">Zrínyi Ilona Matematikaverseny</h2>
            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px;">7. osztályos megyei forduló (2019/2020)</p>

            <div style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 8px; text-align: left; font-size: 13px; color: #cbd5e1; margin-bottom: 20px;">
                <p style="margin-bottom: 8px;"><i class="fa-solid fa-clock-rotate-left" style="color: #fbbf24;"></i> <strong>Tájékoztatás:</strong> Nem kell egyszerre minden feladatot megcsinálnod, később is visszajöhetsz és folytathatod!</p>
                <p style="margin-bottom: 8px;"><i class="fa-solid fa-paper-plane" style="color: #fbbf24;"></i> A feladatok ablakának bezárásakor az eddigi eredmények automatikusan elküldésre kerülnek a csernyei.iskola@gmail.com címre.</p>
                <p><i class="fa-solid fa-rotate-right" style="color: #fbbf24;"></i> Helytelen válasz esetén legfeljebb 5 alkalommal próbálkozhatsz.</p>
            </div>

            <input type="text" id="student-name" placeholder="Add meg a neved..." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; margin-bottom: 15px;">
            <button onclick="startQuiz()" class="btn" style="width: 100%;">Indítás</button>
        </div>
    </div>

    <!-- Fő tartalom -->
    <div class="container">
        <header>
            <a href="index.html" class="back-link"><i class="fa-solid fa-house"></i> Vissza a Csernyesuli Főoldalra</a>
            <h1>Zrínyi Ilona Matematikaverseny</h1>
            <p class="subtitle">7. osztályos megyei forduló (2019/2020)</p>
            
            <div class="user-bar">
                <span><i class="fa-solid fa-user" style="color: #fbbf24;"></i> Tanuló: <strong id="user-display">-</strong></span>
                <span>|</span>
                <span>Helyes: <span id="stat-c" class="stat-correct">0</span></span>
                <span>|</span>
                <span>Sikertelen: <span id="stat-f" class="stat-failed">0</span></span>
            </div>
        </header>

        <!-- Lapozó Top -->
        <div class="pagination-bar">
            <button onclick="changePage(-1)" id="prev-btn" class="btn btn-secondary"><i class="fa-solid fa-chevron-left"></i> Előző oldal</button>
            <span>Oldal: <strong id="page-num" style="color: #fbbf24;">1</strong> / 4</span>
            <button onclick="changePage(1)" id="next-btn" class="btn btn-secondary">Következő oldal <i class="fa-solid fa-chevron-right"></i></button>
        </div>

        <!-- 1. OLDAL: Címlap -->
        <div id="page-1" class="page-card" style="text-align: center;">
            <h2 style="color: #fbbf24; margin-bottom: 15px;">Címlap & Versenyszabályzat</h2>
            <p style="margin-bottom: 20px; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                Üdvözöljük a Zrínyi Ilona Matematikaverseny 7. osztályos interaktív feladatlapján!<br>
                <strong>Nem kell egyszerre minden feladatot megcsinálnod, bármikor visszajöhetsz és folytathatod!</strong><br><br>
                Válaszd ki a kívánt válaszlehetőséget, majd nyomd meg az <strong>Ellenőrzés</strong> gombot!<br>
                A feladatok ablakának bezárásakor az eredmények automatikusan elküldésre kerülnek a tanárnak.
            </p>
            <button onclick="changePage(1)" class="btn">Kezdés (2. oldal) <i class="fa-solid fa-arrow-right"></i></button>
        </div>

        <!-- 2. OLDAL: 1-11 -->
        <div id="page-2" class="page-card hidden">
            <h3 style="color: #fbbf24; margin-bottom: 10px;">1. – 11. Feladatok</h3>
            <div id="grid-1" class="task-grid"></div>
        </div>

        <!-- 3. OLDAL: 12-22 -->
        <div id="page-3" class="page-card hidden">
            <h3 style="color: #fbbf24; margin-bottom: 10px;">12. – 22. Feladatok</h3>
            <div id="grid-2" class="task-grid"></div>
        </div>

        <!-- 4. OLDAL: 23-30 -->
        <div id="page-4" class="page-card hidden">
            <h3 style="color: #fbbf24; margin-bottom: 10px;">23. – 30. Feladatok</h3>
            <div id="grid-3" class="task-grid"></div>
        </div>
    </div>

    <!-- LEBEGŐ ABLAK (MODAL) A FELADATOKHOZ -->
    <div id="task-modal" class="modal-overlay hidden">
        <div class="modal-body">
            <div class="modal-header">
                <div>
                    <h3 id="modal-title" style="color: #fbbf24;">Feladat</h3>
                    <div id="modal-attempts" style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">Próbálkozások: 0 / 5</div>
                </div>
                <!-- Fejlécbe áthelyezett navigációs gombok -->
                <div class="modal-nav-group">
                    <button onclick="navigateTask(-1)" class="btn-modal-nav"><i class="fa-solid fa-chevron-left mr-1"></i> Előző</button>
                    <button onclick="navigateTask(1)" class="btn-modal-nav">Következő <i class="fa-solid fa-chevron-right ml-1"></i></button>
                </div>
                <i class="fa-solid fa-xmark" onclick="askClose()" style="cursor: pointer; font-size: 20px; color: #cbd5e1;"></i>
            </div>
            <div class="modal-content" id="modal-content-box">
                <div id="modal-image-container"></div>
                <div id="modal-text" style="margin-bottom: 20px; font-size: 15px; line-height: 1.5; color: #e2e8f0;"></div>
                <div id="modal-options"></div>
                <div id="modal-feedback" class="feedback-box hidden"></div>
            </div>
            <div class="modal-footer">
                <button onclick="revealSolution()" class="btn btn-secondary">Megoldás megmutatása</button>
                <button onclick="checkAnswer()" id="check-btn" class="btn-check"><i class="fa-solid fa-check mr-1"></i> Ellenőrzés</button>
                <button onclick="askClose()" class="btn">Bezárás</button>
            </div>
        </div>
    </div>

    <!-- MÁSODIK LEBEGŐ ABLAK: HELYTELEN VÁLASZ FIGYELMEZTETŐ -->
    <div id="wrong-modal" class="modal-overlay hidden" style="z-index: 1100;">
        <div class="modal-body" style="padding: 25px; text-align: center; max-width: 450px; border-color: #ef4444;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 45px; color: #f87171; margin-bottom: 15px;"></i>
            <h2 style="color: #f87171; margin-bottom: 10px;">Helytelen válasz!</h2>
            <p id="wrong-modal-text" style="font-size: 14px; color: #cbd5e1; margin-bottom: 25px; line-height: 1.5;">
                A kiválasztott válasz nem helyes. Próbáld újra, vagy fejezd be a feladatot!
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="continueRetry()" class="btn-check" style="background: #3b82f6;"><i class="fa-solid fa-rotate-right mr-1"></i> Próbáld újra</button>
                <button onclick="finishTaskFailed()" class="btn" style="background: #ef4444; color: #fff;"><i class="fa-solid fa-flag-checkered mr-1"></i> Befejezés</button>
            </div>
        </div>
    </div>

    <!-- ÉRTESÍTŐ MODAL A SIKERES BEKÜLDÉSRŐL -->
    <div id="email-sent-modal" class="modal-overlay hidden" style="z-index: 1200;">
        <div class="modal-body" style="padding: 25px; text-align: center; max-width: 450px; border-color: #22c55e;">
            <i class="fa-solid fa-circle-check" style="font-size: 45px; color: #4ade80; margin-bottom: 15px;"></i>
            <h2 style="color: #4ade80; margin-bottom: 10px;">Eredmények elküldve!</h2>
            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 25px; line-height: 1.5;">
                Az eredmények automatikusan elküldve a <strong>csernyei.iskola@gmail.com</strong> címre.
            </p>
            <button onclick="document.getElementById('email-sent-modal').classList.add('hidden')" class="btn-check" style="width: 100%;">Rendben</button>
        </div>
    </div>

    <script>
        // Hivatalos 2020-as Megyei forduló 7. évfolyamos megoldókulcs
        const keys = {
            1:'C', 2:'E', 3:'D', 4:'C', 5:'B',
            6:'D', 7:'D', 8:'B', 9:'B', 10:'D',
            11:'E', 12:'C', 13:'B', 14:'C', 15:'C',
            16:'A', 17:'D', 18:'C', 19:'D', 20:'C',
            21:'C', 22:'A', 23:'D', 24:'B', 25:'A',
            26:'C', 27:'B', 28:'C', 29:'C', 30:'D'
        };

        const tasks = {
            1: { text: "Juditnak öt olyan könyve van, amelynek a címében szerepel egy szám (lásd ábra). Ha a címekben szereplő öt számot összeadjuk, akkor azt a számot kapjuk eredményül, amely szerepel Zsófi könyvének a címében. Mi Zsófi könyvének a címe?", options: { A: "A két Lotti", B: "101 kiskutya", C: "77 magyar népmese", D: "80 nap alatt a Föld körül", E: "Gombos Jim és a Rettegett 13" }, img: "img-zrinyi2020/zrinyi2020task-1.png" },
            2: { text: "Mennyi a 2020 legnagyobb és legkisebb pozitív osztójának összege?", options: { A: "1010", B: "1012", C: "2019", D: "2020", E: "2021" } },
            3: { text: "Peti az EKEELCMSLKCES betűsorban minden második betűt összeolvasott. Melyik szót kapta?", options: { A: "KEVÉS", B: "KECSES", C: "KERGE", D: "KECSKE", E: "KELLEMES" } },
            4: { text: "Mennyivel van több lába összesen 1 kacsának és 2 kutyának, mint ahány fejük van összesen?", options: { A: "3", B: "6", C: "7", D: "9", E: "5" } },
            5: { text: "Mennyi a (20-19) - (20-20) · (20-21) műveletsor eredménye?", options: { A: "-1", B: "0", C: "1", D: "2", E: "3" } },
            6: { text: "Öt kisliba libasorban úszik a tóban (lásd ábra). Egyszer gondol egyet Uszi, lebukik a víz alá, és a sor végére úszik, majd Pici is lebukik a víz alá, és a sor elejére úszik. Hányadik a libasorban ezután Bukó?", options: { A: "1.", B: "2.", C: "3.", D: "4.", E: "5." }, img: "img-zrinyi2020/zrinyi2020task-6.png" },
            7: { text: "Manófalván 221 manó lakik, minden házban ugyanannyi. Több ház van Manófalván, mint ahányan egy házban laknak, és minden házban legalább 2 manó lakik. Hány ház van Manófalván?", options: { A: "7", B: "11", C: "13", D: "17", E: "19" } },
            8: { text: "Pityu reggel 7 óra előtt 20 perccel ébredt. Ezután 15 perc lustálkodás és még fél óra készülődés után elindult az iskolába. Mennyi volt ekkor a pontos idő?", options: { A: "7:15", B: "7:25", C: "7:35", D: "7:45", E: "7:55" } },
            9: { text: "Anna, Bea, Cili és Dóri egyszerre érnek reggel az iskola kapujához. Hány különböző sorrendben mehetnek be egymás után az iskola kapuján, ha Dóri előzékeny, és mindenkit maga elé enged?", options: { A: "4", B: "6", C: "12", D: "18", E: "24" } },
            10: { 
                text: "Az ábrán látható alakzat négy egyforma négyzetből áll. Karcsi két ilyen alakzatot kivágott papírból, és egymás mellé rakta azokat. Melyiket nem kaphatta?", 
                img: "img-zrinyi2020/zrinyi2020task-10.png",
                options: { A: "A alakzat", B: "B alakzat", C: "C alakzat", D: "D alakzat", E: "E alakzat" },
                optImgs: {
                    A: "img-zrinyi2020/zrinyi2020task-10-a.png",
                    B: "img-zrinyi2020/zrinyi2020task-10-b.png",
                    C: "img-zrinyi2020/zrinyi2020task-10-c.png",
                    D: "img-zrinyi2020/zrinyi2020task-10-d.png",
                    E: "img-zrinyi2020/zrinyi2020task-10-e.png"
                }
            },
            11: { 
                text: "A MÉZESKALÁCSORSZÁG betűkártyákból az ötödikes Júlia kirakott négy szót úgy, hogy a négy szóhoz minden kártyát felhasznált, és ezt a négy szót leírta egy lapra. Húga, a harmadikos Anna ugyanerre a lapra leírt egy szót, így a lapon most már öt szó van (lásd ábra). Melyik szót írta Anna a lapra?", 
                options: { A: "ACÉL", B: "KÁROS", C: "SZÁM", D: "SZEG", E: "ZSÁKOS" }, 
                img: "img-zrinyi2020/zrinyi2020task-11.png" 
            },
            12: { text: "A Mézga család TV előfizetési csomagjában 120 csatorna van. A csatornák 20%-án sportot, 30%-án zenét, 5%-án főzőműsorokat, a többi csatornán filmeket sugároznak. Hány csatornán sugároznak mesefilmeket, ha ezek száma a filmcsatornák számának a fele?", options: { A: "6", B: "24", C: "27", D: "34", E: "36" } },
            13: { text: "Hány olyan kör van az ábrán, amelyben és a mellette lévő két körben is prímszám látható?", options: { A: "4", B: "5", C: "6", D: "7", E: "8" }, img: "img-zrinyi2020/zrinyi2020task-13.png" },
            14: { text: "Egy cukrászdában két mignon és egy gombóc fagyi együtt 800 Ft-ba, míg három mignon és két gombóc fagyi együtt 1300 Ft-ba kerül. Hány forintot fizet Marci, ha csak egy mignont vásárol?", options: { A: "250", B: "270", C: "300", D: "320", E: "350" } },
            15: { 
                text: "Gombóc Artúr egy téglalap alakú csokoládét három téglalap alakú darabra vágott. Ezek közül a darabok közül kettő az ábrán látható. Melyik nem lehet a harmadik darab?", 
                options: { A: "A darab", B: "B darab", C: "C darab", D: "D darab", E: "E darab" }, 
                img: "img-zrinyi2020/zrinyi2020task-15.png",
                optImgs: {
                    A: "img-zrinyi2020/zrinyi2020task-15-a.png",
                    B: "img-zrinyi2020/zrinyi2020task-15-b.png",
                    C: "img-zrinyi2020/zrinyi2020task-15-c.png",
                    D: "img-zrinyi2020/zrinyi2020task-15-d.png",
                    E: "img-zrinyi2020/zrinyi2020task-15-e.png"
                }
            },
            16: { text: "A XXXII. Nyári Olimpiai Játékokat 2020-ban Tokióban bonyolítják le. Ebben az évben a Mategye Alapítvány a XXXI. Zrínyi Ilona Matematikaversenyt rendezi meg. A nyári olimpiai játékok négyévente, a Zrínyi Ilona Matematikaverseny évente kerül megrendezésre. Hányadik Zrínyi Ilona Matematikaversenyt bonyolították le a XXVII. Nyári Olimpiai Játékok rendezésének évében?", options: { A: "XI.", B: "XII.", C: "XXV.", D: "XXVI.", E: "XXVII." } },
            17: { text: "A 9834; 5123; 8072 és 9560 számok mindegyikére igaz, hogy mind a három másik számmal egy azonos számjegye van. Melyik az a szám, amelyiket az előző négy számhoz hozzávéve mind az öt számra teljesül, hogy mind a négy másik számmal egy azonos számjegye van?", options: { A: "1748", B: "2761", C: "4691", D: "6417", E: "7364" } },
            18: { text: "Az ábrán két számot megcserélünk úgy, hogy minden oszlopban és minden sorban ugyanannyi legyen a számok összege. A két szám közül az egyik a 9. Melyik a másik szám?", options: { A: "1", B: "2", C: "3", D: "4", E: "5" }, img: "img-zrinyi2020/zrinyi2020task-18.png" },
            19: { text: "Ha egy ötjegyű szám végére 1-est írunk, akkor egy olyan hatjegyű számot kapunk, ami háromszorosa annak a hatjegyű számnak, amit úgy kapnánk meg, ha az ötjegyű szám elejére írnánk az 1-est. Mi az utolsó számjegye az ötjegyű számnak?", options: { A: "1", B: "3", C: "5", D: "7", E: "9" } },
            20: { text: "Hány olyan pozitív egész szám van, amelynek a számjegyei prímszámok és a számjegyeinek szorzata 60?", options: { A: "6", B: "8", C: "12", D: "18", E: "végtelen sok" } },
            21: { text: "Egy háromszög két belső szögének szögfelezője 54°-os szöget zár be. Hány fokos a háromszög harmadik belső szöge?", options: { A: "54", B: "66", C: "72", D: "108", E: "126" } },
            22: { text: "Egy 1 cm oldalhosszúságú négyzet minden oldalának bejelöltük a harmadolópontjait. A nyolc harmadolópontból minden lehetséges módon kiválasztunk hármat, és kiszámoljuk az általuk meghatározott háromszög területét. Hány négyzetcentiméter az így kapott legkisebb terület?", options: { A: "$$\\frac{1}{18}$$", B: "$$\\frac{1}{12}$$", C: "$$\\frac{1}{9}$$", D: "$$\\frac{1}{6}$$", E: "$$\\frac{1}{4}$$" } },
            23: { text: "Az ábrán látható összeadásban az azonos betűk azonos, a különböző betűk nem biztos, hogy különböző számjegyeket jelölnek, és az összeg négyjegyű szám. Mennyi az A+P+U+K összeg lehetséges legnagyobb értéke?", options: { A: "10", B: "11", C: "18", D: "19", E: "27" }, img: "img-zrinyi2020/zrinyi2020task-23.png" },
            24: { text: "Egy versenyre háromfős csapatok jelentkezését várják. Fontos, hogy a csapattagok mind jóban legyenek egymással, mert a versenyen együtt kell majd működniük. A 7.b osztályból induló csapatban hatan szeretnének részt venni, Antal, Botond, Cili, Dani, Emil és Flóra. Az ábrán a gyerekeket pontokkal és nevük kezdőbetűivel ábrázoltuk. A vonalak azt mutatják, hogy közülük ki kivel van jóban. Hányféle lehet az osztályt képviselő háromfős csapat?", options: { A: "2", B: "3", C: "4", D: "6", E: "20" }, img: "img-zrinyi2020/zrinyi2020task-24.png" },
            25: { text: "Egy urnában piros, kék és zöld színű golyók vannak. A golyók közül 40 golyó kék vagy zöld, 30 golyó nem kék és kétszer annyi piros golyó van, mint zöld golyó. Hány golyó van összesen az urnában?", options: { A: "60", B: "70", C: "100", D: "120", E: "140" } },
            26: { text: "Négyen ülnek most Artúr király kerekasztala körül: Sir Lancelot, Sir Galahad, Sir Bedivere és Artúr király. Mindegyikükről tudjuk, hogy vagy mindig igazat mond, vagy mindig hazudik. Egy alkalommal a lovagok a következőket állították:\nSir Lancelot: „Nincs közöttünk igazmondó.”\nSir Galahad: „Közülünk legfeljebb ketten mondanak igazat.”\nSir Bedivere: „Artúr király soha nem mond igazat.”\nHány igazmondó van most Artúr király kerekasztala körül?", options: { A: "0", B: "1", C: "2", D: "3", E: "4" } },
            27: { text: "Az ábrán látható 4x4-es négyzetrács 16 fehér négyzete közül szürkére színezünk néhányat úgy, hogy a színezés után mind a 16 négyzetnek legyen olyan szomszédos négyzete, amely fehér. Hány négyzetet színezünk szürkére, ha azok száma a lehető legtöbb? (Két négyzet szomszédos, ha van közös oldaluk.)", options: { A: "8", B: "10", C: "12", D: "14", E: "16" }, img: "img-zrinyi2020/zrinyi2020task-27.png" },
            28: { text: "Bea csokrokat készít. Mindegyik csokor háromféle virágot tartalmaz. A csokrokhoz 20 szegfűt, 25 gerberát, 30 rózsát és 45 tulipánt használhat fel. Hány csokrot készít el Bea, ha azok száma a lehető legtöbb?", options: { A: "35", B: "36", C: "37", D: "38", E: "45" } },
            29: { text: "A feloldóminta érintőképernyők biztonsági kódjaként használatos. A feloldóminta az érintőképernyőn látható 9 pontból néhányat összekötő, egymáshoz csatlakozó szakaszokból álló vonal, amelyben számít az összekötés sorrendje. A feloldóminta vonala a megadott 9 pont mindegyikén csak egyszer haladhat áthaladni. Hány olyan feloldóminta állítható be, amelyik az ábra A pontjából indul, a B pontjában végződik, és közben a többi 7 pont közül kettőn halad át? (A 9 pont egy négyzetrács rácspontjai.)", options: { A: "12", B: "14", C: "16", D: "18", E: "Az előzőek közül egyik sem." }, img: "img-zrinyi2020/zrinyi2020task-29.png" },
            30: { text: "Hány különböző útvonal vezet az ábra A pontjából a B pontjába, ha egy útvonal a vonalakon lefelé, felfelé, jobbra vagy jobbra felfelé haladhat, és az ábra bármely szakaszán legfeljebb egyszer haladhat végig? (Két útvonal különböző, ha van olyan szakasz, amelyen az egyik áthalad, a másik nem.)", options: { A: "243", B: "256", C: "325", D: "343", E: "372" }, img: "img-zrinyi2020/zrinyi2020task-30.png" }
        };

        let activeUser = "";
        let page = 1;
        let currentTask = null;
        let taskData = {};
        let emailSent = false;

        for(let i=1; i<=30; i++) {
            taskData[i] = { status: 'unsolved', selected: null, wrongOpts: [], attempts: 0 };
        }

        function startQuiz() {
            const name = document.getElementById('student-name').value.trim();
            if(!name) return alert('Kérlek add meg a neved!');
            activeUser = name;
            document.getElementById('user-display').textContent = activeUser;
            document.getElementById('welcome-modal').classList.add('hidden');
            renderGrids();
        }

        function renderGrids() {
            for(let p=1; p<=3; p++) {
                const grid = document.getElementById(`grid-${p}`);
                grid.innerHTML = '';
                let start = (p===1)?1:(p===2)?12:23;
                let end = (p===1)?11:(p===2)?22:30;

                for(let i=start; i<=end; i++) {
                    const item = document.createElement('div');
                    item.className = 'task-item';
                    item.onclick = () => openTask(i);
                    
                    let statusText = "Megoldatlan";
                    let statusClass = "";
                    if(taskData[i].status === 'correct') {
                        statusText = "Helyes";
                        statusClass = "correct";
                    } else if(taskData[i].status === 'failed') {
                        statusText = "Sikertelen";
                        statusClass = "failed";
                    }

                    item.innerHTML = `
                        <div style="display:flex; align-items:center;">
                            <div class="task-badge">${i}</div>
                            <div>
                                <div style="font-weight:bold; font-size:14px;">Feladat #${i}</div>
                                <div class="task-status ${statusClass}">${statusText}</div>
                            </div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b;"></i>
                    `;
                    grid.appendChild(item);
                }
            }
        }

        function changePage(dir) {
            page += dir;
            if(page < 1) page = 1;
            if(page > 4) page = 4;
            
            for(let i=1; i<=4; i++) {
                document.getElementById(`page-${i}`).classList.add('hidden');
            }
            document.getElementById(`page-${page}`).classList.remove('hidden');
            document.getElementById('page-num').textContent = page;
            document.getElementById('prev-btn').disabled = (page === 1);
            document.getElementById('next-btn').disabled = (page === 4);
        }

        function openTask(id) {
            currentTask = id;
            document.getElementById('modal-title').textContent = `${id}. Feladat`;
            document.getElementById('modal-text').textContent = tasks[id].text;
            document.getElementById('modal-attempts').textContent = `Próbálkozások: ${taskData[id].attempts} / 5`;
            
            const imgContainer = document.getElementById('modal-image-container');
            if(tasks[id].img) {
                imgContainer.innerHTML = `
                    <div class="task-image-box">
                        <img src="${tasks[id].img}" alt="${id}. feladat ábrája" onerror="this.parentElement.innerHTML='<p style=\'font-size:13px; color:#fbbf24;\'><i class=\'fa-solid fa-image mr-1\'></i> Ezzel a feladattal ábra kapcsolatos.<br><span style=\'font-size:11px; color:#94a3b8;\'>Tedd be a képet ${tasks[id].img} néven a projekt mappájába.</span></p>'">
                    </div>
                `;
            } else {
                imgContainer.innerHTML = '';
            }

            renderOptions(id);

            const feedback = document.getElementById('modal-feedback');
            if(taskData[id].status === 'correct') {
                feedback.className = 'feedback-box feedback-correct';
                feedback.innerHTML = '<i class="fa-solid fa-check"></i> Ez a feladat már sikeresen meg van oldva!';
                document.getElementById('check-btn').disabled = true;
            } else if(taskData[id].status === 'failed') {
                feedback.className = 'feedback-box feedback-failed';
                feedback.innerHTML = '<i class="fa-solid fa-xmark"></i> Ez a feladat sikertelenként rögzítve.';
                document.getElementById('check-btn').disabled = true;
            } else {
                feedback.className = 'feedback-box hidden';
                document.getElementById('check-btn').disabled = false;
            }

            document.getElementById('task-modal').classList.remove('hidden');
            document.getElementById('modal-content-box').scrollTop = 0;
            
            if(window.MathJax) {
                MathJax.typeset();
            }
        }

        function navigateTask(direction) {
            let nextId = currentTask + direction;
            if(nextId >= 1 && nextId <= 30) {
                openTask(nextId);
            } else if(nextId < 1) {
                alert('Ez az első feladat!');
            } else {
                alert('Ez volt az utolsó feladat!');
            }
        }

        function renderOptions(id) {
            const optsContainer = document.getElementById('modal-options');
            optsContainer.innerHTML = '';

            ['A', 'B', 'C', 'D', 'E'].forEach(opt => {
                const item = document.createElement('div');
                item.className = 'option-item';
                
                let iconHtml = '';
                if(taskData[id].status === 'correct' && opt === keys[id]) {
                    item.classList.add('status-correct');
                    iconHtml = '<i class="fa-solid fa-check option-icon"></i>';
                } else if(taskData[id].selected === opt) {
                    item.classList.add('selected');
                }

                if(taskData[id].status === 'unsolved') {
                    item.onclick = () => {
                        taskData[id].selected = opt;
                        renderOptions(id);
                    };
                }

                let contentHtml = `<span><strong>${opt})</strong> ${tasks[id].options[opt]}</span>`;
                
                if(tasks[id].optImgs && tasks[id].optImgs[opt]) {
                    contentHtml += `<img src="${tasks[id].optImgs[opt]}" alt="${opt} opció képe" class="option-img" onerror="this.style.display='none'">`;
                }

                item.innerHTML = contentHtml + iconHtml;
                optsContainer.appendChild(item);
            });

            if(window.MathJax) {
                MathJax.typeset();
            }
        }

        function checkAnswer() {
            if(!currentTask) return;
            const id = currentTask;
            const selected = taskData[id].selected;

            if(!selected) {
                alert('Kérlek válassz egy opciót az ellenőrzés előtt!');
                return;
            }

            taskData[id].attempts += 1;
            document.getElementById('modal-attempts').textContent = `Próbálkozások: ${taskData[id].attempts} / 5`;

            const feedback = document.getElementById('modal-feedback');
            feedback.classList.remove('hidden');

            if(selected === keys[id]) {
                taskData[id].status = 'correct';
                feedback.className = 'feedback-box feedback-correct';
                feedback.innerHTML = '<i class="fa-solid fa-check"></i> Helyes válasz!';
                document.getElementById('check-btn').disabled = true;
                updateStats();
                renderGrids();
                renderOptions(id);
            } else {
                if(taskData[id].attempts >= 5) {
                    finishTaskFailed();
                } else {
                    document.getElementById('wrong-modal-text').innerHTML = `
                        A megadott válasz nem helyes.<br>
                        <strong>Eddigi próbálkozások száma: ${taskData[id].attempts} / 5</strong>
                    `;
                    document.getElementById('wrong-modal').classList.remove('hidden');
                }
            }
        }

        function continueRetry() {
            if(!currentTask) return;
            const id = currentTask;
            taskData[id].selected = null;
            taskData[id].wrongOpts = []; 
            document.getElementById('wrong-modal').classList.add('hidden');
            renderOptions(id);
        }

        function finishTaskFailed() {
            if(!currentTask) return;
            const id = currentTask;
            
            taskData[id].status = 'failed';
            document.getElementById('wrong-modal').classList.add('hidden');
            
            const feedback = document.getElementById('modal-feedback');
            feedback.classList.remove('hidden');
            feedback.className = 'feedback-box feedback-failed';
            feedback.innerHTML = `<i class="fa-solid fa-xmark"></i> Ez a feladat sikertelenként lezárva. A helyes válasz lett volna: <strong>${keys[id]}) ${tasks[id].options[keys[id]]}</strong>`;
            
            document.getElementById('check-btn').disabled = true;
            updateStats();
            renderGrids();
            renderOptions(id);
        }

        function revealSolution() {
            if(!currentTask) return;
            finishTaskFailed();
        }

        // BEZÁRÁSKOR AUTOMATIKUS E-MAIL KÜLDÉS
        function askClose() {
            if (confirm("Biztosan be akarja zárni az ablakot?")) {
                document.getElementById('task-modal').classList.add('hidden');

                if (!emailSent && activeUser) {
                    sendSummaryEmailSilent();
                }
            }
        }

        function sendSummaryEmailSilent() {
            let correctCount = 0;
            let failedCount = 0;
            let unsolvedCount = 0;
            let detailsText = "";

            for(let i=1; i<=30; i++) {
                let st = taskData[i].status;
                let statLabel = "Megoldatlan";
                if(st === 'correct') {
                    statLabel = "Helyes";
                    correctCount++;
                } else if(st === 'failed') {
                    statLabel = "Sikertelen";
                    failedCount++;
                } else {
                    unsolvedCount++;
                }
                detailsText += `${i}. feladat: ${statLabel} (${taskData[i].attempts} próbálkozás)\n`;
            }

            const templateParams = {
                to_name: "Tanár úr",
                subject: `Zrínyi 2020 Összesítő - ${activeUser}`,
                title: `Zrínyi 2020 Összesítő - ${activeUser}`,
                student_name: activeUser,
                name: activeUser,
                task_number: "Összesített eredmények (1-30)",
                task_status: `Helyes: ${correctCount}, Sikertelen: ${failedCount}, Megoldatlan: ${unsolvedCount}`,
                attempts: "Összesen",
                correct_answer: "-",
                details: detailsText
            };

            emailjs.send('service_kbrr2is', 'template_vtvagng', templateParams, 'hsRvek-Jff5scNP1B')
                .then(function(response) {
                    emailSent = true;
                    document.getElementById('email-sent-modal').classList.remove('hidden');
                }, function(error) {
                    console.log('E-mail küldési hiba:', error);
                });
        }

        function updateStats() {
            let c = 0, f = 0;
            for(let i=1; i<=30; i++) {
                if(taskData[i].status === 'correct') c++;
                if(taskData[i].status === 'failed') f++;
            }
            document.getElementById('stat-c').textContent = c;
            document.getElementById('stat-f').textContent = f;
        }

        document.addEventListener('keydown', (e) => {
            if(e.key === 'F12' || (e.ctrlKey && (e.key === 'c' || e.key === 'u'))) e.preventDefault();
        });
    </script>
</body>
</html>
```
