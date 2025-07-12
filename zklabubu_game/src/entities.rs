use web_sys::{CanvasRenderingContext2d, HtmlImageElement};
use crate::utils::random;

// Falling item types
#[derive(Clone, Copy, PartialEq, Debug)]
pub enum FallingItemType {
    YellowEgg,  // 5 points, 45% probability
    PinkEgg,    // 10 points, 20% probability
    PurpleEgg,  // 20 points, 10% probability
    Rock,        // Obstacle, 25% probability
    Shield,      // 10 seconds of protection
    DoublePoints, // 10 seconds of 2x points
    ExtraLife,   // Extra life
    SlowDown,    // Slow down - after 1000 points
}

// Labubu player character
pub struct Labubu {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub position_index: usize,  // Position 0-4
    pub positions: Vec<f64>,    // 5 possible X positions
    pub img: HtmlImageElement,
}

impl Labubu {
    pub fn new(canvas_width: f64, canvas_height: f64, img: HtmlImageElement) -> Self {
        let width = 128.0;
        let height = 128.0;
        
        // Calculate 5 possible positions
        let lanes = 5;
        let lane_width = canvas_width / lanes as f64;
        let positions = (0..lanes)
            .map(|i| (i as f64 * lane_width) + (lane_width - width) / 2.0)
            .collect();
        
        Labubu {
            x: canvas_width / 2.0 - width / 2.0,
            y: canvas_height - height - 10.0,
            width,
            height,
            position_index: 2, // Start in the middle
            positions,
            img,
        }
    }
    
    // Move left
    pub fn move_left(&mut self) {
        if self.position_index > 0 {
            self.position_index -= 1;
            self.x = self.positions[self.position_index];
        }
    }
    
    // Move right
    pub fn move_right(&mut self) {
        if self.position_index < self.positions.len() - 1 {
            self.position_index += 1;
            self.x = self.positions[self.position_index];
        }
    }
    
    // Draw the labubu
    #[allow(dead_code)]
    pub fn draw(&self, ctx: &CanvasRenderingContext2d) {
        ctx.draw_image_with_html_image_element_and_dw_and_dh(
            &self.img,
            self.x,
            self.y,
            self.width,
            self.height,
        ).unwrap();
    }
    
    // Reset the labubu (when game restarts)
    pub fn reset(&mut self, _canvas_width: f64) {
        self.position_index = 2;
        self.x = self.positions[self.position_index];
    }
}

// Falling items (eggs and rocks)
pub struct FallingItem {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub speed: f64,
    pub item_type: FallingItemType,
    pub lane: usize,
    pub img: HtmlImageElement,
}

impl FallingItem {
    pub fn new(
        canvas_width: f64, 
        speed_multiplier: f64,
        yellow_egg_img: HtmlImageElement,
        pink_egg_img: HtmlImageElement,
        purple_egg_img: HtmlImageElement,
        rock_img: HtmlImageElement,
    ) -> Self {
        let width = 100.0;
        let height = 100.0;
        
        // Choose a random lane (0-4)
        let lanes = 5;
        let lane = (random(0.0, lanes as f64).floor()) as usize;
        let lane_width = canvas_width / lanes as f64;
        let x = (lane as f64 * lane_width) + (lane_width - width) / 2.0;
        
        // Determine the item type based on probabilities
        let rand = random(0.0, 1.0);
        let (item_type, img) = if rand < 0.45 {
            // 45% chance for yellow egg
            (FallingItemType::YellowEgg, yellow_egg_img)
        } else if rand < 0.65 {
            // 20% chance for pink egg
            (FallingItemType::PinkEgg, pink_egg_img)
        } else if rand < 0.75 {
            // 10% chance for purple egg
            (FallingItemType::PurpleEgg, purple_egg_img)
        } else {
            // 25% chance for rock
            (FallingItemType::Rock, rock_img)
        };
        
        // Base speed + difficulty multiplier
        let base_speed = 200.0;
        let speed = base_speed * speed_multiplier;
        
        FallingItem {
            x,
            y: -height,
            width,
            height,
            speed,
            item_type,
            lane,
            img,
        }
    }
    
    // Update the item
    pub fn update(&mut self, delta_time: f64) {
        self.y += self.speed * delta_time;
    }
    
    // Draw the item
    pub fn draw(&self, ctx: &CanvasRenderingContext2d) {
        ctx.draw_image_with_html_image_element_and_dw_and_dh(
            &self.img,
            self.x,
            self.y,
            self.width,
            self.height,
        ).unwrap();
    }
    
    // Collision detection
    pub fn collides_with(&self, labubu: &Labubu) -> bool {
        let labubu_hitbox_reduction = 30.0; // Adjust collision detection sensitivity
        
        !(self.x + self.width < labubu.x + labubu_hitbox_reduction || 
          self.x > labubu.x + labubu.width - labubu_hitbox_reduction || 
          self.y + self.height < labubu.y + labubu_hitbox_reduction || 
          self.y > labubu.y + labubu.height - labubu_hitbox_reduction)
    }
    
    // Get point value based on item type
    pub fn get_point_value(&self) -> i32 {
        match self.item_type {
            FallingItemType::YellowEgg => 5,
            FallingItemType::PinkEgg => 10,
            FallingItemType::PurpleEgg => 20,
            FallingItemType::Rock => 0, // Rocks don't give points
            FallingItemType::Shield => 0, // Power-ups don't give points
            FallingItemType::DoublePoints => 0, // Power-ups don't give points
            FallingItemType::ExtraLife => 0, // Power-ups don't give points
            FallingItemType::SlowDown => 0, // Power-ups don't give points
        }
    }
    
    // Is the item an egg?
    #[allow(dead_code)]
    pub fn is_egg(&self) -> bool {
        match self.item_type {
            FallingItemType::YellowEgg | FallingItemType::PinkEgg | FallingItemType::PurpleEgg => true,
            FallingItemType::Rock | FallingItemType::Shield | FallingItemType::DoublePoints | 
            FallingItemType::ExtraLife | FallingItemType::SlowDown => false,
        }
    }
}