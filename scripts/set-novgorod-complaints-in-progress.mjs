import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const TARGET_STATUS = "inProgress";
const TARGET_REGION = "Новгородская область";
const APPLY_CHANGES = process.argv.includes("--apply");

const sourceRows = [
  [1, "Свалки вдоль дороги у Дальнего озера в Угловке", 58.233362, 33.525848],
  [2, "Мусор вокруг контейнерной площадки", 58.546899, 31.233255],
  [3, "Свалка вокруг контейнерной площадки", 58.84146, 32.225124],
  [4, "Невывоз мусора, веток и КГО", 58.25249, 32.524745],
  [5, "Свалка", 58.372902, 33.34312],
  [6, "Покрышки вдоль дороги", 58.547393, 31.326095],
  [7, "Свалка", 58.514649, 31.286559],
  [8, "Свалка вокруг контейнерной площадки", 58.579963, 35.790464],
  [9, "Оставленный мусор", 58.586591, 35.795124],
  [10, "Свалка", 58.220302, 32.527954],
  [11, "Свалка", 58.221657, 32.526502],
  [12, "Свалка", 58.224359, 32.519452],
  [13, "Свалка", 58.220146, 32.530974],
  [14, "Свалка", 58.22029, 32.528232],
  [15, "Свалка", 58.223884, 32.52022],
  [16, "Свалка", 58.224886, 32.518222],
  [17, "Свалка", 58.223396, 32.521406],
  [18, "Свалка", 58.225166, 32.517557],
  [19, "Свалка", 58.222761, 32.527819],
  [20, "Свалка", 58.220524, 32.527522],
  [21, "Свалка", 58.219971, 32.528817],
  [22, "Свалка", 58.219971, 32.528817],
  [23, "Свалка", 58.223657, 32.520755],
  [24, "Свалка", 58.220474, 32.5278],
  [25, "Свалка", 58.223859, 32.52021],
  [26, "Свалка", 58.22616, 32.515917],
  [27, "Переполненная контейнерная площадка", 58.235211, 32.51487],
  [28, "Переполненная контейнерная площадка", 58.402436, 33.896733],
  [29, "Свалка", 58.234405, 32.514059],
  [30, "Свалка", 58.227418, 32.514133],
  [31, "Свалка", 58.228736, 32.5135],
  [32, "Свалка", 58.229656, 32.514572],
  [33, "Свалка", 58.234971, 32.514802],
  [34, "Свалка", 58.226934, 32.514737],
  [35, "Свалка", 58.229563, 32.514545],
  [36, "Свалка", 58.23326, 32.512803],
  [37, "Свалка", 58.228831, 32.513587],
  [38, "Свалка", 58.226224, 32.514805],
  [39, "Свалка", 58.234578, 32.514372],
  [40, "Свалка", 58.230156, 32.514339],
  [41, "Свалка", 58.225021, 32.51747],
  [42, "Свалка", 58.233893, 32.512816],
  [43, "Свалка", 58.226431, 32.515488],
  [44, "Свалка", 58.234096, 32.513431],
  [45, "Невывоз пакетного мусора", 58.055223, 32.937709],
  [46, "Свалка", 58.207919, 33.511971],
  [47, "Свалка", 58.209497, 33.509693],
  [48, "Свалка", 58.209381, 33.510192],
  [49, "Свалка", 58.209381, 33.510192],
  [50, "Свалка", 58.209295, 33.51041],
  [51, "Свалка", 58.209222, 33.510614],
  [52, "Свалка", 58.209165, 33.510805],
  [53, "Свалка", 58.209061, 33.511186],
  [54, "Свалка", 58.20901, 33.511519],
  [55, "Свалка", 58.20872, 33.511623],
  [56, "Свалка", 58.208548, 33.511609],
  [57, "Свалка", 58.20834, 33.511621],
  [58, "Свалка", 58.210572, 33.498223],
  [59, "Свалка", 58.210624, 33.49825],
  [60, "Свалка", 58.211451, 33.496268],
  [61, "Свалка", 58.211713, 33.49597],
  [62, "Свалка", 58.211217, 33.496445],
  [63, "Свалка", 58.211014, 33.497078],
  [64, "Свалка", 58.211014, 33.497078],
  [65, "Свалка", 58.210662, 33.497204],
  [66, "Свалка", 58.210362, 33.497452],
  [67, "Свалка", 58.210256, 33.497503],
  [68, "Свалка", 58.210178, 33.49757],
  [69, "Свалка", 58.210136, 33.49758],
  [70, "Свалка", 58.210046, 33.497681],
  [71, "Свалка", 58.209994, 33.497702],
  [72, "Свалка", 58.209966, 33.497722],
  [73, "Свалка", 58.209894, 33.497744],
  [74, "Свалка", 58.209761, 33.497867],
  [75, "Свалка", 58.209753, 33.497877],
  [76, "Свалка", 58.209273, 33.498325],
  [77, "Свалка", 58.209246, 33.49833],
  [78, "Свалка", 58.209037, 33.499003],
  [79, "Свалка", 58.209002, 33.498761],
  [80, "Свалка", 58.208875, 33.498662],
  [81, "Свалки у Дальнего озера в Угловке", 58.231129, 33.524162],
  [82, "Навал мусора", 57.985379, 33.240508],
  [83, "КГО вокруг контейнерной площадки", 57.98782, 33.244838],
  [84, "Невывоз КГО", 57.983579, 33.239569],
  [85, "КГО и мусор вокруг контейнерной площадки", 57.985792, 33.239092],
  [86, "Несколько километров свалок у Дальнего озера", 58.231138, 33.524304],
];

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}.`);
  }

  return value;
}

function coordinateKey(lat, lng) {
  return `${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`;
}

function uniqueTargets(rows) {
  const targets = new Map();
  const duplicateRows = [];

  for (const [number, description, lat, lng] of rows) {
    const key = coordinateKey(lat, lng);

    if (targets.has(key)) {
      duplicateRows.push({
        number,
        originalNumber: targets.get(key).number,
        key,
      });
      continue;
    }

    targets.set(key, {
      number,
      description,
      lat,
      lng,
      key,
    });
  }

  return {
    targets: [...targets.values()],
    duplicateRows,
  };
}

async function sanityRequest(url, options = {}) {
  const response = await fetch(url, options);
  const responseText = await response.text();
  let responseBody = null;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = responseText;
  }

  if (!response.ok) {
    const details =
      typeof responseBody === "string"
        ? responseBody
        : JSON.stringify(responseBody, null, 2);

    throw new Error(
      `Sanity вернул ошибку ${response.status} ${response.statusText}:\n${details}`,
    );
  }

  return responseBody;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = requireEnv("NEXT_PUBLIC_SANITY_DATASET");
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || "2026-07-16";
  const token =
    process.env.SANITY_API_WRITE_TOKEN?.trim() ||
    process.env.SANITY_API_TOKEN?.trim() ||
    "";

  if (APPLY_CHANGES && !token) {
    throw new Error(
      "Для записи нужен SANITY_API_WRITE_TOKEN или SANITY_API_TOKEN в .env.local.",
    );
  }

  const { targets, duplicateRows } = uniqueTargets(sourceRows);
  const query = `
    *[
      _type == "complaint" &&
      region == $region &&
      defined(location.lat) &&
      defined(location.lng) &&
      !(_id in path("drafts.**"))
    ]{
      _id,
      complaintId,
      title,
      status,
      "lat": location.lat,
      "lng": location.lng
    }
  `;

  const queryUrl = new URL(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`,
  );
  queryUrl.searchParams.set("query", query);
  queryUrl.searchParams.set("$region", JSON.stringify(TARGET_REGION));

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const queryResponse = await sanityRequest(queryUrl, { headers });
  const complaints = Array.isArray(queryResponse?.result)
    ? queryResponse.result
    : [];
  const complaintsByCoordinates = new Map();

  for (const complaint of complaints) {
    const key = coordinateKey(complaint.lat, complaint.lng);
    const current = complaintsByCoordinates.get(key) || [];
    current.push(complaint);
    complaintsByCoordinates.set(key, current);
  }

  const found = [];
  const missing = [];
  const ambiguous = [];
  const alreadyInProgress = [];

  for (const target of targets) {
    const matches = complaintsByCoordinates.get(target.key) || [];

    if (matches.length === 0) {
      missing.push(target);
      continue;
    }

    if (matches.length > 1) {
      ambiguous.push({ target, matches });
      continue;
    }

    const complaint = matches[0];

    if (complaint.status === TARGET_STATUS) {
      alreadyInProgress.push({ target, complaint });
      continue;
    }

    found.push({ target, complaint });
  }

  console.log("\n=== ПРОВЕРКА ОБРАЩЕНИЙ НОВГОРОДСКОЙ ОБЛАСТИ ===");
  console.log(`Строк в исходной таблице: ${sourceRows.length}`);
  console.log(`Уникальных координат: ${targets.length}`);
  console.log(`Дублей в таблице: ${duplicateRows.length}`);
  console.log(`Найдено для изменения: ${found.length}`);
  console.log(`Уже имеют статус «В работе»: ${alreadyInProgress.length}`);
  console.log(`Не найдено: ${missing.length}`);
  console.log(`Несколько обращений в одной точке: ${ambiguous.length}`);

  if (duplicateRows.length > 0) {
    console.log("\nДубли в исходной таблице:");
    for (const duplicate of duplicateRows) {
      console.log(
        `- строка ${duplicate.number} повторяет строку ${duplicate.originalNumber}: ${duplicate.key}`,
      );
    }
  }

  if (found.length > 0) {
    console.log("\nБудут изменены:");
    for (const { target, complaint } of found) {
      console.log(
        `- ${target.key} | ${complaint.complaintId || complaint._id} | ${complaint.title || target.description} | ${complaint.status || "без статуса"} → ${TARGET_STATUS}`,
      );
    }
  }

  if (alreadyInProgress.length > 0) {
    console.log("\nУже в работе:");
    for (const { target, complaint } of alreadyInProgress) {
      console.log(
        `- ${target.key} | ${complaint.complaintId || complaint._id} | ${complaint.title || target.description}`,
      );
    }
  }

  if (missing.length > 0) {
    console.log("\nНе найдены:");
    for (const target of missing) {
      console.log(`- строка ${target.number}: ${target.key} | ${target.description}`);
    }
  }

  if (ambiguous.length > 0) {
    console.log("\nПропущены из-за нескольких совпадений:");
    for (const { target, matches } of ambiguous) {
      console.log(`- ${target.key} | найдено документов: ${matches.length}`);
      for (const match of matches) {
        console.log(
          `  • ${match.complaintId || match._id} | ${match.title || "Без названия"} | ${match.status || "без статуса"}`,
        );
      }
    }
  }

  if (!APPLY_CHANGES) {
    console.log(
      "\nЭто только проверка. Для реального изменения запусти: npm run complaints:novgorod:apply",
    );
    return;
  }

  if (missing.length > 0 || ambiguous.length > 0) {
    console.log(
      "\nВнимание: ненайденные и неоднозначные точки будут пропущены. Остальные найденные обращения будут обновлены.",
    );
  }

  if (found.length === 0) {
    console.log("\nНет обращений, которым требуется менять статус.");
    return;
  }

  const mutationUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
  const mutations = found.map(({ complaint }) => ({
    patch: {
      id: complaint._id,
      set: {
        status: TARGET_STATUS,
      },
    },
  }));

  const mutationResponse = await sanityRequest(mutationUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutations, returnIds: true }),
  });

  const updatedIds = Array.isArray(mutationResponse?.results)
    ? mutationResponse.results.map((result) => result.id)
    : [];

  console.log(`\nГотово. Статус изменён у ${updatedIds.length || found.length} обращений.`);
}

main().catch((error) => {
  console.error("\nОшибка:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
