use alloy_sol_types::sol;

sol! {
    /// Structure containing game results that can be easily deserialized by Solidity.
    struct PublicValuesStruct {
        uint32 score;
        uint32 yellowEggs;
        uint32 pinkEggs;
        uint32 purpleEggs;
        uint32 gameTime;
        uint32 lives;
    }
}

/// Function to calculate score based on egg types
pub fn calculate_score(yellow_eggs: u32, blue_eggs: u32, purple_eggs: u32) -> u32 {
    (yellow_eggs * 5) + (blue_eggs * 10) + (purple_eggs * 20)
}

/// Calculates total number of eggs
pub fn total_eggs(yellow_eggs: u32, blue_eggs: u32, purple_eggs: u32) -> u32 {
    yellow_eggs + blue_eggs + purple_eggs
}