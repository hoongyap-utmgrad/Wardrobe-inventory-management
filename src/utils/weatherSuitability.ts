import { ClothingItem, WeatherInfo } from '../types';

export interface WeatherSuitabilityCheck {
  isAppropriate: boolean;
  severity: 'optimal' | 'mild_warning' | 'severe_warning';
  score: number; // 0 - 100
  title: string;
  summary: string;
  reasons: string[];
  recommendations: string[];
  weatherSnapshot: {
    temp: number;
    condition: string;
    location: string;
  };
}

/**
 * Evaluates whether a set of clothing items is appropriate for given weather conditions.
 */
export function checkOutfitWeatherSuitability(
  outfitItems: ClothingItem[],
  weather: WeatherInfo
): WeatherSuitabilityCheck {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let penalty = 0;

  const temp = weather.temperature;
  const condition = weather.condition.toLowerCase();

  const hasOuterwear = outfitItems.some((i) => i.category === 'Outerwear');
  const hasOnePiece = outfitItems.some((i) => i.category === 'One-Piece');
  const hasTops = outfitItems.some((i) => i.category === 'Tops');
  const hasBottoms = outfitItems.some((i) => i.category === 'Bottoms');
  const hasFootwear = outfitItems.some((i) => i.category === 'Footwear');

  // Check item descriptions & tags
  const itemNames = outfitItems.map((i) => (i.name + ' ' + (i.notes || '') + ' ' + (i.subCategory || '')).toLowerCase());
  const allSeasons = outfitItems.flatMap((i) => i.season || []);

  const hasShortsOrSkirts = itemNames.some((n) => n.includes('short') || n.includes('skirt') || n.includes('mini'));
  const hasSummerDress = itemNames.some((n) => n.includes('summer dress') || n.includes('sundress') || n.includes('floral dress'));
  const hasHeavyCoat = itemNames.some((n) => n.includes('coat') || n.includes('parka') || n.includes('heavy') || n.includes('down') || n.includes('puffer') || n.includes('wool') || n.includes('fleece') || n.includes('bomber'));
  const hasBoots = itemNames.some((n) => n.includes('boot') || n.includes('timberland'));
  const hasSandals = itemNames.some((n) => n.includes('sandal') || n.includes('flip') || n.includes('slide'));
  const hasCanvasSneakers = itemNames.some((n) => n.includes('canvas') || n.includes('white sneaker') || n.includes('sneaker'));

  // 1. FREEZING / COLD & SNOWY (temp <= 8°C or condition contains snow/cold)
  if (temp <= 8 || condition.includes('snow') || condition.includes('cold')) {
    if (!hasOuterwear && !hasHeavyCoat) {
      penalty += 45;
      reasons.push(`Missing warm outerwear in freezing ${temp}°C ${weather.condition} weather.`);
      recommendations.push('Add a warm winter jacket, wool coat, or layered parka.');
    }

    if (hasSummerDress || hasShortsOrSkirts) {
      penalty += 35;
      reasons.push(`Wearing summer attire (dress/shorts) during freezing temperatures (${temp}°C).`);
      recommendations.push('Swap with heavy trousers, warm jeans, or thermal leggings.');
    }

    if (hasSandals) {
      penalty += 40;
      reasons.push(`Open sandals worn in ${temp}°C cold/snow conditions.`);
      recommendations.push('Swap sandals for insulated boots or closed winter shoes.');
    }

    const strictlySummerItems = outfitItems.filter((i) => i.season.length === 1 && i.season.includes('Summer'));
    if (strictlySummerItems.length > 0) {
      penalty += 20;
      reasons.push(`Contains summer-only items: ${strictlySummerItems.map((i) => i.name).join(', ')}.`);
    }
  }
  // 2. CHILLY / COOL (temp 9°C - 16°C or condition contains chilly/windy)
  else if (temp <= 16 || condition.includes('chilly')) {
    if (!hasOuterwear && !hasHeavyCoat && !itemNames.some((n) => n.includes('hoodie') || n.includes('sweater') || n.includes('knit') || n.includes('long sleeve'))) {
      penalty += 25;
      reasons.push(`Light single-layer outfit without jacket/sweater in brisk ${temp}°C weather.`);
      recommendations.push('Bring a light jacket, denim jacket, or hoodie for comfort.');
    }

    if (hasSandals) {
      penalty += 20;
      reasons.push(`Sandals may feel too cold in ${temp}°C weather.`);
      recommendations.push('Wear closed sneakers or casual boots.');
    }
  }
  // 3. HOT & HUMID / HIGH HEAT (temp >= 27°C or condition contains hot)
  else if (temp >= 27 || condition.includes('hot')) {
    if (hasHeavyCoat || (hasOuterwear && itemNames.some((n) => n.includes('jacket') || n.includes('coat') || n.includes('fleece')))) {
      penalty += 40;
      reasons.push(`Heavy outerwear or thick fleece will cause overheating in ${temp}°C ${weather.condition} heat.`);
      recommendations.push('Ditch heavy jackets/hoodies; opt for lightweight breathable cotton or linen.');
    }

    if (hasBoots) {
      penalty += 20;
      reasons.push(`Heavy winter boots in ${temp}°C hot weather.`);
      recommendations.push('Swap boots for breathable sneakers, loafers, or sandals.');
    }

    const strictlyWinterItems = outfitItems.filter((i) => i.season.length === 1 && i.season.includes('Winter'));
    if (strictlyWinterItems.length > 0) {
      penalty += 25;
      reasons.push(`Contains winter-only pieces in scorching weather.`);
    }
  }

  // 4. RAINY / WET CONDITIONS (condition contains rain / showers)
  if (condition.includes('rain')) {
    if (!hasOuterwear && !itemNames.some((n) => n.includes('jacket') || n.includes('coat') || n.includes('hoodie'))) {
      penalty += 20;
      reasons.push(`No water-resistant layer or hooded outerwear in rainy weather.`);
      recommendations.push('Layer with a hooded jacket or carry an umbrella.');
    }

    if (hasCanvasSneakers) {
      penalty += 15;
      reasons.push('White canvas sneakers may get soaked and stained in rain puddles.');
      recommendations.push('Consider leather footwear, water-repellent shoes, or boots.');
    }
  }

  // Base score calculation
  const score = Math.max(10, Math.min(100, 100 - penalty));

  let severity: 'optimal' | 'mild_warning' | 'severe_warning' = 'optimal';
  let title = 'Weather Appropriate';
  let summary = `This outfit is well-matched for ${weather.temperature}°C ${weather.condition}.`;

  if (penalty >= 40) {
    severity = 'severe_warning';
    title = `⚠️ Severe Weather Mismatch (${weather.condition})`;
    summary = `Significant weather conflict with ${weather.temperature}°C ${weather.condition} in ${weather.locationName}.`;
  } else if (penalty > 0) {
    severity = 'mild_warning';
    title = `🌦️ Weather Adjustment Recommended`;
    summary = `Minor weather adjustments suggested for ${weather.temperature}°C ${weather.condition}.`;
  }

  return {
    isAppropriate: penalty < 25,
    severity,
    score,
    title,
    summary,
    reasons,
    recommendations,
    weatherSnapshot: {
      temp: weather.temperature,
      condition: weather.condition,
      location: weather.locationName,
    },
  };
}
