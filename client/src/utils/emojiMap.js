export const EMOJI_TO_ICON_MAP = {
  '🛡️': 'shield',
  '🛡': 'shield',
  '💧': 'water_drop',
  '⭐': 'star',
  '☀️': 'light_mode',
  '☀': 'light_mode',
  '📹': 'videocam',
  '🚗': 'directions_car',
  '🪑': 'chair',
  '✨': 'auto_awesome',
  '🎁': 'redeem',
  '📈': 'trending_up',
  '🏆': 'emoji_events',
  '⏱️': 'timer',
  '⏱': 'timer',
  '🇺🇸': 'public', // Material icons don't have flags
  '✅': 'check_circle',
  '💎': 'diamond',
  '⚡': 'bolt',
  '♾️': 'all_inclusive',
  '♾': 'all_inclusive'
};

export const getIconForEmoji = (emoji) => {
  return EMOJI_TO_ICON_MAP[emoji] || null;
};
