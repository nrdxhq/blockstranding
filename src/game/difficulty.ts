// TODO: Split by features
export const DIFFICULTY = {
  /**
   * Player
   */

  PLAYER_ATTACK_DAMAGE: 20, // Attack damage
  PLAYER_ATTACK_DAMAGE_GROWTH: 0.4, // Growth attack damage by upgrade (Quadratic)
  PLAYER_ATTACK_DAMAGE_COINS_TO_UPGRADE: 20, // Coins need to upgrade attack damage
  PLAYER_ATTACK_DISTANCE: 100, // Attack distance
  PLAYER_ATTACK_DISTANCE_GROWTH: 0.4, // Growth attack distance by upgrade (Quadratic)
  PLAYER_ATTACK_DISTANCE_COINS_TO_UPGRADE: 15, // Coins need to upgrade attack distance
  PLAYER_ATTACK_NEED_STAMINA: 10, // Need stamina to attack
  PLAYER_HEALTH: 100, // Health
  PLAYER_HEALTH_GROWTH: 0.4, // Growth health by upgrade (Quadratic)
  PLAYER_HEALTH_COINS_TO_UPGRADE: 20, // Coins need to upgrade health
  PLAYER_HEALTH_REGENERATE_MULTIPLIER: 0.005, // Heal multiplier by max health
  PLAYER_HEALTH_REGENERATE_DELAY: 100, // Delay between heal
  PLAYER_SPEED: 90, // Movement speed
  PLAYER_SPEED_GROWTH: 0.0556, // Growth speed by upgrade (Linear)
  PLAYER_SPEED_COINS_TO_UPGRADE: 20, // Coins need to upgrade speed
  PLAYER_STAMINA: 100, // Stamina
  PLAYER_STAMINA_GROWTH: 0.2, // Growth stamina by upgrade (Quadratic)
  PLAYER_STAMINA_COINS_TO_UPGRADE: 10, // Coins need to upgrade stamina
  PLAYER_COINS_TO_UPGRADE_GROWTH: 1.0, // Growth coins need to upgrade (Quadratic)

  /**
   * Assistant
   */

  ASSISTANT_ATTACK_SPEED: 500, // Attack speed
  ASSISTANT_ATTACK_DAMAGE: 15, // Attack damage
  ASSISTANT_ATTACK_DAMAGE_GROWTH: 0.5, // Damage growth by upgrade level (Quadratic)
  ASSISTANT_ATTACK_DAMAGE_COINS_TO_UPGRADE: 15, // Coins need to upgrade attack damage
  ASSISTANT_ATTACK_DISTANCE: 80, // Attack distance
  ASSISTANT_ATTACK_DISTANCE_GROWTH: 0.12, // Attack distance growth by upgrade level (Quadratic)
  ASSISTANT_ATTACK_DISTANCE_COINS_TO_UPGRADE: 10, // Coins need to upgrade attack distance
  ASSISTANT_ATTACK_PAUSE: 1000, // Attack pause
  ASSISTANT_ATTACK_PAUSE_GROWTH: -0.15, // Attack pause growth by upgrade level (Quadratic)
  ASSISTANT_ATTACK_PAUSE_COINS_TO_UPGRADE: 10, // Coins need to upgrade attack pause

  /**
   * Coins
   */

  COINS_COUNT: 20, // Coins count on map
  COINS_SIZE: 4, // Amount of coins in one item
  COINS_RESPAWN_DURATION: 30000, // Coin respawn duration after pickup

  /**
   * Enemies
   */

  ENEMY_COUNT: 20, // Enemies coun on map
  ENEMY_HEALTH: 60, // Health
  ENEMY_HEALTH_GROWTH: 0.35, // Health growth by wave number (Quadratic)
  ENEMY_HEALTH_GROWTH_RETARDATION_LEVEL: 12, // Level for health growth retardation
  ENEMY_ARMOUR: 60, // Armour
  ENEMY_ARMOUR_GROWTH: 0.35, // Armour growth by wave number (Quadratic)
  ENEMY_ARMOUR_GROWTH_RETARDATION_LEVEL: 12, // Level for armour growth retardation
  ENEMY_SPEED: 60, // Movement speed
  ENEMY_SPEED_GROWTH: 0.06, // Speed growth by wave number (Linear)
  ENEMY_SPEED_GROWTH_MAX_LEVEL: 15, // Level for limit speed growth
  ENEMY_DAMAGE: 90, // Attack damage
  ENEMY_DAMAGE_GROWTH: 0.32, // Damage growth by wave number (Linear)
};
