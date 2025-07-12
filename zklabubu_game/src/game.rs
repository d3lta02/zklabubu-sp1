use web_sys::{CanvasRenderingContext2d, KeyboardEvent, HtmlImageElement, HtmlAudioElement};
use crate::console_log;
use crate::entities::{Labubu, FallingItem, FallingItemType};
use crate::utils::random;

// Game states - public so lib.rs can access them
#[derive(PartialEq, Debug, Clone, Copy)]
pub enum GameState {
    NotStarted,
    Playing,
    Paused,
    GameOver,
}

// Main game structure
pub struct Game {
    width: f64,
    height: f64,
    state: GameState,
    ctx: CanvasRenderingContext2d,
    labubu: Labubu,
    falling_items: Vec<FallingItem>,
    last_item_spawn_time: f64,
    spawn_interval: f64,
    score: u32,        // real score (used for proof)
    visual_score: u32, // visual score (used for UI)
    lives: u32,
    game_over: bool,
    difficulty_multiplier: f64,
    elapsed_time: f64,
    
    // Power-ups
    shield_active_until: Option<f64>,
    double_points_active_until: Option<f64>,
    slowdown_active_until: Option<f64>, // New slowdown power-up
    powerup_due: bool,
    
    // Images
    yellow_egg_img: HtmlImageElement,
    pink_egg_img: HtmlImageElement,
    purple_egg_img: HtmlImageElement,
    rock_img: HtmlImageElement,
    shield_img: HtmlImageElement,
    double_points_img: HtmlImageElement,
    extra_life_img: HtmlImageElement,
    slowdown_img: HtmlImageElement, // New slowdown image
    labubu_shield_img: HtmlImageElement,
    labubu_double_img: HtmlImageElement,
    
    // Sounds
    egg_sound: HtmlAudioElement,
    rock_sound: HtmlAudioElement,
    shield_hit_sound: HtmlAudioElement, // Shield hit sound
    
    // Sound status
    sound_enabled: bool,
    
    // Last collected item for SP1
    last_collected_item: Option<FallingItemType>,
}

impl Game {
    // Add extra images to labubu
    #[allow(dead_code)]
    pub fn set_alternate_images(&mut self, shield_img: HtmlImageElement, double_img: HtmlImageElement) {
        // Store alternate labubu images for later use
        self.labubu_shield_img = shield_img;
        self.labubu_double_img = double_img;
    }
    
    pub fn new(
        width: f64,
        height: f64,
        ctx: CanvasRenderingContext2d,
        labubu_img: HtmlImageElement,
        labubu_shield_img: HtmlImageElement,
        labubu_double_img: HtmlImageElement,
        yellow_egg_img: HtmlImageElement,
        pink_egg_img: HtmlImageElement,
        purple_egg_img: HtmlImageElement,
        rock_img: HtmlImageElement,
        shield_img: HtmlImageElement,
        double_points_img: HtmlImageElement,
        extra_life_img: HtmlImageElement,
        slowdown_img: HtmlImageElement,
        egg_sound: HtmlAudioElement,
        rock_sound: HtmlAudioElement,
        shield_hit_sound: HtmlAudioElement,
    ) -> Self {
        let labubu = Labubu::new(width, height, labubu_img);
        
        Game {
            width,
            height,
            state: GameState::NotStarted,
            ctx,
            labubu,
            falling_items: vec![],
            last_item_spawn_time: 0.0,
            spawn_interval: 1.2, // Initially spawn an item every 1.2 seconds
            score: 0,
            visual_score: 0,
            lives: 3,
            game_over: false,
            difficulty_multiplier: 1.0,
            elapsed_time: 0.0,
            shield_active_until: None,
            double_points_active_until: None,
            slowdown_active_until: None,
            powerup_due: false,
            yellow_egg_img,
            pink_egg_img,
            purple_egg_img,
            rock_img,
            shield_img,
            double_points_img,
            extra_life_img,
            slowdown_img,
            labubu_shield_img,
            labubu_double_img,
            egg_sound,
            rock_sound,
            shield_hit_sound,
            sound_enabled: true, // Sound is on by default
            last_collected_item: None,
        }
    }
    
    // Set sound status
    pub fn set_sound_enabled(&mut self, enabled: bool) {
        self.sound_enabled = enabled;
        console_log!("Game sound status: {}", if enabled { "on" } else { "off" });
    }
    
    // Handle keyboard input
    pub fn handle_key_press(&mut self, event: KeyboardEvent) {
        if matches!(self.state, GameState::Playing) {
            let key = event.key();
            match key.as_str() {
                "ArrowLeft" | "a" | "A" => self.labubu.move_left(),
                "ArrowRight" | "d" | "D" => self.labubu.move_right(),
                "p" | "P" => self.toggle_pause(),
                _ => {}
            }
        }
    }
    
    // Start the game
    pub fn start(&mut self) {
        self.state = GameState::Playing;
        self.game_over = false;
    }
    
    // Stop the game
    pub fn stop(&mut self) {
        self.state = GameState::Paused;
    }
    
    // Toggle pause
    pub fn toggle_pause(&mut self) {
        match self.state {
            GameState::Playing => self.state = GameState::Paused,
            GameState::Paused => self.state = GameState::Playing,
            _ => {}
        }
    }
    
    // Restart the game
    pub fn restart(&mut self) {
        self.labubu.reset(self.width);
        self.falling_items.clear();
        self.score = 0;
        self.lives = 3;
        self.game_over = false;
        self.difficulty_multiplier = 1.0;
        self.elapsed_time = 0.0;
        self.last_item_spawn_time = 0.0; // This line was added
        self.spawn_interval = 1.2;
        self.shield_active_until = None;
        self.double_points_active_until = None;
        self.slowdown_active_until = None; // New field
        self.powerup_due = false;
        self.last_collected_item = None;
        self.state = GameState::Playing;
    }
    
    // Update each frame
    pub fn update(&mut self, delta_time: f64) -> bool {
        // At the beginning of each update, reset last_collected_item
        self.last_collected_item = None;
        
        if !matches!(self.state, GameState::Playing) {
            return self.game_over; // Return true if game is over
        }
        
        self.elapsed_time += delta_time;
        
        // At game start or after restart, immediately start dropping items
        if self.elapsed_time < 0.5 && self.last_item_spawn_time == 0.0 && self.falling_items.is_empty() {
            // Drop an item immediately
            self.spawn_falling_items();
            self.last_item_spawn_time = self.elapsed_time;
        }
        
        // Normal item spawn check
        else if self.elapsed_time - self.last_item_spawn_time > self.spawn_interval {
            self.spawn_falling_items();
            self.last_item_spawn_time = self.elapsed_time;
        }
        
        // Check power-up durations
        if let Some(shield_end_time) = self.shield_active_until {
            if self.elapsed_time >= shield_end_time {
                self.shield_active_until = None;
                console_log!("Shield duration expired!");
            }
        }
        
        if let Some(double_points_end_time) = self.double_points_active_until {
            if self.elapsed_time >= double_points_end_time {
                self.double_points_active_until = None;
                console_log!("2x points duration expired!");
            }
        }
        
        if let Some(slowdown_end_time) = self.slowdown_active_until {
            if self.elapsed_time >= slowdown_end_time {
                self.slowdown_active_until = None;
                console_log!("Slowdown duration expired!");
            }
        }
        
        // Update difficulty level (every 100 points)
        let difficulty_level = if self.score < 500 {
            // Difficulty increases every 100 points up to 500
            (self.score / 100) as f64
        } else {
            // After 500 points, difficulty increases every 500 points
            5.0 + ((self.score - 500) / 500) as f64
        };

        // Calculate difficulty multiplier (40% harder each level)
        let base_multiplier = 1.0 + (difficulty_level * 0.40);

        // If slowdown is active, reduce difficulty
        if self.slowdown_active_until.is_some() {
            self.difficulty_multiplier = base_multiplier * 0.6; // 40% easier
        } else {
            self.difficulty_multiplier = base_multiplier;
        }

        // Update item spawn interval (based on difficulty)
        self.spawn_interval = (1.2 - (difficulty_level * 0.1)).max(0.4); // Minimum 0.4 seconds (increased from 0.3)
        
        // Check for power-up drop every 100 points
        let current_powerup_level = self.score / 100;
        let previous_powerup_level = if self.score > 0 { (self.score - 1) / 100 } else { 0 };
        
        if current_powerup_level > previous_powerup_level {
            console_log!("Power-up time! A power-up drops every 100 points.");
            // Drop a power-up on the next spawn
            self.powerup_due = true;
        }
        
        // Update falling items
        let mut items_to_remove = vec![];
        
        for (i, item) in self.falling_items.iter_mut().enumerate() {
            item.update(delta_time);
            
            // Is it off screen?
            if item.y > self.height {
                items_to_remove.push(i);
            }
            
            // Does it collide with the crab?
                            if item.collides_with(&self.labubu) {
                match item.item_type {
                    FallingItemType::YellowEgg | FallingItemType::PinkEgg | FallingItemType::PurpleEgg => {
                        // Egg collected, add points
                        let base_points = item.get_point_value() as u32;
                        
                        // ADD BASE POINTS TO SCORE (without 2x effect)
                        self.score += base_points;
                        
                        // If 2x points is active, show extra points in visual score
                        if self.double_points_active_until.is_some() {
                            self.visual_score = self.score + base_points; // Show extra points
                        } else {
                            self.visual_score = self.score; // Same as real score
                        }
                        
                        if self.sound_enabled {
                            let _ = self.egg_sound.play().unwrap();
                        }
                        
                        // Save the last collected item
                        self.last_collected_item = Some(item.item_type);
                    },
                    FallingItemType::Rock => {
                        // Hit by a rock, lose a life (if shield not active)
                        if self.shield_active_until.is_none() {
                            if self.lives > 0 {
                                self.lives -= 1;
                                if self.sound_enabled {
                                    let _ = self.rock_sound.play().unwrap();
                                }
                            }
                            
                            if self.lives == 0 {
                                console_log!("Game over! No lives left!");
                                self.game_over = true;
                                self.state = GameState::GameOver;
                                return true; // Game over, return immediately
                            }
                        } else {
                            console_log!("Shield prevented collision!");
                            // Play special sound if shield is active
                            if self.sound_enabled {
                                let _ = self.shield_hit_sound.play().unwrap();
                            }
                        }
                    },
                    FallingItemType::Shield => {
                        // Shield power-up collected
                        self.shield_active_until = Some(self.elapsed_time + 10.0); // 10 seconds of protection
                        console_log!("Shield activated! 10 seconds of protection.");
                        if self.sound_enabled {
                            let _ = self.egg_sound.play().unwrap();
                        }
                    },
                    FallingItemType::DoublePoints => {
                        // 2x points power-up collected
                        self.double_points_active_until = Some(self.elapsed_time + 10.0); // 10 seconds of 2x points
                        console_log!("2x points activated! Will last 10 seconds.");
                        if self.sound_enabled {
                            let _ = self.egg_sound.play().unwrap();
                        }
                    },
                    FallingItemType::ExtraLife => {
                        // Extra life power-up collected
                        if self.lives < 5 { // Maximum 5 lives
                            self.lives += 1;
                            console_log!("Extra life gained! Total lives: {}", self.lives);
                            if self.sound_enabled {
                                let _ = self.egg_sound.play().unwrap();
                            }
                        } else {
                            console_log!("Already at maximum lives!");
                            if self.sound_enabled {
                                let _ = self.egg_sound.play().unwrap();
                            }
                        }
                    },
                    FallingItemType::SlowDown => {
                        // Slowdown power-up collected
                        self.slowdown_active_until = Some(self.elapsed_time + 10.0); // 10 seconds of slowdown
                        console_log!("Slowdown activated! Will last 10 seconds.");
                        if self.sound_enabled {
                            let _ = self.egg_sound.play().unwrap();
                        }
                    },
                }
                
                items_to_remove.push(i);
            }
        }
        
        // Remove items to be deleted (in reverse to preserve indices)
        for i in items_to_remove.iter().rev() {
            self.falling_items.remove(*i);
        }
        
        // Clear and draw
        self.draw();
        
        self.game_over
    }
    
    // Spawn falling items
    fn spawn_falling_items(&mut self) {
        // Determine number of items to drop based on difficulty
        let difficulty_level = (self.score / 100) as usize;
        let max_items = (1 + difficulty_level).min(3); // Maximum 3 items
        
        // Randomly create 1-max_items items
        let num_items = 1 + (random(0.0, max_items as f64) as usize);
        
        // Track which lanes are used
        let mut used_lanes = vec![false; 5];
        
        // If it's time to drop a power-up
        if self.powerup_due {
            // Create a random power-up
            let lane = (random(0.0, 5.0)) as usize;
            used_lanes[lane] = true;
            
            // Determine power-up type
            let mut possible_powerups = vec![
                FallingItemType::Shield,
                FallingItemType::DoublePoints,
                FallingItemType::ExtraLife
            ];
            
            // Add slowdown power-up after 1000 points
            if self.score >= 400 {
                possible_powerups.push(FallingItemType::SlowDown);
            }
            
            // Choose a random power-up
            let rand_index = (random(0.0, possible_powerups.len() as f64)) as usize;
            let powerup_type = possible_powerups[rand_index];
            
            // Select appropriate image for the power-up
            let img = match powerup_type {
                FallingItemType::Shield => self.shield_img.clone(),
                FallingItemType::DoublePoints => self.double_points_img.clone(),
                FallingItemType::ExtraLife => self.extra_life_img.clone(),
                FallingItemType::SlowDown => self.slowdown_img.clone(),
                _ => self.yellow_egg_img.clone(),
            };
            
            let item = FallingItem {
                x: (lane as f64 * (self.width / 5.0)) + ((self.width / 5.0) - 100.0) / 2.0,
                y: -100.0,
                width: 100.0,
                height: 100.0,
                speed: 200.0 * self.difficulty_multiplier,
                item_type: powerup_type,
                lane,
                img,
            };
            
            self.falling_items.push(item);
            self.powerup_due = false;
            
            console_log!("Power-up dropped: {:?}", powerup_type);
        }
        
        for _ in 0..num_items {
            // Choose an unused random lane
            let mut available_lanes = Vec::new();
            for lane in 0..5 {
                if !used_lanes[lane] {
                    available_lanes.push(lane);
                }
            }
            
            // Exit if all lanes are used
            if available_lanes.is_empty() {
                break;
            }
            
            // Choose a random unused lane
            let lane_index = (random(0.0, available_lanes.len() as f64)) as usize;
            let selected_lane = available_lanes[lane_index];
            used_lanes[selected_lane] = true;
            
            // Create a new falling item in the selected lane
            let mut item = FallingItem::new(
                self.width,
                self.difficulty_multiplier,
                self.yellow_egg_img.clone(),
                self.pink_egg_img.clone(),
                self.purple_egg_img.clone(),
                self.rock_img.clone(),
            );
            
            // Place the item in the selected lane
            let lane_width = self.width / 5.0;
            item.lane = selected_lane;
            item.x = (selected_lane as f64 * lane_width) + (lane_width - item.width) / 2.0;
            
            self.falling_items.push(item);
        }
    }
    
    // Draw the game
    fn draw(&self) {
        // Clear the screen
        self.ctx.clear_rect(0.0, 0.0, self.width, self.height);
        
        // Draw falling items
        for item in &self.falling_items {
            item.draw(&self.ctx);
        }
        
        // Determine which labubu image to use
        let labubu_img_to_use = if self.shield_active_until.is_some() {
            &self.labubu_shield_img
        } else if self.double_points_active_until.is_some() {
            &self.labubu_double_img
        } else {
            &self.labubu.img
        };
        
        // Draw the labubu
        self.ctx.draw_image_with_html_image_element_and_dw_and_dh(
            labubu_img_to_use,
            self.labubu.x,
            self.labubu.y,
            self.labubu.width,
            self.labubu.height,
        ).unwrap();
        
        // Show active power-ups
        let mut y_offset = 50.0;
        
        if let Some(shield_end_time) = self.shield_active_until {
            let remaining = (shield_end_time - self.elapsed_time).max(0.0);
            self.ctx.set_fill_style(&"rgba(100, 100, 255, 0.7)".into());
            self.ctx.fill_rect(10.0, y_offset, 30.0, 30.0);
            self.ctx.set_font("16px Arial");
            self.ctx.set_fill_style(&"white".into());
            self.ctx.fill_text(&format!("Shield: {:.1}s", remaining), 50.0, y_offset + 20.0).unwrap();
            
            // Draw a ring around the labubu if shield is active
            self.ctx.set_stroke_style(&"rgba(100, 100, 255, 0.7)".into());
            self.ctx.set_line_width(3.0);
            self.ctx.begin_path();
            self.ctx.arc(
                self.labubu.x + self.labubu.width / 2.0,
                self.labubu.y + self.labubu.height / 2.0,
                self.labubu.width / 2.0 + 10.0,
                0.0,
                std::f64::consts::PI * 2.0,
            ).unwrap();
            self.ctx.stroke();
            
            y_offset += 40.0;
        }
        
        if let Some(double_points_end_time) = self.double_points_active_until {
            let remaining = (double_points_end_time - self.elapsed_time).max(0.0);
            self.ctx.set_fill_style(&"rgba(255, 100, 100, 0.7)".into());
            self.ctx.fill_rect(10.0, y_offset, 30.0, 30.0);
            self.ctx.set_font("16px Arial");
            self.ctx.set_fill_style(&"white".into());
            self.ctx.fill_text(&format!("2x Points: {:.1}s", remaining), 50.0, y_offset + 20.0).unwrap();
            
            y_offset += 40.0;
        }
        
        if let Some(slowdown_end_time) = self.slowdown_active_until {
            let remaining = (slowdown_end_time - self.elapsed_time).max(0.0);
            self.ctx.set_fill_style(&"rgba(100, 255, 100, 0.7)".into());
            self.ctx.fill_rect(10.0, y_offset, 30.0, 30.0);
            self.ctx.set_font("16px Arial");
            self.ctx.set_fill_style(&"white".into());
            self.ctx.fill_text(&format!("Slowdown: {:.1}s", remaining), 50.0, y_offset + 20.0).unwrap();
        }
    }
    
    // Get the score
    pub fn get_score(&self) -> u32 {
        self.score
    }
    
    // Get the visual score (for UI)
    #[allow(dead_code)]
    pub fn get_visual_score(&self) -> u32 {
        self.visual_score
    }
    
    // Get the lives
    pub fn get_lives(&self) -> u32 {
        self.lives
    }
    
    // Is the game over?
    pub fn is_game_over(&self) -> bool {
        self.game_over
    }
    
    // Get the game state
    pub fn get_state(&self) -> GameState {
        self.state
    }
    
    // Get the last collected item
    pub fn get_last_collected_item(&self) -> Option<FallingItemType> {
        self.last_collected_item
    }
    
    // Get the elapsed time
    pub fn get_elapsed_time(&self) -> f64 {
        self.elapsed_time
    }
}