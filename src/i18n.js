import { useState, useEffect } from "react";

// Detect language based on browser settings
// Spanish for es, ca, gl, eu (languages of Spain)
// English for everything else
export function detectLanguage() {
  const lang = navigator.language?.toLowerCase() || "en";
  const prefix = lang.split("-")[0];
  return ["es", "ca", "gl", "eu"].includes(prefix) ? "es" : "en";
}

const translations = {
  es: {
    // Header
    subtitle: "Mongoose Traveller",
    title: "Universal World Profile Decoder",

    // Form labels
    worldName: "Nombre del mundo",
    zone: "Zona",
    zoneGreen: "Verde",
    zoneAmber: "Ámbar",
    zoneRed: "Rojo",
    uwpCode: "Código UWP (ej: A788899-C)",
    uwpPlaceholder: "A788899-C",

    // Buttons
    viewRecent: "Recientes",
    decode: "Decodificar",
    newScan: "Nuevo escaneo",

    // Recent planets
    recentPlanets: "Recientes",
    noRecentPlanets: "No hay planetas recientes",
    delete: "Eliminar",
    clearAll: "Borrar todo",

    // Planet display
    unnamed: "Sin nombre",
    zoneLabel: "Zona",

    // Invalid UWP
    invalidUwp: "Introduce un código UWP válido (formato: Xnnnnnn-n)",

    // Section titles
    starport: "Astropuerto",
    class: "Clase",
    size: "Tamaño",
    atmosphere: "Atmósfera",
    hydrographics: "Hidrografía",
    population: "Población",
    government: "Gobierno",
    lawLevel: "Nivel de Ley",
    techLevel: "Nivel Tecnológico",
    travelZone: "Zona de Viaje",

    // Starport labels
    quality: "Calidad",
    fuel: "Combustible",
    berth: "Atraque",
    services: "Servicios",
    possibleBases: "Bases posibles",

    // Size labels
    diameter: "Diámetro",
    gravity: "Gravedad",
    example: "Ejemplo",
    description: "Descripción",
    lowGravity: "Baja gravedad (≤0,7g)",
    highGravity: "Alta gravedad (≥1,4g)",
    gravityWarning: "Gravedad",

    // Atmosphere labels
    composition: "Composición",
    pressure: "Presión (atm)",
    equipRequired: "Equipo requerido",
    danger: "Peligro",
    dangerousAtmo: "¡Atmósfera peligrosa!",
    unknown: "Desconocida",

    // Hydrographics labels
    liquidCoverage: "Cobertura líquida",
    liquidNote: "El líquido puede no ser agua (atmósfera exótica/corrosiva)",

    // Population labels
    inhabitants: "Habitantes",
    level: "Nivel",
    uninhabitedNote: "Deshabitado: Gobierno, Ley y NT = 0",
    smallColonyNote: "Colonia muy pequeña. Puede diferir mucho de lo estándar.",

    // Government labels
    type: "Tipo",
    commonContraband: "Contrabando común",

    // Law labels
    bannedWeapons: "Armas prohibidas",
    bannedArmor: "Armadura prohibida",
    noRestrictions: "Sin restricciones. Se recomienda ir armado.",
    martialLaw: "Ley marcial",
    allWeaponsArmorBanned: "Todas las armas y armaduras prohibidas",
    note: "Nota",

    // Tech level
    tl: "NT",
    equivalent: "Equivalente",
    primitive: "Primitivo",
    preindustrial: "Era preindustrial",
    industrial: "Era industrial",
    preatomic: "Era preatómica / atómica",
    earlySpace: "Era espacial temprana",
    earlyStellar: "Era estelar temprana",
    midStellar: "Era estelar media",
    advancedStellar: "Era estelar avanzada",
    communications: "Comunicaciones",
    noTelecom: "Sin telecomunicaciones (solo astropuerto)",
    radioPhone: "Radio/teléfono entre ciudades, sin satélites",
    fullNetwork: "Red completa, accesible desde cualquier punto",

    // Travel zone
    amberCaution: "Ámbar — Precaución",
    redProhibited: "Rojo — Prohibido",
    code: "Código",
    meaning: "Significado",
    amberMeaning: "Peligro potencial: xenofobia, inestabilidad política u otros peligros.",
    redMeaning: "Interdicción: cuarentena, guerra activa o protección imperial. Viaje prohibido.",

    // Footer
    worldLine: "Línea completa del mundo",
    disclaimer: "Herramienta no oficial con el fin de agilizar el juego",
    manualNote: "Para detalles completos revisar el manual",

    // None/varies
    none: "Ninguno",
    varies: "Varía",
    na: "N/A",
    free: "Gratis",

    // Scanner
    home: "Inicio",
    scan: "Escanear",
    scanning: "Escaneando...",
    scanError: "Error al procesar la imagen",
    or: "o",
    enterManually: "Introducir código manualmente",
    noUwpFound: "No se encontró código UWP en la imagen",
    uwpDetected: "UWP detectado",
    nameDetected: "Nombre detectado",
    loadingOcr: "Cargando OCR...",

    // Saved planets page
    back: "Volver",
    viewInfo: "Ver información",
    confirmDelete: "¿Eliminar este planeta?",
    planetCount: "planetas",
    edit: "Editar",
    newPlanet: "Nuevo planeta",
  },

  en: {
    // Header
    subtitle: "Mongoose Traveller",
    title: "Universal World Profile Decoder",

    // Form labels
    worldName: "World name",
    zone: "Zone",
    zoneGreen: "Green",
    zoneAmber: "Amber",
    zoneRed: "Red",
    uwpCode: "UWP Code (e.g.: A788899-C)",
    uwpPlaceholder: "A788899-C",

    // Buttons
    viewRecent: "Recent",
    decode: "Decode",
    newScan: "New scan",

    // Recent planets
    recentPlanets: "Recent",
    noRecentPlanets: "No recent planets",
    delete: "Delete",
    clearAll: "Clear all",

    // Planet display
    unnamed: "Unnamed",
    zoneLabel: "Zone",

    // Invalid UWP
    invalidUwp: "Enter a valid UWP code (format: Xnnnnnn-n)",

    // Section titles
    starport: "Starport",
    class: "Class",
    size: "Size",
    atmosphere: "Atmosphere",
    hydrographics: "Hydrographics",
    population: "Population",
    government: "Government",
    lawLevel: "Law Level",
    techLevel: "Tech Level",
    travelZone: "Travel Zone",

    // Starport labels
    quality: "Quality",
    fuel: "Fuel",
    berth: "Berthing",
    services: "Services",
    possibleBases: "Possible Bases",

    // Size labels
    diameter: "Diameter",
    gravity: "Gravity",
    example: "Example",
    description: "Description",
    lowGravity: "Low gravity (≤0.7g)",
    highGravity: "High gravity (≥1.4g)",
    gravityWarning: "Gravity",

    // Atmosphere labels
    composition: "Composition",
    pressure: "Pressure (atm)",
    equipRequired: "Equipment required",
    danger: "Danger",
    dangerousAtmo: "Dangerous atmosphere!",
    unknown: "Unknown",

    // Hydrographics labels
    liquidCoverage: "Liquid coverage",
    liquidNote: "Liquid may not be water (exotic/corrosive atmosphere)",

    // Population labels
    inhabitants: "Inhabitants",
    level: "Level",
    uninhabitedNote: "Uninhabited: Government, Law and TL = 0",
    smallColonyNote: "Very small colony. May differ greatly from standard.",

    // Government labels
    type: "Type",
    commonContraband: "Common contraband",

    // Law labels
    bannedWeapons: "Banned weapons",
    bannedArmor: "Banned armor",
    noRestrictions: "No restrictions. Being armed is recommended.",
    martialLaw: "Martial law",
    allWeaponsArmorBanned: "All weapons and armor banned",
    note: "Note",

    // Tech level
    tl: "TL",
    equivalent: "Equivalent",
    primitive: "Primitive",
    preindustrial: "Pre-industrial era",
    industrial: "Industrial era",
    preatomic: "Pre-atomic / atomic era",
    earlySpace: "Early space era",
    earlyStellar: "Early stellar era",
    midStellar: "Mid stellar era",
    advancedStellar: "Advanced stellar era",
    communications: "Communications",
    noTelecom: "No telecommunications (starport only)",
    radioPhone: "Radio/phone between cities, no satellites",
    fullNetwork: "Full network, accessible from anywhere",

    // Travel zone
    amberCaution: "Amber — Caution",
    redProhibited: "Red — Prohibited",
    code: "Code",
    meaning: "Meaning",
    amberMeaning: "Potential danger: xenophobia, political instability or other hazards.",
    redMeaning: "Interdiction: quarantine, active war or imperial protection. Travel prohibited.",

    // Footer
    worldLine: "Complete world line",
    disclaimer: "Unofficial tool to speed up gameplay",
    manualNote: "For complete details check the manual",

    // None/varies
    none: "None",
    varies: "Varies",
    na: "N/A",
    free: "Free",

    // Scanner
    home: "Home",
    scan: "Scan",
    scanning: "Scanning...",
    scanError: "Error processing image",
    or: "or",
    enterManually: "Enter code manually",
    noUwpFound: "No UWP code found in image",
    uwpDetected: "UWP detected",
    nameDetected: "Name detected",
    loadingOcr: "Loading OCR...",

    // Saved planets page
    back: "Back",
    viewInfo: "View info",
    confirmDelete: "Delete this planet?",
    planetCount: "planets",
    edit: "Edit",
    newPlanet: "New planet",
  },
};

// Game data with translations
export function getSTARPORT(t) {
  const none = t("none");
  const na = t("na");
  const free = t("free");

  return {
    es: {
      A: { name: "Excelente", fuel: "Refinado", berth: "1D×1.000 Cr", services: "Astillero (todos), Reparación", bases: "Naval 8+, Exploración 10+, Investigación 8+, SAV" },
      B: { name: "Buena", fuel: "Refinado", berth: "1D×500 Cr", services: "Astillero (astronaves), Reparación", bases: "Naval 8+, Exploración 8+, Investigación 10+, SAV" },
      C: { name: "Rutinaria", fuel: "Sin refinar", berth: "1D×100 Cr", services: "Astillero (lanzaderas), Reparación", bases: "Exploración 8+, Investigación 10+, SAV 10+" },
      D: { name: "Pobre", fuel: "Sin refinar", berth: "1D×10 Cr", services: "Reparación limitada", bases: "Exploración 7+" },
      E: { name: "Fronteriza", fuel: "Ninguno", berth: "Gratis", services: "Ninguno", bases: "Ninguno" },
      X: { name: "Sin astropuerto", fuel: "Ninguno", berth: "N/A", services: "Ninguno", bases: "Ninguno" },
    },
    en: {
      A: { name: "Excellent", fuel: "Refined", berth: "1D×1,000 Cr", services: "Shipyard (all), Repair", bases: "Naval 8+, Scout 10+, Research 8+, TAS" },
      B: { name: "Good", fuel: "Refined", berth: "1D×500 Cr", services: "Shipyard (starships), Repair", bases: "Naval 8+, Scout 8+, Research 10+, TAS" },
      C: { name: "Routine", fuel: "Unrefined", berth: "1D×100 Cr", services: "Shipyard (shuttles), Repair", bases: "Scout 8+, Research 10+, TAS 10+" },
      D: { name: "Poor", fuel: "Unrefined", berth: "1D×10 Cr", services: "Limited repair", bases: "Scout 7+" },
      E: { name: "Frontier", fuel: none, berth: free, services: none, bases: none },
      X: { name: "No starport", fuel: none, berth: na, services: none, bases: none },
    },
  };
}

export function getSIZE(lang) {
  return {
    es: [
      { d: "<1.000 km", g: "Desdeñable", ex: "Asteroide", desc: "Asteroide o complejo orbital. Sin atmósfera." },
      { d: "1.600 km", g: "0,05", ex: "Tritón", desc: "Cuerpo muy pequeño, sin atmósfera respirable." },
      { d: "3.200 km", g: "0,15", ex: "Luna, Europa", desc: "Pequeño satélite." },
      { d: "4.800 km", g: "0,25", ex: "Mercurio", desc: "Mundo pequeño." },
      { d: "6.400 km", g: "0,35", ex: "", desc: "Mundo pequeño, baja gravedad." },
      { d: "8.000 km", g: "0,45", ex: "Marte", desc: "Mundo mediano-pequeño, baja gravedad." },
      { d: "9.600 km", g: "0,7", ex: "", desc: "Mundo mediano. Baja gravedad (≤0,7g)." },
      { d: "11.200 km", g: "0,9", ex: "", desc: "Mundo mediano-grande." },
      { d: "12.800 km", g: "1,0", ex: "Tierra", desc: "Similar a la Tierra." },
      { d: "14.400 km", g: "1,25", ex: "", desc: "Mundo grande." },
      { d: "16.000 km", g: "1,4", ex: "", desc: "Mundo muy grande. Alta gravedad (≥1,4g)." },
    ],
    en: [
      { d: "<1,000 km", g: "Negligible", ex: "Asteroid", desc: "Asteroid or orbital complex. No atmosphere." },
      { d: "1,600 km", g: "0.05", ex: "Triton", desc: "Very small body, no breathable atmosphere." },
      { d: "3,200 km", g: "0.15", ex: "Luna, Europa", desc: "Small satellite." },
      { d: "4,800 km", g: "0.25", ex: "Mercury", desc: "Small world." },
      { d: "6,400 km", g: "0.35", ex: "", desc: "Small world, low gravity." },
      { d: "8,000 km", g: "0.45", ex: "Mars", desc: "Medium-small world, low gravity." },
      { d: "9,600 km", g: "0.7", ex: "", desc: "Medium world. Low gravity (≤0.7g)." },
      { d: "11,200 km", g: "0.9", ex: "", desc: "Medium-large world." },
      { d: "12,800 km", g: "1.0", ex: "Earth", desc: "Similar to Earth." },
      { d: "14,400 km", g: "1.25", ex: "", desc: "Large world." },
      { d: "16,000 km", g: "1.4", ex: "", desc: "Very large world. High gravity (≥1.4g)." },
    ],
  }[lang];
}

export function getATMO(lang) {
  return {
    es: [
      { comp: "Ninguno", pres: "0,00", equip: "Traje espacial", desc: "Sin atmósfera." },
      { comp: "Trazas", pres: "0,001-0,09", equip: "Traje espacial", desc: "Atmósfera vestigial." },
      { comp: "Muy tenue, Nociva", pres: "0,1-0,42", equip: "Respirador + Filtro", desc: "Muy tenue y tóxica." },
      { comp: "Muy tenue", pres: "0,1-0,42", equip: "Respirador", desc: "Muy tenue pero no tóxica." },
      { comp: "Tenue, Nociva", pres: "0,43-0,7", equip: "Filtro", desc: "Tenue y tóxica." },
      { comp: "Tenue", pres: "0,43-0,7", equip: "Ninguno", desc: "Tenue pero respirable." },
      { comp: "Estándar", pres: "0,71-1,49", equip: "Ninguno", desc: "Atmósfera similar a la Tierra." },
      { comp: "Estándar, Nociva", pres: "0,71-1,49", equip: "Filtro", desc: "Presión estándar pero tóxica." },
      { comp: "Densa", pres: "1,5-2,49", equip: "Ninguno", desc: "Atmósfera densa pero respirable." },
      { comp: "Densa, Nociva", pres: "1,5-2,49", equip: "Filtro", desc: "Densa y tóxica." },
      { comp: "Exótica", pres: "Varía", equip: "Suministro de aire", desc: "No respirable pero no peligrosa." },
      { comp: "Corrosiva", pres: "Varía", equip: "Traje espacial", desc: "¡Altamente peligrosa! 1D daño/turno." },
      { comp: "Insidiosa", pres: "Varía", equip: "Traje espacial", desc: "Corrosiva + destruye equipo en 2D horas." },
      { comp: "Densidad alta", pres: "2,5+", equip: "Varía", desc: "N₂/O₂ a muy alta presión. Solo habitable en altitud." },
      { comp: "Densidad baja", pres: "≤0,5", equip: "Varía", desc: "Solo respirable en tierras bajas y depresiones." },
      { comp: "Inusual", pres: "Varía", equip: "Varía", desc: "Atmósfera con comportamiento extraño." },
    ],
    en: [
      { comp: "None", pres: "0.00", equip: "Vacc suit", desc: "No atmosphere." },
      { comp: "Trace", pres: "0.001-0.09", equip: "Vacc suit", desc: "Vestigial atmosphere." },
      { comp: "Very thin, Tainted", pres: "0.1-0.42", equip: "Respirator + Filter", desc: "Very thin and toxic." },
      { comp: "Very thin", pres: "0.1-0.42", equip: "Respirator", desc: "Very thin but not toxic." },
      { comp: "Thin, Tainted", pres: "0.43-0.7", equip: "Filter", desc: "Thin and toxic." },
      { comp: "Thin", pres: "0.43-0.7", equip: "None", desc: "Thin but breathable." },
      { comp: "Standard", pres: "0.71-1.49", equip: "None", desc: "Earth-like atmosphere." },
      { comp: "Standard, Tainted", pres: "0.71-1.49", equip: "Filter", desc: "Standard pressure but toxic." },
      { comp: "Dense", pres: "1.5-2.49", equip: "None", desc: "Dense but breathable atmosphere." },
      { comp: "Dense, Tainted", pres: "1.5-2.49", equip: "Filter", desc: "Dense and toxic." },
      { comp: "Exotic", pres: "Varies", equip: "Air supply", desc: "Not breathable but not dangerous." },
      { comp: "Corrosive", pres: "Varies", equip: "Vacc suit", desc: "Highly dangerous! 1D damage/turn." },
      { comp: "Insidious", pres: "Varies", equip: "Vacc suit", desc: "Corrosive + destroys equipment in 2D hours." },
      { comp: "High density", pres: "2.5+", equip: "Varies", desc: "N₂/O₂ at very high pressure. Only habitable at altitude." },
      { comp: "Low density", pres: "≤0.5", equip: "Varies", desc: "Only breathable in lowlands and depressions." },
      { comp: "Unusual", pres: "Varies", equip: "Varies", desc: "Atmosphere with strange behavior." },
    ],
  }[lang];
}

export function getHYDRO(lang) {
  return {
    es: [
      "0%-5% — Mundo desértico", "6%-15% — Mundo seco", "16%-25% — Algunos mares pequeños",
      "26%-35% — Pequeños mares y océanos", "36%-45% — Mundo húmedo", "46%-55% — Grandes océanos",
      "56%-65%", "66%-75% — Similar a la Tierra", "76%-85% — Mundo acuático",
      "86%-95% — Solo islas y archipiélagos", "96%-100% — Casi todo agua",
    ],
    en: [
      "0%-5% — Desert world", "6%-15% — Dry world", "16%-25% — Some small seas",
      "26%-35% — Small seas and oceans", "36%-45% — Wet world", "46%-55% — Large oceans",
      "56%-65%", "66%-75% — Similar to Earth", "76%-85% — Water world",
      "86%-95% — Only islands and archipelagos", "96%-100% — Almost all water",
    ],
  }[lang];
}

export function getPOP(lang) {
  return {
    es: [
      "Ninguna (deshabitado)", "Pocos (1+) — Granja/familia", "Cientos (100+) — Aldea",
      "Miles (1.000+)", "Decenas de miles (10.000+) — Pueblo", "Cientos de miles (100.000+) — Ciudad mediana",
      "Millones (1.000.000+)", "Decenas de millones (10.000.000+) — Gran ciudad",
      "Cientos de millones (100.000.000+)", "Millardos (1.000.000.000+) — Tierra actual",
      "Decenas de millardos (10.000.000.000+)", "Cientos de millardos", "Billones — Mundo-ciudad",
    ],
    en: [
      "None (uninhabited)", "Few (1+) — Farm/family", "Hundreds (100+) — Village",
      "Thousands (1,000+)", "Tens of thousands (10,000+) — Town", "Hundreds of thousands (100,000+) — Medium city",
      "Millions (1,000,000+)", "Tens of millions (10,000,000+) — Large city",
      "Hundreds of millions (100,000,000+)", "Billions (1,000,000,000+) — Current Earth",
      "Tens of billions (10,000,000,000+)", "Hundreds of billions", "Trillions — Ecumenopolis",
    ],
  }[lang];
}

export function getGOV(lang) {
  return {
    es: [
      { type: "Ninguno", desc: "Sin estructura. Predominan lazos familiares.", contra: "Ninguno" },
      { type: "Compañía/Corporación", desc: "Élite gerencial de empresa. Ciudadanos son empleados.", contra: "Armas, drogas, Viajeros" },
      { type: "Democracia participativa", desc: "Decisiones por consentimiento directo de la ciudadanía.", contra: "Drogas" },
      { type: "Oligarquía autoperpetuante", desc: "Gobernada por una minoría restringida.", contra: "Tecnología, armas, viajeros" },
      { type: "Democracia representativa", desc: "Representantes elegidos toman decisiones.", contra: "Drogas, armas, psiónicos" },
      { type: "Tecnocracia feudal", desc: "Gobernantes elegidos por competencia técnica.", contra: "Tecnología, armas, ordenadores" },
      { type: "Gobierno cautivo", desc: "Liderazgo impuesto por grupo externo.", contra: "Armas, tecnología, viajeros" },
      { type: "Balcanización", desc: "Sin autoridad central. Gobiernos rivales compiten.", contra: "Varía" },
      { type: "Burocracia de servicio civil", desc: "Organismos con personal seleccionado por experiencia.", contra: "Drogas, armas" },
      { type: "Burocracia impersonal", desc: "Agencias aisladas de los ciudadanos.", contra: "Tecnología, armas, drogas, Viajeros, psiónicos" },
      { type: "Dictador carismático", desc: "Líder único con confianza abrumadora.", contra: "Ninguno" },
      { type: "Líder no carismático", desc: "Dictadura militar o reinado hereditario.", contra: "Armas, tecnología, ordenadores" },
      { type: "Oligarquía carismática", desc: "Grupo selecto con confianza popular.", contra: "Armas" },
      { type: "Dictadura religiosa", desc: "Organización religiosa gobierna.", contra: "Varía" },
      { type: "Autocracia religiosa", desc: "Líder religioso con poder absoluto.", contra: "Varía" },
      { type: "Oligarquía totalitaria", desc: "Minoría con control absoluto por coacción.", contra: "Varía" },
    ],
    en: [
      { type: "None", desc: "No structure. Family ties predominate.", contra: "None" },
      { type: "Company/Corporation", desc: "Corporate management elite. Citizens are employees.", contra: "Weapons, drugs, Travellers" },
      { type: "Participatory democracy", desc: "Decisions by direct citizen consent.", contra: "Drugs" },
      { type: "Self-perpetuating oligarchy", desc: "Ruled by a restricted minority.", contra: "Technology, weapons, travellers" },
      { type: "Representative democracy", desc: "Elected representatives make decisions.", contra: "Drugs, weapons, psionics" },
      { type: "Feudal technocracy", desc: "Rulers chosen by technical competence.", contra: "Technology, weapons, computers" },
      { type: "Captive government", desc: "Leadership imposed by external group.", contra: "Weapons, technology, travellers" },
      { type: "Balkanization", desc: "No central authority. Rival governments compete.", contra: "Varies" },
      { type: "Civil service bureaucracy", desc: "Agencies with staff selected by experience.", contra: "Drugs, weapons" },
      { type: "Impersonal bureaucracy", desc: "Agencies isolated from citizens.", contra: "Technology, weapons, drugs, Travellers, psionics" },
      { type: "Charismatic dictator", desc: "Single leader with overwhelming confidence.", contra: "None" },
      { type: "Non-charismatic leader", desc: "Military dictatorship or hereditary rule.", contra: "Weapons, technology, computers" },
      { type: "Charismatic oligarchy", desc: "Select group with popular trust.", contra: "Weapons" },
      { type: "Religious dictatorship", desc: "Religious organization governs.", contra: "Varies" },
      { type: "Religious autocracy", desc: "Religious leader with absolute power.", contra: "Varies" },
      { type: "Totalitarian oligarchy", desc: "Minority with absolute control by coercion.", contra: "Varies" },
    ],
  }[lang];
}

export function getLAW_WEAPONS(lang) {
  return {
    es: [
      "Sin restricciones", "Gas venenoso, explosivos, ADM", "Armas energéticas portátiles y láser",
      "Armas militares", "Armas de asalto ligeras y subfusiles", "Armas personales ocultas",
      "Toda arma de fuego excepto escopetas/aturdidores", "Escopetas", "Todas las armas de filo, aturdidores", "Todas las armas",
    ],
    en: [
      "No restrictions", "Poison gas, explosives, WMD", "Portable energy weapons and lasers",
      "Military weapons", "Light assault weapons and SMGs", "Concealed personal weapons",
      "All firearms except shotguns/stunners", "Shotguns", "All bladed weapons, stunners", "All weapons",
    ],
  }[lang];
}

export function getLAW_ARMOR(lang) {
  return {
    es: [
      "Sin restricciones", "Traje de combate", "Armadura de combate", "Chaleco antibalas",
      "Tejido", "Malla", "Jack", "Nada visible", "Toda armadura visible", "Todas las armaduras",
    ],
    en: [
      "No restrictions", "Battle dress", "Combat armor", "Flak jacket",
      "Cloth", "Mesh", "Jack", "Nothing visible", "All visible armor", "All armor",
    ],
  }[lang];
}

// Translation hook
export function useTranslation() {
  const [lang, setLang] = useState(() => detectLanguage());

  useEffect(() => {
    const handleLangChange = () => {
      setLang(detectLanguage());
    };
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return { t, lang };
}
